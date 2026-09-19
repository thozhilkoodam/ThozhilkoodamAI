import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async create(data: { type: string; title: string; message: string; companyId?: string }) {
    return this.prisma.notification.create({ data })
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } })
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({ data: { read: true } })
    return { success: true }
  }
}
