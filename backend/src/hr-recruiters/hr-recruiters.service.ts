import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class HrRecruitersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async findAll(query?: { status?: string; search?: string; agencyId?: string; page?: string; limit?: string }) {
    const where: any = {}
    if (query?.status) where.status = query.status
    if (query?.agencyId) where.agencyId = query.agencyId
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { designation: { contains: query.search, mode: 'insensitive' } },
        { employeeId: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const page = Math.max(1, parseInt(query?.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query?.limit || '20')))
    const skip = (page - 1) * limit

    const [recruiters, total] = await Promise.all([
      this.prisma.hRRecruiter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          agency: { select: { agencyName: true, logo: true } },
          _count: { select: { assignments: true, interviews: true } },
        },
      }),
      this.prisma.hRRecruiter.count({ where }),
    ])

    return { recruiters, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({
      where: { id },
      include: {
        agency: { select: { agencyName: true, logo: true, email: true } },
        assignments: {
          include: {
            requirement: { select: { id: true, position: true, location: true, status: true } },
          },
        },
        interviews: {
          select: {
            id: true,
            jobTitle: true,
            candidateName: true,
            date: true,
            status: true,
            type: true,
          },
        },
      },
    })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return recruiter
  }

  async create(dto: any) {
    const existing = await this.prisma.hRRecruiter.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    if (dto.username) {
      const usernameExists = await this.prisma.hRRecruiter.findUnique({ where: { username: dto.username } })
      if (usernameExists) throw new ConflictException('Username already taken')
    }

    const count = await this.prisma.hRRecruiter.count()
    const employeeId = dto.employeeId || `HRTK${String(count + 1).padStart(6, '0')}`
    const password = dto.password || Math.random().toString(36).slice(-12) + 'A1!'

    const recruiter = await this.prisma.hRRecruiter.create({
      data: {
        employeeId,
        name: dto.name || `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: await bcrypt.hash(password, 10),
        phone: dto.phone,
        photo: dto.photo,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        company: dto.company,
        branch: dto.branch,
        department: dto.department,
        designation: dto.designation,
        reportingManager: dto.reportingManager,
        hiringManager: dto.hiringManager,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        employmentType: dto.employmentType,
        experience: dto.experience,
        preferredIndustry: dto.preferredIndustry,
        preferredJobRoles: dto.preferredJobRoles,
        preferredLocations: dto.preferredLocations,
        languages: dto.languages,
        skills: dto.skills,
        certifications: dto.certifications,
        linkedIn: dto.linkedIn,
        github: dto.github,
        portfolio: dto.portfolio,
        username: dto.username,
        resumeUrl: dto.resumeUrl,
        status: dto.status || 'pending',
        agencyId: dto.agencyId,
      },
    })

    try {
      await this.mailService.sendHrRecruiterWelcomeEmail(recruiter.email, {
        name: recruiter.name,
        employeeId: recruiter.employeeId,
        email: recruiter.email,
        password,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hr/login`,
      })
    } catch {}

    return recruiter
  }

  async update(id: string, dto: any) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')

    if (dto.email && dto.email !== recruiter.email) {
      const existing = await this.prisma.hRRecruiter.findUnique({ where: { email: dto.email } })
      if (existing) throw new ConflictException('Email already in use')
    }

    if (dto.username && dto.username !== recruiter.username) {
      const existing = await this.prisma.hRRecruiter.findUnique({ where: { username: dto.username } })
      if (existing) throw new ConflictException('Username already taken')
    }

    const data: any = {}
    const fields = ['name', 'firstName', 'lastName', 'email', 'phone', 'photo', 'dateOfBirth', 'gender',
      'company', 'branch', 'department', 'designation', 'reportingManager', 'hiringManager', 'joiningDate',
      'employmentType', 'experience', 'preferredIndustry', 'preferredJobRoles', 'preferredLocations',
      'languages', 'skills', 'certifications', 'linkedIn', 'github', 'portfolio', 'username',
      'resumeUrl', 'status', 'agencyId', 'suspensionReason']
    for (const field of fields) {
      if (dto[field] !== undefined) {
        if (field === 'dateOfBirth' || field === 'joiningDate') {
          data[field] = new Date(dto[field])
        } else {
          data[field] = dto[field]
        }
      }
    }
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10)

    return this.prisma.hRRecruiter.update({ where: { id }, data })
  }

  async remove(id: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return this.prisma.hRRecruiter.update({ where: { id }, data: { status: 'inactive' } })
  }

  async approve(id: string, adminName: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return this.prisma.hRRecruiter.update({
      where: { id },
      data: { status: 'active', approvedBy: adminName, approvedAt: new Date() },
    })
  }

  async reject(id: string, reason: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return this.prisma.hRRecruiter.update({
      where: { id },
      data: { status: 'rejected', suspensionReason: reason },
    })
  }

  async suspend(id: string, reason: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return this.prisma.hRRecruiter.update({
      where: { id },
      data: { status: 'suspended', suspensionReason: reason },
    })
  }

  async reactivate(id: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    return this.prisma.hRRecruiter.update({
      where: { id },
      data: { status: 'active', suspensionReason: null },
    })
  }

  async resetPassword(id: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    const newPassword = Math.random().toString(36).slice(-12) + 'A1!'
    await this.prisma.hRRecruiter.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    })
    try {
      await this.mailService.sendPasswordResetEmail(recruiter.email, {
        name: recruiter.name,
        newPassword,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hr/login`,
      })
    } catch {}
    return { message: 'Password reset. Email sent.' }
  }

  async assignAgency(id: string, agencyId: string) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { id } })
    if (!recruiter) throw new NotFoundException('HR Recruiter not found')
    const company = await this.prisma.company.findUnique({ where: { id: agencyId } })
    if (!company) throw new NotFoundException('Agency not found')
    return this.prisma.hRRecruiter.update({
      where: { id },
      data: { agencyId, company: company.agencyName },
    })
  }

  async getPerformance() {
    const recruiters = await this.prisma.hRRecruiter.findMany({
      where: { status: 'active' },
      include: { _count: { select: { assignments: true, interviews: true } } },
      orderBy: { placements: 'desc' },
    })

    const stats = {
      total: await this.prisma.hRRecruiter.count(),
      active: await this.prisma.hRRecruiter.count({ where: { status: 'active' } }),
      pending: await this.prisma.hRRecruiter.count({ where: { status: 'pending' } }),
      suspended: await this.prisma.hRRecruiter.count({ where: { status: 'suspended' } }),
      totalAssignments: await this.prisma.recruiterAssignment.count(),
      totalInterviews: await this.prisma.interview.count(),
    }

    const leaderboard = recruiters.map((r) => ({
      id: r.id,
      name: r.name,
      photo: r.photo,
      email: r.email,
      company: r.company,
      department: r.department,
      designation: r.designation,
      assignedJobs: r.assignedJobs,
      assignedCandidates: r.assignedCandidates,
      interviewsCount: r.interviewsCount,
      offersReleased: r.offersReleased,
      placements: r.placements,
      conversionRate: r.conversionRate,
      _count: r._count,
    }))

    return { stats, leaderboard }
  }

  async findByEmail(email: string) {
    return this.prisma.hRRecruiter.findUnique({ where: { email } })
  }

  async login(dto: { email: string; password: string }) {
    const recruiter = await this.prisma.hRRecruiter.findUnique({ where: { email: dto.email } })
    if (!recruiter) throw new UnauthorizedException('Invalid credentials')
    const valid = await bcrypt.compare(dto.password, recruiter.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')
    if (recruiter.status === 'inactive' || recruiter.status === 'suspended') {
      throw new UnauthorizedException('Account is inactive. Contact admin.')
    }
    await this.prisma.hRRecruiter.update({
      where: { id: recruiter.id },
      data: { lastLogin: new Date() },
    })
    return this.generateToken(recruiter)
  }

  async googleLogin(dto: { googleId: string; email: string; name: string; photo?: string }) {
    let recruiter = await this.prisma.hRRecruiter.findFirst({
      where: { OR: [{ googleId: dto.googleId }, { email: dto.email }] },
    })
    if (recruiter) {
      if (!recruiter.googleId) {
        recruiter = await this.prisma.hRRecruiter.update({
          where: { id: recruiter.id },
          data: { googleId: dto.googleId, photo: dto.photo || recruiter.photo, lastLogin: new Date() },
        })
      } else {
        await this.prisma.hRRecruiter.update({
          where: { id: recruiter.id },
          data: { lastLogin: new Date() },
        })
      }
    } else {
      const count = await this.prisma.hRRecruiter.count()
      const employeeId = `HRTK${String(count + 1).padStart(6, '0')}`
      const generatedPassword = Math.random().toString(36).slice(-12)
      recruiter = await this.prisma.hRRecruiter.create({
        data: {
          employeeId,
          name: dto.name,
          email: dto.email,
          passwordHash: await bcrypt.hash(generatedPassword, 10),
          photo: dto.photo,
          googleId: dto.googleId,
          status: 'active',
        },
      })
    }
    return this.generateToken(recruiter)
  }

  private generateToken(recruiter: any) {
    const payload = { sub: recruiter.id, email: recruiter.email, role: 'hr_recruiter' }
    return {
      accessToken: this.jwtService.sign(payload),
      recruiter: {
        id: recruiter.id,
        employeeId: recruiter.employeeId,
        name: recruiter.name,
        email: recruiter.email,
        phone: recruiter.phone,
        photo: recruiter.photo,
        company: recruiter.company,
        department: recruiter.department,
        designation: recruiter.designation,
        role: 'hr_recruiter',
      },
    }
  }
}
