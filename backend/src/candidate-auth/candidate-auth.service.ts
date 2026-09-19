import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { Msg91Service } from '../msg91/msg91.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class CandidateAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private msg91: Msg91Service,
  ) {}

  async register(dto: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existingEmail) throw new ConflictException('Email already registered')

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone, role: 'candidate' },
      })
      if (existingPhone) throw new ConflictException('Phone number already registered')
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        phone: dto.phone,
        role: 'candidate',
        status: 'active',
      },
    })

    return this.generateToken(user)
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || user.role !== 'candidate') {
      throw new UnauthorizedException('Invalid credentials')
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended. Contact support.')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    return this.generateToken(user)
  }

  async sendOtp(dto: { phone: string }) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone, role: 'candidate' },
    })

    if (!user) throw new NotFoundException('No account found with this phone number. Please register first.')

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneOtp: otp },
    })

    await this.msg91.sendOtp(dto.phone, otp)

    return { success: true, message: 'OTP sent successfully' }
  }

  async verifyOtp(dto: { phone: string; otp: string }) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone, phoneOtp: dto.otp, role: 'candidate' },
    })

    if (!user) throw new UnauthorizedException('Invalid OTP')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneOtp: null, lastLogin: new Date() },
    })

    return this.generateToken(user)
  }

  async googleLogin(dto: { googleId: string; email: string; name: string; photo?: string }) {
    // 1. Match by googleId
    let user = await this.prisma.user.findFirst({
      where: { googleId: dto.googleId, role: 'candidate' },
    })
    if (user) return this.generateToken(user)

    // 2. Match by email
    user = await this.prisma.user.findFirst({
      where: { email: dto.email, role: 'candidate' },
    })
    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: dto.googleId, photo: dto.photo || user.photo },
      })
      return this.generateToken(user)
    }

    // 3. No match found — needs setup (new account or phone linking)
    return { needsSetup: true, email: dto.email, name: dto.name, photo: dto.photo, googleId: dto.googleId }
  }

  async googleSetup(dto: {
    googleId: string
    email: string
    name: string
    photo?: string
    phone: string
    otp: string
  }) {
    // Verify OTP
    const otpUser = await this.prisma.user.findFirst({
      where: { phone: dto.phone, phoneOtp: dto.otp, role: 'candidate' },
    })

    if (otpUser) {
      // Existing candidate — link Google account
      await this.prisma.user.update({
        where: { id: otpUser.id },
        data: {
          phoneOtp: null,
          googleId: dto.googleId,
          name: otpUser.name || dto.name,
          photo: dto.photo || otpUser.photo,
          email: otpUser.email.startsWith('c_') && otpUser.email.endsWith('@thozhil.app')
            ? dto.email
            : otpUser.email,
          lastLogin: new Date(),
        },
      })
      return this.generateToken(otpUser)
    }

    // No existing user with this phone — check email uniqueness
    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (emailExists) throw new ConflictException('Email already registered')

    // Create new candidate account
    const generatedPassword = Math.random().toString(36).slice(-12)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(generatedPassword, 10),
        phone: dto.phone,
        googleId: dto.googleId,
        photo: dto.photo,
        role: 'candidate',
        status: 'active',
      },
    })

    return this.generateToken(user)
  }

  async checkProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      await this.prisma.candidateProfile.create({
        data: {
          userId,
          ...(user?.name ? { gender: undefined } : {}),
        },
      })
      return { hasProfile: false, redirect: '/candidate/profile' }
    }

    return { hasProfile: true, redirect: '/candidate' }
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: 'candidate' }
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        role: 'candidate',
      },
    }
  }
}
