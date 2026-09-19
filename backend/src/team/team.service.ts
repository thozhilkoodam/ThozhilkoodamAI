import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async getMembers(companyId: string) {
    return this.prisma.teamMember.findMany({ where: { companyId }, orderBy: { joinedAt: 'desc' } })
  }

  async invite(data: { name: string; email: string; role: string }, companyId: string) {
    return this.prisma.teamMember.create({
      data: {
        companyId,
        name: data.name,
        email: data.email,
        role: data.role as any,
        status: 'invited',
      },
    })
  }

  async remove(id: string) {
    return this.prisma.teamMember.delete({ where: { id } })
  }
}
