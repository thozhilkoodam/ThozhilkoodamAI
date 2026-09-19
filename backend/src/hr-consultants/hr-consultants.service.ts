import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

@Injectable()
export class HrConsultantsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async findAll(query: any, user?: any) {
    const where: any = {}
    if (query.status) where.status = query.status
    if (user?.role === 'recruitment_agency') where.agencyId = user.id
    else if (query.agencyId) where.agencyId = query.agencyId
    return this.prisma.hRConsultant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const consultant = await this.prisma.hRConsultant.findUnique({
      where: { id },
      include: {
        assignments: true,
        candidates: { take: 5, orderBy: { createdAt: 'desc' } },
        interviews: { take: 5, orderBy: { interviewDate: 'desc' } },
      },
    })
    if (!consultant) throw new NotFoundException('HR Consultant not found')
    return consultant
  }

  async create(dto: {
    name: string
    email: string
    phone?: string
    agencyId?: string
    agencyName?: string
    department?: string
    designation?: string
    fullName?: string
    mobile?: string
    status?: string
    employmentType?: string
  }, user?: any) {
    if (user?.role === 'recruitment_agency') {
      dto.agencyId = user.id
      dto.agencyName = user.name
    }

    if (!dto.agencyId) throw new BadRequestException('Agency is required')

    const agency = await this.prisma.company.findUnique({ where: { id: dto.agencyId } })
    if (!agency || agency.status !== 'approved') {
      throw new ForbiddenException('Only approved recruitment agencies can create HR consultants')
    }

    const name = dto.name || dto.fullName
    if (!name || !dto.email) throw new BadRequestException('Full name and email are required')

    const existing = await this.prisma.hRConsultant.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const count = await this.prisma.hRConsultant.count()
    const employeeId = `HCTK${String(count + 1).padStart(6, '0')}`
    const activationToken = randomBytes(32).toString('hex')
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const consultant = await this.prisma.hRConsultant.create({
      data: {
        employeeId,
        name,
        email: dto.email,
        passwordHash: await bcrypt.hash(randomBytes(18).toString('hex'), 10),
        phone: dto.phone || dto.mobile,
        agencyId: dto.agencyId,
        agencyName: agency.agencyName || dto.agencyName,
        department: dto.department,
        designation: dto.designation,
        branch: (dto as any).branch,
        reportingManager: (dto as any).reportingManager,
        hiringManager: (dto as any).hiringManager,
        experience: (dto as any).experience,
        preferredIndustries: (dto as any).preferredIndustry || (dto as any).preferredIndustries,
        preferredJobRoles: (dto as any).preferredJobRoles,
        preferredLocations: (dto as any).preferredLocations,
        skills: (dto as any).skills,
        languages: (dto as any).languages,
        linkedInUrl: (dto as any).linkedIn || (dto as any).linkedInUrl,
        githubUrl: (dto as any).github || (dto as any).githubUrl,
        portfolioUrl: (dto as any).portfolio || (dto as any).portfolioUrl,
        photo: (dto as any).photo,
      },
    })

    await this.prisma.$executeRaw`
      UPDATE "hr_consultants"
      SET "activation_token" = ${activationToken},
          "activation_expires" = ${activationExpires},
          "status" = 'pending_activation'::"ConsultantStatus"
      WHERE "id" = ${consultant.id}
    `

    await this.mailService.sendHrConsultantInvitation(consultant.email, {
      consultantName: consultant.name,
      agencyName: agency.agencyName,
      employeeId: consultant.employeeId,
      activationToken,
    })

    return consultant
  }

  async signup(dto: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword?: string
  }) {
    if (!dto.name || !dto.email || !dto.password) {
      throw new BadRequestException('Name, email, and password are required')
    }
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters')
    }
    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match')
    }

    const existing = await this.prisma.hRConsultant.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const count = await this.prisma.hRConsultant.count()
    const employeeId = `HCTK${String(count + 1).padStart(6, '0')}`

    return this.prisma.hRConsultant.create({
      data: {
        employeeId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        status: 'active',
      },
    })
  }

  async getActivation(token: string) {
    const consultants = await this.prisma.$queryRaw<any[]>`
      SELECT "employee_id" AS "employeeId", "email", "name", "activation_expires" AS "activationExpires"
      FROM "hr_consultants"
      WHERE "activation_token" = ${token}
      LIMIT 1
    `
    const consultant = consultants[0]
    if (!consultant || !consultant.activationExpires || consultant.activationExpires < new Date()) {
      throw new NotFoundException('Activation link is invalid or expired')
    }
    return {
      employeeId: consultant.employeeId,
      email: consultant.email,
      name: consultant.name,
    }
  }

  async activate(dto: { token: string; password: string; confirmPassword: string; acceptTerms: boolean }) {
    if (!dto.acceptTerms) throw new BadRequestException('You must accept the terms')
    if (!dto.password || dto.password.length < 8) throw new BadRequestException('Password must be at least 8 characters')
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('Passwords do not match')

    const consultants = await this.prisma.$queryRaw<any[]>`
      SELECT "id", "activation_expires" AS "activationExpires"
      FROM "hr_consultants"
      WHERE "activation_token" = ${dto.token}
      LIMIT 1
    `
    const consultant = consultants[0]
    if (!consultant || !consultant.activationExpires || consultant.activationExpires < new Date()) {
      throw new NotFoundException('Activation link is invalid or expired')
    }

    const activated = await this.prisma.hRConsultant.update({
      where: { id: consultant.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, 10),
        status: 'active',
      },
    })
    await this.prisma.$executeRaw`
      UPDATE "hr_consultants"
      SET "activation_token" = NULL,
          "activation_expires" = NULL
      WHERE "id" = ${consultant.id}
    `
    return activated
  }

  async update(id: string, dto: any) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { id } })
    if (!consultant) throw new NotFoundException('HR Consultant not found')

    const data: any = {}
    const fields = [
      'name', 'email', 'phone', 'photo', 'agencyId', 'agencyName',
      'branch', 'department', 'designation', 'reportingManager', 'hiringManager',
      'experience', 'specialization', 'preferredIndustries', 'preferredJobRoles',
      'preferredLocations', 'languages', 'skills', 'certifications', 'achievements',
      'resumeUrl', 'linkedInUrl', 'githubUrl', 'portfolioUrl',
    ]
    for (const f of fields) {
      if (dto[f] !== undefined) data[f] = dto[f]
    }
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.status) data.status = dto.status

    return this.prisma.hRConsultant.update({ where: { id }, data })
  }

  async remove(id: string) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { id } })
    if (!consultant) throw new NotFoundException('HR Consultant not found')
    return this.prisma.hRConsultant.update({ where: { id }, data: { status: 'inactive' } })
  }

  async getProfile(id: string) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { id } })
    if (!consultant) throw new NotFoundException('HR Consultant not found')
    return consultant
  }

  async updateProfile(id: string, dto: any) {
    return this.update(id, dto)
  }

  async getDashboard(id: string) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { id } })
    if (!consultant) throw new NotFoundException('Consultant not found')

    const candidates = await this.prisma.candidateV2.findMany({ where: { consultantId: id } })
    const interviews = await this.prisma.interviewV2.findMany({ where: { consultantId: id } })
    const assignments = await this.prisma.consultantAssignment.findMany({ where: { consultantId: id } })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      stats: {
        assignedJobs: assignments.length,
        openPositions: assignments.filter(a => !a.assignedAt).length,
        activeCandidates: candidates.filter(c => c.status !== 'rejected' && c.status !== 'joined').length,
        todayInterviews: interviews.filter(i => new Date(i.interviewDate) >= today && new Date(i.interviewDate) < new Date(today.getTime() + 86400000)).length,
        pendingInterviews: interviews.filter(i => i.result === 'pending').length,
        offersReleased: candidates.filter(c => c.status === 'offer_released' || c.status === 'offer_accepted').length,
        joinedCandidates: candidates.filter(c => c.status === 'joined').length,
        rejectedCandidates: candidates.filter(c => c.status === 'rejected').length,
        performanceScore: consultant.performanceScore || 0,
        monthlyPlacements: candidates.filter(c => c.status === 'joined' && new Date(c.createdAt).getMonth() === new Date().getMonth()).length,
      },
      recentCandidates: candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
      upcomingInterviews: interviews.filter(i => new Date(i.interviewDate) >= new Date()).sort((a, b) => a.interviewDate.getTime() - b.interviewDate.getTime()).slice(0, 5),
    }
  }

  async getRequirements(id: string, query: any) {
    const assignments = await this.prisma.consultantAssignment.findMany({
      where: { consultantId: id },
      orderBy: { assignedAt: 'desc' },
    })
    return assignments
  }

  async getCandidates(id: string, query: any) {
    const where: any = { consultantId: id }
    if (query.status) where.status = query.status
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { skills: { contains: query.search, mode: 'insensitive' } },
        { currentCompany: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    return this.prisma.candidateV2.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { experiences: true, skillsList: true, certificates: true, pipeline: { orderBy: { movedAt: 'desc' } } },
    })
  }

  async getCandidate(id: string, candidateId: string) {
    const candidate = await this.prisma.candidateV2.findFirst({
      where: { id: candidateId, consultantId: id },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        skillsList: true,
        certificates: true,
        pipeline: { orderBy: { movedAt: 'desc' } },
        interviews: { orderBy: { interviewDate: 'desc' } },
      },
    })
    if (!candidate) throw new NotFoundException('Candidate not found')
    return candidate
  }

  async createCandidate(id: string, dto: any) {
    return this.prisma.candidateV2.create({
      data: {
        consultantId: id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        photo: dto.photo,
        designation: dto.designation,
        currentCompany: dto.currentCompany,
        experience: dto.experience,
        skills: dto.skills,
        education: dto.education,
        location: dto.location,
        currentCtc: dto.currentCtc ? parseFloat(dto.currentCtc) : null,
        expectedCtc: dto.expectedCtc ? parseFloat(dto.expectedCtc) : null,
        noticePeriod: dto.noticePeriod,
        resumeUrl: dto.resumeUrl,
        documents: dto.documents,
        comments: dto.comments,
        source: dto.source || 'manual',
        status: dto.status || 'applied',
      },
    })
  }

  async updateCandidate(id: string, candidateId: string, dto: any) {
    const candidate = await this.prisma.candidateV2.findFirst({ where: { id: candidateId, consultantId: id } })
    if (!candidate) throw new NotFoundException('Candidate not found')
    return this.prisma.candidateV2.update({ where: { id: candidateId }, data: dto })
  }

  async movePipeline(id: string, candidateId: string, stage: string) {
    const candidate = await this.prisma.candidateV2.findFirst({ where: { id: candidateId, consultantId: id } })
    if (!candidate) throw new NotFoundException('Candidate not found')

    await this.prisma.candidatePipelineV2.create({
      data: { candidateId, stage, movedBy: id },
    })

    return this.prisma.candidateV2.update({
      where: { id: candidateId },
      data: { status: stage },
    })
  }

  async getInterviews(id: string, query: any) {
    const where: any = { consultantId: id }
    if (query.status) where.result = query.status
    if (query.type) where.interviewType = query.type
    return this.prisma.interviewV2.findMany({
      where,
      orderBy: { interviewDate: 'desc' },
      include: { candidate: true },
    })
  }

  async createInterview(id: string, dto: any) {
    return this.prisma.interviewV2.create({
      data: {
        consultantId: id,
        candidateId: dto.candidateId,
        candidateName: dto.candidateName,
        companyName: dto.companyName,
        position: dto.position,
        interviewType: dto.interviewType || 'online',
        interviewDate: new Date(dto.interviewDate),
        time: dto.time,
        venue: dto.venue,
        meetingLink: dto.meetingLink,
        interviewer: dto.interviewer,
        notes: dto.notes,
      },
    })
  }

  async updateInterview(id: string, interviewId: string, dto: any) {
    const interview = await this.prisma.interviewV2.findFirst({ where: { id: interviewId, consultantId: id } })
    if (!interview) throw new NotFoundException('Interview not found')
    return this.prisma.interviewV2.update({ where: { id: interviewId }, data: dto })
  }

  async getReports(id: string) {
    const candidates = await this.prisma.candidateV2.findMany({ where: { consultantId: id } })
    const interviews = await this.prisma.interviewV2.findMany({ where: { consultantId: id } })

    const monthlyHiring: any[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let m = 0; m < 12; m++) {
      const monthCandidates = candidates.filter(c => new Date(c.createdAt).getMonth() === m)
      monthlyHiring.push({
        month: months[m],
        applications: monthCandidates.length,
        interviews: interviews.filter(i => new Date(i.interviewDate).getMonth() === m).length,
        offers: monthCandidates.filter(c => c.status === 'offer_released' || c.status === 'offer_accepted' || c.status === 'joined').length,
        joined: monthCandidates.filter(c => c.status === 'joined').length,
      })
    }

    const sourceData = this.groupBy(candidates, 'source')
    const stageData = this.groupBy(candidates, 'status')

    return {
      monthlyHiring,
      totalCandidates: candidates.length,
      totalInterviews: interviews.length,
      conversionRate: candidates.length > 0 ? (interviews.length / candidates.length * 100).toFixed(1) : '0',
      offerRate: candidates.length > 0 ? ((candidates.filter(c => c.status === 'joined').length) / candidates.length * 100).toFixed(1) : '0',
      candidatesBySource: Object.entries(sourceData).map(([name, value]) => ({ name, value: (value as any[]).length })),
      candidatesByStage: Object.entries(stageData).map(([name, value]) => ({ name, value: (value as any[]).length })),
    }
  }

  async getBilling(id: string) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { id } })
    return {
      plan: 'Professional',
      status: 'active',
      renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      features: {
        aiMatching: true,
        unlimitedCandidates: true,
        advancedReports: true,
        bulkUpload: false,
        prioritySupport: false,
      },
      invoices: [],
      payments: [],
    }
  }

  async getNotifications(id: string) {
    return this.prisma.consultantNotification.findMany({
      where: { consultantId: id },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markNotificationRead(id: string, notificationId: string) {
    return this.prisma.consultantNotification.update({
      where: { id: notificationId },
      data: { read: true },
    })
  }

  async markAllNotificationsRead(id: string) {
    return this.prisma.consultantNotification.updateMany({
      where: { consultantId: id, read: false },
      data: { read: true },
    })
  }

  async getActivity(id: string) {
    return this.prisma.consultantActivityLog.findMany({
      where: { consultantId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  async login(dto: { email: string; password: string }) {
    const consultant = await this.prisma.hRConsultant.findUnique({ where: { email: dto.email } })
    if (!consultant) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, consultant.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if ((consultant.status as string) === 'pending_activation') {
      throw new UnauthorizedException('Please activate your account before logging in.')
    }
    if (consultant.status === 'inactive' || consultant.status === 'suspended') {
      throw new UnauthorizedException('Account is inactive. Contact admin.')
    }

    await this.prisma.hRConsultant.update({
      where: { id: consultant.id },
      data: { lastLogin: new Date() },
    })

    return this.generateToken(consultant)
  }

  async googleLogin(dto: { googleId: string; email: string; name: string; photo?: string }) {
    let consultant = await this.prisma.hRConsultant.findFirst({
      where: { OR: [{ googleId: dto.googleId }, { email: dto.email }] },
    })

    if (consultant) {
      if (!consultant.googleId) {
        consultant = await this.prisma.hRConsultant.update({
          where: { id: consultant.id },
          data: { googleId: dto.googleId, photo: dto.photo || consultant.photo, lastLogin: new Date() },
        })
      } else {
        await this.prisma.hRConsultant.update({
          where: { id: consultant.id },
          data: { lastLogin: new Date() },
        })
      }
    } else {
      const count = await this.prisma.hRConsultant.count()
      const employeeId = `HCTK${String(count + 1).padStart(6, '0')}`
      const generatedPassword = Math.random().toString(36).slice(-12)

      consultant = await this.prisma.hRConsultant.create({
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

    return this.generateToken(consultant)
  }

  async sendOtp(dto: { phone: string }) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const consultant = await this.prisma.hRConsultant.findFirst({ where: { phone: dto.phone } })
    if (consultant) {
      await this.prisma.hRConsultant.update({
        where: { id: consultant.id },
        data: { phoneOtp: otp },
      })
    }
    return { message: 'OTP sent successfully', otp }
  }

  async verifyOtp(dto: { phone: string; otp: string }) {
    const consultant = await this.prisma.hRConsultant.findFirst({ where: { phone: dto.phone, phoneOtp: dto.otp } })
    if (!consultant) throw new UnauthorizedException('Invalid OTP')

    await this.prisma.hRConsultant.update({
      where: { id: consultant.id },
      data: { phoneOtp: null, lastLogin: new Date() },
    })

    return this.generateToken(consultant)
  }

  private generateToken(consultant: any) {
    const payload = {
      sub: consultant.id,
      email: consultant.email,
      role: 'hr_consultant',
    }
    return {
      accessToken: this.jwtService.sign(payload),
      consultant: {
        id: consultant.id,
        employeeId: consultant.employeeId,
        name: consultant.name,
        email: consultant.email,
        phone: consultant.phone,
        photo: consultant.photo,
        agencyId: consultant.agencyId,
        agencyName: consultant.agencyName,
        department: consultant.department,
        designation: consultant.designation,
        role: 'hr_consultant',
      },
    }
  }

  private groupBy(arr: any[], key: string) {
    return arr.reduce((acc, item) => {
      const k = item[key] || 'unknown'
      if (!acc[k]) acc[k] = []
      acc[k].push(item)
      return acc
    }, {} as any)
  }
}
