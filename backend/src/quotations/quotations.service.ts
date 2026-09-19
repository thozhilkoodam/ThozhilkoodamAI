import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateQuotationDto } from './dto/create-quotation.dto'
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto'

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {}
    return this.prisma.quotation.findMany({
      where,
      include: { requirement: true, client: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { requirement: true, client: true },
    })
    if (!quotation) throw new NotFoundException('Quotation not found')
    return quotation
  }

  async create(dto: CreateQuotationDto) {
    const quotationNo = `QOT${Date.now()}`
    const subtotal = dto.serviceCharges + dto.placementCharges
    const gst = dto.gstPercentage ?? 18
    const totalAmount = subtotal + (subtotal * gst) / 100

    return this.prisma.quotation.create({
      data: {
        quotationNo,
        requirementId: dto.requirementId,
        clientId: dto.clientId,
        serviceCharges: dto.serviceCharges,
        placementCharges: dto.placementCharges,
        gstPercentage: gst,
        totalAmount,
        terms: dto.terms,
      },
      include: { requirement: true, client: true },
    })
  }

  async updateStatus(id: string, dto: UpdateQuotationStatusDto) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } })
    if (!quotation) throw new NotFoundException('Quotation not found')

    const data: any = { status: dto.status as any }
    if (dto.status === 'approved') {
      data.approvedAt = new Date()
    }

    return this.prisma.quotation.update({
      where: { id },
      data,
      include: { requirement: true, client: true },
    })
  }

  async getByClient(clientId: string) {
    return this.prisma.quotation.findMany({
      where: { clientId },
      include: { requirement: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
