import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = {}
    if (filters?.skills) where.skills = { contains: filters.skills, mode: 'insensitive' }
    if (filters?.location) where.location = { contains: filters.location, mode: 'insensitive' }
    if (filters?.designation) where.designation = { contains: filters.designation, mode: 'insensitive' }
    if (filters?.gender) where.gender = filters.gender
    if (filters?.minExperience) where.experience = { gte: filters.minExperience }
    if (filters?.maxExperience) where.experience = { ...where.experience, lte: filters.maxExperience }

    return this.prisma.candidate.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async findOne(id: string) {
    return this.prisma.candidate.findUnique({ where: { id } })
  }

  async search(query: string) {
    return this.prisma.candidate.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { skills: { contains: query, mode: 'insensitive' } },
          { designation: { contains: query, mode: 'insensitive' } },
          { currentCompany: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { lastActive: 'desc' },
    })
  }
}
