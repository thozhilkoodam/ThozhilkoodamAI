import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class EmailTemplatesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(query?: { search?: string; category?: string; status?: string; page?: string; limit?: string }) {
    const where: any = {}
    if (query?.status) where.status = query.status
    if (query?.category) where.category = query.category
    if (query?.search) {
      where.OR = [
        { templateName: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { templateKey: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const page = Math.max(1, parseInt(query?.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query?.limit || '20')))
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailTemplate.count({ where }),
    ])

    return { templates, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')
    return template
  }

  async create(dto: any, userId?: string) {
    const existing = await this.prisma.emailTemplate.findUnique({ where: { templateKey: dto.templateKey } })
    if (existing) throw new ConflictException('Template key already exists')

    return this.prisma.emailTemplate.create({
      data: {
        templateKey: dto.templateKey,
        templateName: dto.templateName,
        category: dto.category,
        subject: dto.subject,
        body: dto.body,
        variables: dto.variables || '[]',
        status: dto.status || 'active',
        description: dto.description,
        createdBy: userId,
      },
    })
  }

  async update(id: string, dto: any) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')

    if (dto.templateKey && dto.templateKey !== template.templateKey) {
      const existing = await this.prisma.emailTemplate.findUnique({ where: { templateKey: dto.templateKey } })
      if (existing) throw new ConflictException('Template key already in use')
    }

    const data: any = {}
    const fields = ['templateKey', 'templateName', 'category', 'subject', 'body', 'variables', 'status', 'description']
    for (const field of fields) {
      if (dto[field] !== undefined) data[field] = dto[field]
    }

    return this.prisma.emailTemplate.update({ where: { id }, data })
  }

  async remove(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')
    return this.prisma.emailTemplate.delete({ where: { id } })
  }

  async duplicate(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')

    const newKey = `${template.templateKey}_copy_${Date.now()}`
    return this.prisma.emailTemplate.create({
      data: {
        templateKey: newKey,
        templateName: `${template.templateName} (Copy)`,
        category: template.category,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        status: 'inactive',
        description: template.description,
      },
    })
  }

  async toggleStatus(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')

    const newStatus = template.status === 'active' ? 'inactive' : 'active'
    return this.prisma.emailTemplate.update({ where: { id }, data: { status: newStatus } })
  }

  async preview(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { id } })
    if (!template) throw new NotFoundException('Email template not found')

    const sampleVars: Record<string, string> = {
      candidate_name: 'John Doe',
      company_name: 'Acme Corp',
      agency_name: 'TechRecruit Agency',
      recruiter_name: 'Jane Smith',
      job_title: 'Senior Software Engineer',
      employee_id: 'HRTK000001',
      email: 'user@example.com',
      phone: '+91 98765 43210',
      otp: '123456',
      verification_link: 'https://app.thozhilkoodam.com/verify?token=abc123',
      reset_link: 'https://app.thozhilkoodam.com/reset?token=abc123',
      login_url: 'https://app.thozhilkoodam.com/login',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      date: new Date().toLocaleDateString('en-IN'),
      time: '10:00 AM',
      amount: '₹5,999',
      plan: 'Professional',
      invoice_number: 'INV-2024-001',
      support_email: 'support@thozhilkoodam.com',
    }

    let html = template.body
    for (const [key, value] of Object.entries(sampleVars)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    const subject = template.subject.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleVars[key] || `{{${key}}}`)

    return { subject, body: html, template }
  }

  async sendTest(id: string, recipientEmail: string) {
    const preview = await this.preview(id)
    await this.mailService.sendTestEmail(recipientEmail, preview.subject, preview.body)
    return { message: `Test email sent to ${recipientEmail}` }
  }
}
