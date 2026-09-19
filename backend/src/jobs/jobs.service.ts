import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAllPublished(query?: {
    search?: string
    location?: string
    employmentType?: string
    experience?: string
    skills?: string
    salaryMin?: string
    salaryMax?: string
    industry?: string
    department?: string
    postedWithin?: string
    workMode?: string
    company?: string
    salaryType?: string
    experienceYears?: string
    page?: string
    limit?: string
  }) {
    const where: any = { isPublished: true, status: 'published' }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { organizationName: { contains: query.search, mode: 'insensitive' } },
        { skills: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    if (query?.location) where.location = { contains: query.location, mode: 'insensitive' }
    if (query?.employmentType) where.employmentType = query.employmentType
    if (query?.experience) where.experience = query.experience
    if (query?.industry) where.industry = { contains: query.industry, mode: 'insensitive' }
    if (query?.department) where.department = { contains: query.department, mode: 'insensitive' }
    if (query?.skills) where.skills = { contains: query.skills, mode: 'insensitive' }
    if (query?.salaryMin) where.salaryMax = { gte: parseFloat(query.salaryMin) }
    if (query?.salaryMax) where.salaryMin = { lte: parseFloat(query.salaryMax) }
    if (query?.workMode) where.workMode = query.workMode
    if (query?.company) where.organizationName = { contains: query.company, mode: 'insensitive' }
    if (query?.salaryType) where.salaryType = query.salaryType
    if (query?.experienceYears) {
      const years = parseInt(query.experienceYears)
      if (!isNaN(years)) {
        where.AND = [
          { OR: [{ experienceYears: { lte: years } }, { experienceYears: null }] },
        ]
      }
    }
    if (query?.postedWithin) {
      const now = new Date()
      const ranges: Record<string, number> = { '24h': 1, '3d': 3, '7d': 7, '14d': 14, '30d': 30 }
      const days = ranges[query.postedWithin]
      if (days) where.postedDate = { gte: new Date(now.getTime() - days * 86400000) }
    }

    const page = Math.max(1, parseInt(query?.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query?.limit || '20')))
    const skip = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { postedDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ])

    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findAll(status?: string, user?: any, queryCompanyId?: string) {
    const where: any = {}
    if (status) {
      if (status === 'pending') {
        where.status = { in: ['pending_review', 'under_review', 'changes_requested', 'submitted'] }
      } else if (status === 'active') {
        where.status = { in: ['published', 'approved'] }
      } else {
        where.status = status as any
      }
    }

    if (user?.role === 'recruitment_agency') {
      where.companyId = user.id
    } else if (queryCompanyId) {
      where.companyId = queryCompanyId
    } else if (typeof user === 'string') {
      where.companyId = user
    }

    return this.prisma.job.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id }, include: { company: true } })
    if (!job) throw new NotFoundException('Job not found')
    return job
  }

  async create(data: any, user: any) {
    const companyId = (user && typeof user === 'object') ? user.id : user

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
      throw new BadRequestException('Job title is required and must be at least 2 characters')
    }

    if (data.salaryMin != null && data.salaryMax != null && Number(data.salaryMin) > Number(data.salaryMax)) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary')
    }

    const isDirectPublish = data.status === 'published' || data.isPublished === true
    const isPendingReview = data.status === 'pending_review' || data.status === 'submitted'

    if (isDirectPublish || isPendingReview) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { companyId, status: 'active', endDate: { gte: new Date() } },
      })

      const FREE_JOB_LIMIT = 2

      if (!subscription) {
        const activeCount = await this.prisma.job.count({
          where: { companyId, status: { in: ['published', 'pending_review', 'submitted'] } },
        })
        if (activeCount >= FREE_JOB_LIMIT) {
          throw new BadRequestException(
            `Free plan allows only ${FREE_JOB_LIMIT} active job postings. Please subscribe to post more.`,
          )
        }
      } else {
        const jobPostLimit = subscription.jobPosts
        if (jobPostLimit > 0) {
          const activeCount = await this.prisma.job.count({
            where: { companyId, status: { in: ['published', 'pending_review', 'submitted'] } },
          })
          if (activeCount >= jobPostLimit) {
            throw new BadRequestException(
              `Your plan allows only ${jobPostLimit} active job postings. Please upgrade to post more.`,
            )
          }
        }
      }
    }

    const initialStatus = data.status || 'draft'
    const isPublished = initialStatus === 'published'

    const createData: any = {
      companyId,
      title: data.title,
      department: data.department || null,
      employmentType: data.employmentType || data.type || null,
      workMode: data.workMode || null,
      location: data.location || null,
      experience: data.experience || null,
      experienceYears: data.experienceYears !== '' && data.experienceYears != null ? parseInt(String(data.experienceYears), 10) : null,
      experienceMonths: data.experienceMonths !== '' && data.experienceMonths != null ? parseInt(String(data.experienceMonths), 10) : null,
      salaryMin: data.salaryMin !== '' && data.salaryMin != null ? parseFloat(String(data.salaryMin)) : null,
      salaryMax: data.salaryMax !== '' && data.salaryMax != null ? parseFloat(String(data.salaryMax)) : null,
      salaryRange: data.salaryRange || null,
      salaryType: data.salaryType || null,
      salaryPeriod: data.salaryPeriod || null,
      vacancyCount: (data.vacancyCount !== '' && data.vacancyCount != null) ? parseInt(String(data.vacancyCount), 10) : ((data.vacancies !== '' && data.vacancies != null) ? parseInt(String(data.vacancies), 10) : null),
      noticePeriod: data.noticePeriod || null,
      description: data.description || null,
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : (data.responsibilities || null),
      qualifications: Array.isArray(data.qualifications) ? data.qualifications.join('\n') : (data.qualifications || null),
      benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : (data.benefits || null),
      organizationName: data.organizationName || null,
      organizationType: data.organizationType || null,
      industry: data.industry || null,
      status: initialStatus,
      isPublished,
      postedDate: isPublished ? (data.postedDate ? new Date(data.postedDate) : new Date()) : undefined,
      publishedAt: isPublished ? new Date() : undefined,
      skills: data.skills ? (Array.isArray(data.skills) ? JSON.stringify(data.skills) : data.skills) : undefined,
      primarySkills: data.primarySkills ? (Array.isArray(data.primarySkills) ? JSON.stringify(data.primarySkills) : data.primarySkills) : undefined,
      secondarySkills: data.secondarySkills ? (Array.isArray(data.secondarySkills) ? JSON.stringify(data.secondarySkills) : data.secondarySkills) : undefined,
      mandatorySkills: data.mandatorySkills ? (Array.isArray(data.mandatorySkills) ? JSON.stringify(data.mandatorySkills) : data.mandatorySkills) : undefined,
      preferences: data.preferences ? (typeof data.preferences === 'object' ? JSON.stringify(data.preferences) : data.preferences) : undefined,
      screeningQuestions: data.screeningQuestions ? (Array.isArray(data.screeningQuestions) ? JSON.stringify(data.screeningQuestions) : data.screeningQuestions) : undefined,
    }

    return this.prisma.job.create({ data: createData })
  }

  async update(id: string, data: any, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')

    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to modify another company’s job')
    }

    if (data.salaryMin != null && data.salaryMax != null && Number(data.salaryMin) > Number(data.salaryMax)) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary')
    }

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.department !== undefined) updateData.department = data.department
    if (data.employmentType !== undefined) updateData.employmentType = data.employmentType
    else if (data.type !== undefined) updateData.employmentType = data.type
    if (data.workMode !== undefined) updateData.workMode = data.workMode
    if (data.location !== undefined) updateData.location = data.location
    if (data.experience !== undefined) updateData.experience = data.experience
    if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears !== '' && data.experienceYears != null ? parseInt(String(data.experienceYears), 10) : null
    if (data.experienceMonths !== undefined) updateData.experienceMonths = data.experienceMonths !== '' && data.experienceMonths != null ? parseInt(String(data.experienceMonths), 10) : null
    if (data.salaryMin !== undefined) updateData.salaryMin = data.salaryMin !== '' && data.salaryMin != null ? parseFloat(String(data.salaryMin)) : null
    if (data.salaryMax !== undefined) updateData.salaryMax = data.salaryMax !== '' && data.salaryMax != null ? parseFloat(String(data.salaryMax)) : null
    if (data.salaryRange !== undefined) updateData.salaryRange = data.salaryRange
    if (data.salaryType !== undefined) updateData.salaryType = data.salaryType
    if (data.salaryPeriod !== undefined) updateData.salaryPeriod = data.salaryPeriod
    if (data.vacancyCount !== undefined) updateData.vacancyCount = data.vacancyCount !== '' && data.vacancyCount != null ? parseInt(String(data.vacancyCount), 10) : null
    else if (data.vacancies !== undefined) updateData.vacancyCount = data.vacancies !== '' && data.vacancies != null ? parseInt(String(data.vacancies), 10) : null
    if (data.noticePeriod !== undefined) updateData.noticePeriod = data.noticePeriod
    if (data.description !== undefined) updateData.description = data.description
    if (data.responsibilities !== undefined) updateData.responsibilities = Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : data.responsibilities
    if (data.qualifications !== undefined) updateData.qualifications = Array.isArray(data.qualifications) ? data.qualifications.join('\n') : data.qualifications
    if (data.benefits !== undefined) updateData.benefits = Array.isArray(data.benefits) ? data.benefits.join('\n') : data.benefits
    if (data.organizationName !== undefined) updateData.organizationName = data.organizationName
    if (data.organizationType !== undefined) updateData.organizationType = data.organizationType
    if (data.industry !== undefined) updateData.industry = data.industry
    if (data.status !== undefined) updateData.status = data.status

    if (data.skills !== undefined) updateData.skills = data.skills ? (Array.isArray(data.skills) ? JSON.stringify(data.skills) : data.skills) : null
    if (data.primarySkills !== undefined) updateData.primarySkills = data.primarySkills ? (Array.isArray(data.primarySkills) ? JSON.stringify(data.primarySkills) : data.primarySkills) : null
    if (data.secondarySkills !== undefined) updateData.secondarySkills = data.secondarySkills ? (Array.isArray(data.secondarySkills) ? JSON.stringify(data.secondarySkills) : data.secondarySkills) : null
    if (data.mandatorySkills !== undefined) updateData.mandatorySkills = data.mandatorySkills ? (Array.isArray(data.mandatorySkills) ? JSON.stringify(data.mandatorySkills) : data.mandatorySkills) : null
    if (data.preferences !== undefined) updateData.preferences = data.preferences ? (typeof data.preferences === 'object' ? JSON.stringify(data.preferences) : data.preferences) : null
    if (data.screeningQuestions !== undefined) updateData.screeningQuestions = data.screeningQuestions ? (Array.isArray(data.screeningQuestions) ? JSON.stringify(data.screeningQuestions) : data.screeningQuestions) : null

    if (updateData.status === 'published' || data.isPublished === true) {
      updateData.isPublished = true
      if (!job.publishedAt) updateData.publishedAt = new Date()
      if (!job.postedDate) updateData.postedDate = new Date()
    } else if (updateData.status === 'closed' || updateData.status === 'archived' || updateData.status === 'draft') {
      updateData.isPublished = false
    }

    return this.prisma.job.update({ where: { id }, data: updateData })
  }

  async submitJob(id: string, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')

    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to submit another company’s job')
    }

    return this.prisma.job.update({
      where: { id },
      data: { status: 'submitted', submittedAt: new Date() },
    })
  }

  async publishJob(id: string, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')

    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to publish another company’s job')
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'published',
        isPublished: true,
        postedDate: new Date(),
        publishedAt: new Date(),
      },
    })
  }

  async closeJob(id: string, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')

    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to close another company’s job')
    }

    return this.prisma.job.update({
      where: { id },
      data: { status: 'closed', isPublished: false },
    })
  }

  async approveJob(id: string, adminId: string, adminName: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    })
    if (!job) throw new Error('Job not found')

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'published',
        isPublished: true,
        approvalStatus: 'approved',
        approvedBy: adminName,
        approvedAt: new Date(),
        postedDate: new Date(),
        publishedAt: new Date(),
      },
    })

    if (job.company?.email) {
      this.mailService.sendJobApprovalEmail(job.company.email, {
        agencyName: job.company.agencyName,
        jobTitle: job.title,
      })
    }

    await this.prisma.notification.create({
      data: {
        type: 'job_approved',
        title: 'Job Posting Approved',
        message: `${job.title} has been approved and published by ${adminName}.`,
        companyId: job.companyId,
      },
    })

    return updated
  }

  async rejectJob(id: string, reason: string, adminName: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    })
    if (!job) throw new Error('Job not found')

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'rejected',
        isPublished: false,
        approvalStatus: 'rejected',
        rejectedReason: reason,
        approvedBy: adminName,
        approvedAt: new Date(),
      },
    })

    if (job.company?.email) {
      this.mailService.sendJobRejectionEmail(job.company.email, {
        agencyName: job.company.agencyName,
        jobTitle: job.title,
        reason,
      })
    }

    await this.prisma.notification.create({
      data: {
        type: 'job_rejected',
        title: 'Job Posting Rejected',
        message: `${job.title} was rejected by ${adminName}. Reason: ${reason}`,
        companyId: job.companyId,
      },
    })

    return updated
  }

  async requestChanges(id: string, changes: string, adminName: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    })
    if (!job) throw new Error('Job not found')

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'changes_requested',
        approvalStatus: 'changes_requested',
        requestedChanges: changes,
        approvedBy: adminName,
        approvedAt: new Date(),
      },
    })

    if (job.company?.email) {
      this.mailService.sendJobChangesRequestedEmail(job.company.email, {
        agencyName: job.company.agencyName,
        jobTitle: job.title,
        changes,
      })
    }

    await this.prisma.notification.create({
      data: {
        type: 'job_changes_requested',
        title: 'Changes Requested',
        message: `${adminName} requested changes for ${job.title}: ${changes}`,
        companyId: job.companyId,
      },
    })

    return updated
  }

  async featureJob(id: string) {
    return this.prisma.job.update({ where: { id }, data: { featured: true } })
  }

  async unfeatureJob(id: string) {
    return this.prisma.job.update({ where: { id }, data: { featured: false } })
  }

  async archiveJob(id: string, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')
    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to archive another company’s job')
    }
    return this.prisma.job.update({ where: { id }, data: { status: 'archived', archivedAt: new Date(), isPublished: false } })
  }

  async deleteJob(id: string, user?: any) {
    const job = await this.prisma.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException('Job not found')
    if (user && user.role === 'recruitment_agency' && job.companyId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete another company’s job')
    }
    return this.prisma.job.delete({ where: { id } })
  }

  async suspendJob(id: string) {
    return this.prisma.job.update({ where: { id }, data: { status: 'closed', isPublished: false } })
  }

  async getAdminStats() {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [pending, published, rejected, todayJobs, waitingOver24, total, draft, changesRequested, expired] = await Promise.all([
      this.prisma.job.count({ where: { status: { in: ['pending_review', 'under_review'] } } }),
      this.prisma.job.count({ where: { status: 'published' } }),
      this.prisma.job.count({ where: { status: 'rejected' } }),
      this.prisma.job.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      this.prisma.job.count({ where: { status: 'pending_review', createdAt: { lte: twentyFourHoursAgo } } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'draft' } }),
      this.prisma.job.count({ where: { status: 'changes_requested' } }),
      this.prisma.job.count({ where: { status: 'expired' } }),
    ])

    return { total, pending, published, rejected, draft, changesRequested, expired, todayJobs, waitingOver24 }
  }

  async findJobsByStatus(status: string, query?: { search?: string; page?: string; limit?: string }) {
    const where: any = {}

    if (status === 'pending') {
      where.status = { in: ['pending_review', 'under_review', 'changes_requested', 'submitted'] }
    } else {
      where.status = status as any
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { organizationName: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const page = Math.max(1, parseInt(query?.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(query?.limit || '20')))
    const skip = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { company: { select: { agencyName: true, email: true, logo: true } } },
      }),
      this.prisma.job.count({ where }),
    ])

    return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async bulkApprove(ids: string[], adminId: string, adminName: string) {
    const results = []
    for (const id of ids) {
      try {
        results.push(await this.approveJob(id, adminId, adminName))
      } catch (e) {
        results.push({ id, error: (e as Error).message })
      }
    }
    return results
  }

  async bulkReject(ids: string[], reason: string, adminName: string) {
    const results = []
    for (const id of ids) {
      try {
        results.push(await this.rejectJob(id, reason, adminName))
      } catch (e) {
        results.push({ id, error: (e as Error).message })
      }
    }
    return results
  }

  async bulkArchive(ids: string[]) {
    const results = []
    for (const id of ids) {
      try {
        results.push(await this.archiveJob(id))
      } catch (e) {
        results.push({ id, error: (e as Error).message })
      }
    }
    return results
  }

  async bulkDelete(ids: string[]) {
    const results = []
    for (const id of ids) {
      try {
        results.push(await this.deleteJob(id))
      } catch (e) {
        results.push({ id, error: (e as Error).message })
      }
    }
    return results
  }

  async getStats() {
    const [total, published, draft, pendingReview] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'published' } }),
      this.prisma.job.count({ where: { status: 'draft' } }),
      this.prisma.job.count({ where: { status: 'pending_review' } }),
    ])
    return { total, published, draft, pendingReview }
  }
}
