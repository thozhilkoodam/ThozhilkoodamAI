import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'thozhil-koodam-secret',
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role === 'recruitment_agency') {
      const company = await this.prisma.company.findUnique({ where: { id: payload.sub } })
      if (!company || company.status !== 'approved') {
        throw new UnauthorizedException('Agency account is not approved')
      }
      return {
        id: company.id,
        companyId: company.companyId,
        email: company.email,
        role: 'recruitment_agency',
        name: company.agencyName,
        status: company.status,
      }
    }

    if (payload.role === 'hr_consultant') {
      const consultant = await this.prisma.hRConsultant.findUnique({ where: { id: payload.sub } })
      if (!consultant || consultant.status !== 'active') {
        throw new UnauthorizedException('Consultant account is not active')
      }
      return {
        id: consultant.id,
        email: consultant.email,
        role: 'hr_consultant',
        name: consultant.name,
        employeeId: consultant.employeeId,
        agencyId: consultant.agencyId,
      }
    }

    if (payload.role === 'candidate') {
      const candidate = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!candidate || candidate.status === 'suspended') {
        throw new UnauthorizedException('Candidate account not found or suspended')
      }
      return {
        id: candidate.id,
        email: candidate.email,
        role: 'candidate',
        name: candidate.name,
        phone: candidate.phone,
        photo: candidate.photo,
      }
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended or not found')
    }
    return { id: user.id, email: user.email, role: user.role, name: user.name }
  }
}
