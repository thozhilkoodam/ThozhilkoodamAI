import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async findColleges(search?: string) {
    const where: any = { status: 'approved' }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }
    return this.prisma.college.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  async findUniversities(search?: string) {
    const where: any = { status: 'approved' }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }
    return this.prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  async createCollege(name: string) {
    const existing = await this.prisma.college.findUnique({ where: { name } })
    if (existing) return existing
    const college = await this.prisma.college.create({
      data: { name, status: 'pending' },
      select: { id: true, name: true, status: true },
    })
    await this.prisma.notification.create({
      data: {
        type: 'institution_pending',
        title: 'New College Pending Approval',
        message: `"${name}" has been submitted and is pending review.`,
      },
    })
    return college
  }

  async createUniversity(name: string) {
    const existing = await this.prisma.university.findUnique({ where: { name } })
    if (existing) return existing
    const university = await this.prisma.university.create({
      data: { name, status: 'pending' },
      select: { id: true, name: true, status: true },
    })
    await this.prisma.notification.create({
      data: {
        type: 'institution_pending',
        title: 'New University Pending Approval',
        message: `"${name}" has been submitted and is pending review.`,
      },
    })
    return university
  }

  async adminColleges(status?: string) {
    const where: any = {}
    if (status) where.status = status
    return this.prisma.college.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async adminUniversities(status?: string) {
    const where: any = {}
    if (status) where.status = status
    return this.prisma.university.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateCollegeStatus(id: number, status: string) {
    return this.prisma.college.update({
      where: { id },
      data: { status: status as any },
    })
  }

  async updateUniversityStatus(id: number, status: string) {
    return this.prisma.university.update({
      where: { id },
      data: { status: status as any },
    })
  }
}
