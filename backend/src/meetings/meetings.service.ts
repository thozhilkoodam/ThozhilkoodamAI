import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingStatusDto } from './dto/update-meeting-status.dto'

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.meeting.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { client: true },
    })
    if (!meeting) throw new NotFoundException('Meeting not found')
    return meeting
  }

  async create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        clientId: dto.clientId,
        date: new Date(dto.date),
        time: dto.time,
        purpose: dto.purpose,
        type: dto.type as any,
        link: dto.link,
        notes: dto.notes,
      },
      include: { client: true },
    })
  }

  async updateStatus(id: string, dto: UpdateMeetingStatusDto) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } })
    if (!meeting) throw new NotFoundException('Meeting not found')

    return this.prisma.meeting.update({
      where: { id },
      data: { status: dto.status as any },
      include: { client: true },
    })
  }

  async getByClient(clientId: string) {
    return this.prisma.meeting.findMany({
      where: { clientId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
