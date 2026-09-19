import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { CompanyLoginDto } from './dto/company-login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended. Contact super admin.')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    return this.generateToken(user)
  }

  async loginCompany(dto: CompanyLoginDto) {
    const company = await this.prisma.company.findUnique({ where: { email: dto.email } })
    if (!company) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, company.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (company.status === 'pending') {
      throw new UnauthorizedException('Your account is waiting for admin approval.')
    }
    if (company.status === 'rejected') {
      throw new UnauthorizedException('Your registration has been rejected. Please contact support.')
    }
    if (company.status === 'suspended') {
      throw new UnauthorizedException('Your account has been suspended.')
    }

    return this.generateCompanyToken(company)
  }

  async register(dto: RegisterDto) {
  // Check email already exists
  const existing = await this.prisma.company.findUnique({
    where: { email: dto.email },
  })

  if (existing) {
    throw new ConflictException('Email already registered')
  }

  // Get latest company
  const lastCompany = await this.prisma.company.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
  })

  let companyId = 'KIKTK000001'

  if (lastCompany?.companyId) {
    const lastNumber = parseInt(
      lastCompany.companyId.replace('KIKTK', ''),
      10,
    )

    companyId =
      'KIKTK' + String(lastNumber + 1).padStart(6, '0')
  }

  // Create company
  const company = await this.prisma.company.create({
    data: {
      companyId,
      agencyName: dto.agencyName,
      contactPerson: dto.contactPerson,
      position: dto.position,
      employeeCount: dto.employeeCount,
      vacancyCount: dto.vacancyCount,
      registrationNumber: dto.registrationNumber,
      phone: dto.phone,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      category: dto.category ?? 'recruitment-agencies',

      // Backend controls these values
      status: 'pending',
    },
  })

  // Create admin notification
  await this.prisma.notification.create({
    data: {
      type: 'agency_registration',
      title: 'New Recruitment Agency Registration',
      message: `${company.agencyName} (${company.companyId}) has registered and is waiting for approval.`,
    },
  })

  // Audit log
  await this.prisma.auditLog.create({
    data: {
      userName: 'System',
      action: 'Agency Registration',
      details: `${company.agencyName} registered successfully.`,
    },
  })

  // Send email to admin (don't block registration if email fails)
  try {
    await this.mailService.sendRegistrationNotification({
      companyId: company.companyId,
      agencyName: company.agencyName,
      contactPerson: company.contactPerson,
      email: company.email,
    })
  } catch (error) {
    console.error('Failed to send registration email', error)
  }

  return {
    success: true,
    companyId: company.companyId,
    status: company.status,
    message:
      'Registration submitted successfully. Please wait for admin approval.',
  }
}
  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }

  private generateCompanyToken(company: any) {
    const payload = { sub: company.id, email: company.email, role: 'recruitment_agency', companyId: company.companyId }
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: company.id,
        companyId: company.companyId,
        name: company.contactPerson,
        email: company.email,
        role: 'recruitment_agency',
        logo: company.logo || '',
        status: company.status,
      },
    }
  }
}
