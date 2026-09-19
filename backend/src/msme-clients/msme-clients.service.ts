import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class MsmeClientsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async findAll(status?: string) {
    const where = status ? { status } : {}
    return this.prisma.mSMEClient.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async findOne(id: string) {
    const client = await this.prisma.mSMEClient.findUnique({
      where: { id },
      include: {
        requirements: true,
        quotations: true,
        supportTickets: true,
        meetings: true,
      },
    })
    if (!client) throw new NotFoundException('MSME Client not found')
    return client
  }

  async create(dto: {
    companyName: string
    email: string
    password: string
    phone?: string
    logo?: string
    gst?: string
    pan?: string
    address?: string
    website?: string
    industry?: string
    employeeCount?: string
    gstCert?: string
    panCert?: string
    incorporationCert?: string
    businessRegCert?: string
    directorAadhaar?: string
    directorPan?: string
  }) {
    const existing = await this.prisma.mSMEClient.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const count = await this.prisma.mSMEClient.count()
    const companyId = `MSME${String(count + 1).padStart(6, '0')}`

    const client = await this.prisma.mSMEClient.create({
      data: {
        companyId,
        companyName: dto.companyName,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        phone: dto.phone,
        logo: dto.logo,
        gst: dto.gst,
        pan: dto.pan,
        address: dto.address,
        website: dto.website,
        industry: dto.industry,
        employeeCount: dto.employeeCount,
        gstCert: dto.gstCert,
        panCert: dto.panCert,
        incorporationCert: dto.incorporationCert,
        businessRegCert: dto.businessRegCert,
        directorAadhaar: dto.directorAadhaar,
        directorPan: dto.directorPan,
        status: 'pending',
      },
    })

    await this.prisma.notification.create({
      data: {
        type: 'msme_registration',
        title: 'New MSME Client Registration',
        message: `${client.companyName} (${client.companyId}) has registered and is waiting for verification.`,
      },
    })

    await this.prisma.auditLog.create({
      data: {
        userName: 'System',
        action: 'MSME Registration',
        details: `${client.companyName} registered successfully.`,
      },
    })

    try {
      await this.mailService.sendRegistrationNotification({
        companyId: client.companyId,
        agencyName: client.companyName,
        contactPerson: client.companyName,
        email: client.email,
      })
    } catch (error) {
      console.error('Failed to send registration email', error)
    }

    return {
      success: true,
      companyId: client.companyId,
      status: client.status,
      message: 'Registration submitted successfully. Please wait for admin verification.',
    }
  }

  async update(id: string, dto: {
    companyName?: string
    email?: string
    password?: string
    phone?: string
    logo?: string
    gst?: string
    pan?: string
    address?: string
    website?: string
    industry?: string
    employeeCount?: string
    gstCert?: string
    panCert?: string
    incorporationCert?: string
    businessRegCert?: string
    directorAadhaar?: string
    directorPan?: string
  }) {
    const client = await this.prisma.mSMEClient.findUnique({ where: { id } })
    if (!client) throw new NotFoundException('MSME Client not found')

    if (dto.email && dto.email !== client.email) {
      const existing = await this.prisma.mSMEClient.findUnique({ where: { email: dto.email } })
      if (existing) throw new ConflictException('Email already in use')
    }

    const data: any = {}
    if (dto.companyName !== undefined) data.companyName = dto.companyName
    if (dto.email !== undefined) data.email = dto.email
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.phone !== undefined) data.phone = dto.phone
    if (dto.logo !== undefined) data.logo = dto.logo
    if (dto.gst !== undefined) data.gst = dto.gst
    if (dto.pan !== undefined) data.pan = dto.pan
    if (dto.address !== undefined) data.address = dto.address
    if (dto.website !== undefined) data.website = dto.website
    if (dto.industry !== undefined) data.industry = dto.industry
    if (dto.employeeCount !== undefined) data.employeeCount = dto.employeeCount
    if (dto.gstCert !== undefined) data.gstCert = dto.gstCert
    if (dto.panCert !== undefined) data.panCert = dto.panCert
    if (dto.incorporationCert !== undefined) data.incorporationCert = dto.incorporationCert
    if (dto.businessRegCert !== undefined) data.businessRegCert = dto.businessRegCert
    if (dto.directorAadhaar !== undefined) data.directorAadhaar = dto.directorAadhaar
    if (dto.directorPan !== undefined) data.directorPan = dto.directorPan

    return this.prisma.mSMEClient.update({ where: { id }, data })
  }

  async verify(id: string, adminName: string) {
    const client = await this.prisma.mSMEClient.findUnique({ where: { id } })
    if (!client) throw new NotFoundException('MSME Client not found')

    await this.prisma.auditLog.create({
      data: {
        userName: adminName,
        action: 'MSME Verification',
        details: `Verified ${client.companyName} (${client.companyId})`,
      },
    })

    await this.prisma.notification.create({
      data: {
        type: 'msme_verified',
        title: 'MSME Client Verified',
        message: `${client.companyName} has been verified.`,
      },
    })

    try {
      await this.mailService.sendApprovalEmail(client.email, {
        agencyName: client.companyName,
        companyId: client.companyId,
      })
    } catch (error) {
      console.error('Failed to send verification email', error)
    }

    return this.prisma.mSMEClient.update({
      where: { id },
      data: { status: 'verified', verifiedAt: new Date() },
    })
  }

  async reject(id: string, reason: string, adminName: string) {
    const client = await this.prisma.mSMEClient.findUnique({ where: { id } })
    if (!client) throw new NotFoundException('MSME Client not found')

    await this.prisma.auditLog.create({
      data: {
        userName: adminName,
        action: 'MSME Rejection',
        details: `Rejected ${client.companyName} (${client.companyId})`,
      },
    })

    await this.prisma.notification.create({
      data: {
        type: 'msme_rejected',
        title: 'MSME Client Rejected',
        message: `${client.companyName} has been rejected.`,
      },
    })

    try {
      await this.mailService.sendRejectionEmail(client.email, {
        agencyName: client.companyName,
        reason: reason || 'Not specified',
      })
    } catch (error) {
      console.error('Failed to send rejection email', error)
    }

    return this.prisma.mSMEClient.update({
      where: { id },
      data: { status: 'rejected', rejectedAt: new Date(), rejectionReason: reason || 'Not specified' },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.mSMEClient.findUnique({ where: { email } })
  }

  async login(dto: { email: string; password: string }) {
    const client = await this.prisma.mSMEClient.findUnique({ where: { email: dto.email } })
    if (!client) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, client.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (client.status === 'pending') {
      throw new UnauthorizedException('Your account is waiting for admin verification.')
    }
    if (client.status === 'rejected') {
      throw new UnauthorizedException('Your registration has been rejected. Please contact support.')
    }

    return this.generateToken(client)
  }

  async googleLogin(dto: { googleId: string; email: string; companyName: string; logo?: string }) {
    let client = await this.prisma.mSMEClient.findFirst({
      where: { OR: [{ googleId: dto.googleId }, { email: dto.email }] },
    })

    if (client) {
      if (!client.googleId) {
        client = await this.prisma.mSMEClient.update({
          where: { id: client.id },
          data: { googleId: dto.googleId, logo: dto.logo || client.logo },
        })
      }
    } else {
      const count = await this.prisma.mSMEClient.count()
      const companyId = `MSME${String(count + 1).padStart(6, '0')}`
      const generatedPassword = Math.random().toString(36).slice(-12)

      client = await this.prisma.mSMEClient.create({
        data: {
          companyId,
          companyName: dto.companyName,
          email: dto.email,
          passwordHash: await bcrypt.hash(generatedPassword, 10),
          logo: dto.logo,
          googleId: dto.googleId,
          status: 'pending',
        },
      })

      await this.prisma.notification.create({
        data: {
          type: 'msme_registration',
          title: 'New MSME Client Registration',
          message: `${client.companyName} (${client.companyId}) has registered via Google and is waiting for verification.`,
        },
      })

      await this.prisma.auditLog.create({
        data: {
          userName: 'System',
          action: 'MSME Google Registration',
          details: `${client.companyName} registered via Google.`,
        },
      })
    }

    return this.generateToken(client)
  }

  private generateToken(client: any) {
    const payload = {
      sub: client.id,
      email: client.email,
      role: 'msme_client',
    }
    return {
      accessToken: this.jwtService.sign(payload),
      client: {
        id: client.id,
        companyId: client.companyId,
        companyName: client.companyName,
        email: client.email,
        phone: client.phone,
        logo: client.logo,
        role: 'msme_client',
        status: client.status,
      },
    }
  }
}
