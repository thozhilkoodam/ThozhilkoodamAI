import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto'
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto'

@Injectable()
export class SupportTicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {}
    return this.prisma.supportTicket.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: { client: true },
    })
    if (!ticket) throw new NotFoundException('Support ticket not found')
    return ticket
  }

  async create(dto: CreateSupportTicketDto) {
    const ticketNo = `TKT${Date.now()}`
    return this.prisma.supportTicket.create({
      data: {
        ticketNo,
        clientId: dto.clientId,
        subject: dto.subject,
        message: dto.message,
        attachment: dto.attachment,
      },
      include: { client: true },
    })
  }

  async reply(id: string, dto: ReplySupportTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('Support ticket not found')

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        adminReply: dto.adminReply,
        repliedAt: new Date(),
        status: 'in_progress' as any,
      },
      include: { client: true },
    })
  }

  async resolve(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('Support ticket not found')

    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'resolved' as any },
      include: { client: true },
    })
  }

  async getByClient(clientId: string) {
    return this.prisma.supportTicket.findMany({
      where: { clientId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
