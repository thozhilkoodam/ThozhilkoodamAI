import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  async getJobRoles(search?: string) {
    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' as const }
    return this.prisma.jobRole.findMany({ where, orderBy: { name: 'asc' } })
  }

  async createJobRole(name: string) {
    return this.prisma.jobRole.create({ data: { name } })
  }

  async updateJobRole(id: number, name: string) {
    return this.prisma.jobRole.update({ where: { id }, data: { name } })
  }

  async deleteJobRole(id: number) {
    return this.prisma.jobRole.delete({ where: { id } })
  }

  async getIndustries(search?: string) {
    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' as const }
    return this.prisma.industry.findMany({ where, orderBy: { name: 'asc' } })
  }

  async createIndustry(name: string) {
    return this.prisma.industry.create({ data: { name } })
  }

  async updateIndustry(id: number, name: string) {
    return this.prisma.industry.update({ where: { id }, data: { name } })
  }

  async deleteIndustry(id: number) {
    return this.prisma.industry.delete({ where: { id } })
  }

  async getLocations(search?: string) {
    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' as const }
    return this.prisma.location.findMany({ where, orderBy: { name: 'asc' } })
  }

  async createLocation(name: string) {
    return this.prisma.location.create({ data: { name } })
  }

  async updateLocation(id: number, name: string) {
    return this.prisma.location.update({ where: { id }, data: { name } })
  }

  async deleteLocation(id: number) {
    return this.prisma.location.delete({ where: { id } })
  }
}
