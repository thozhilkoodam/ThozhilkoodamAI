import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SmsTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; category?: string; status?: string; page?: string; limit?: string }) {
    const where: any = {}
    if (query?.status) where.status = query.status
    if (query?.category) where.category = query.category
    if (query?.search) {
      where.OR = [
        { templateName: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { templateKey: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const page = Math.max(1, parseInt(query?.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query?.limit || '20')))
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      this.prisma.smsTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.smsTemplate.count({ where }),
    ])

    return { templates, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')
    return template
  }

  async create(dto: any, userId?: string) {
    const existing = await this.prisma.smsTemplate.findUnique({ where: { templateKey: dto.templateKey } })
    if (existing) throw new ConflictException('Template key already exists')

    return this.prisma.smsTemplate.create({
      data: {
        templateKey: dto.templateKey,
        templateName: dto.templateName,
        category: dto.category,
        message: dto.message,
        variables: dto.variables || '[]',
        status: dto.status || 'active',
        description: dto.description,
        createdBy: userId,
      },
    })
  }

  async update(id: string, dto: any) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')

    if (dto.templateKey && dto.templateKey !== template.templateKey) {
      const existing = await this.prisma.smsTemplate.findUnique({ where: { templateKey: dto.templateKey } })
      if (existing) throw new ConflictException('Template key already in use')
    }

    const data: any = {}
    const fields = ['templateKey', 'templateName', 'category', 'message', 'variables', 'status', 'description']
    for (const field of fields) {
      if (dto[field] !== undefined) data[field] = dto[field]
    }

    return this.prisma.smsTemplate.update({ where: { id }, data })
  }

  async remove(id: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')
    return this.prisma.smsTemplate.delete({ where: { id } })
  }

  async duplicate(id: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')

    const newKey = `${template.templateKey}_copy_${Date.now()}`
    return this.prisma.smsTemplate.create({
      data: {
        templateKey: newKey,
        templateName: `${template.templateName} (Copy)`,
        category: template.category,
        message: template.message,
        variables: template.variables,
        status: 'inactive',
        description: template.description,
      },
    })
  }

  async toggleStatus(id: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')

    const newStatus = template.status === 'active' ? 'inactive' : 'active'
    return this.prisma.smsTemplate.update({ where: { id }, data: { status: newStatus } })
  }

  async preview(id: string) {
    const template = await this.prisma.smsTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('SMS template not found')

    const sampleVars: Record<string, string> = {
      name: 'John Doe',
      otp: '123456',
      job_title: 'Senior Software Engineer',
      company_name: 'Acme Corp',
      date: new Date().toLocaleDateString('en-IN'),
      time: '10:00 AM',
      amount: '₹5,999',
      plan: 'Professional',
      login_url: 'https://app.thozhilkoodam.com/login',
    }

    let message = template.message
    for (const [key, value] of Object.entries(sampleVars)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    return { message, template, characterCount: message.length }
  }

  async sendTest(id: string, phoneNumber: string) {
    const preview = await this.preview(id)
    // In production, integrate with SMS gateway (Twilio, MSG91, etc.)
    console.log(`[SMS] Test SMS to ${phoneNumber}: ${preview.message}`)
    return { message: `Test SMS sent to ${phoneNumber}`, content: preview.message }
  }
}
