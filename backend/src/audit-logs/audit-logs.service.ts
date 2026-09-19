import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async create(data: { userName: string; action: string; details?: string; ip?: string; userId?: string }) {
    return this.prisma.auditLog.create({ data })
  }
}
