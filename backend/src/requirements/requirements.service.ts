import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRequirementDto } from './dto/create-requirement.dto'
import { UpdateRequirementStatusDto } from './dto/update-requirement-status.dto'
import { AssignRecruiterDto } from './dto/assign-recruiter.dto'

const REQUIREMENT_STAGES = [
  'pending',
  'under_review',
  'quoted',
  'client_approved',
  'recruiter_assigned',
  'candidate_search',
  'interview',
  'offer',
  'joining',
  'completed',
]

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {}
    return this.prisma.requirement.findMany({
      where,
      include: {
        client: true,
        assignments: {
          include: { recruiter: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        client: true,
        trackers: { orderBy: { createdAt: 'asc' } },
        assignments: {
          include: { recruiter: true },
        },
        quotations: true,
      },
    })
    if (!requirement) throw new NotFoundException('Requirement not found')
    return requirement
  }

  async create(dto: CreateRequirementDto) {
    const timestamp = Date.now().toString()
    const requirementId = `REQ${timestamp}`

    const requirement = await this.prisma.requirement.create({
      data: {
        requirementId,
        clientId: dto.clientId,
        companyName: dto.companyName,
        department: dto.department,
        position: dto.position,
        vacancies: dto.vacancies,
        experience: dto.experience,
        education: dto.education,
        skills: dto.skills,
        minSalary: dto.minSalary,
        maxSalary: dto.maxSalary,
        hiringDeadline: dto.hiringDeadline ? new Date(dto.hiringDeadline) : undefined,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        location: dto.location,
        description: dto.description,
        employmentType: dto.employmentType,
        interviewMode: dto.interviewMode,
        venue: dto.venue,
        interviewDate: dto.interviewDate ? new Date(dto.interviewDate) : undefined,
        interviewTime: dto.interviewTime,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        googleMap: dto.googleMap,
        instructions: dto.instructions,
        meetingLink: dto.meetingLink,
        meetingPlatform: dto.meetingPlatform,
        priority: dto.priority,
        budget: dto.budget,
        timeline: dto.timeline,
        trackers: {
          create: { stage: 'pending' },
        },
      },
      include: {
        client: true,
        trackers: true,
      },
    })

    return requirement
  }

  async updateStatus(id: string, dto: UpdateRequirementStatusDto, adminName: string) {
    const requirement = await this.prisma.requirement.findUnique({ where: { id } })
    if (!requirement) throw new NotFoundException('Requirement not found')

    const prevStage = requirement.status
    const newStage = dto.status

    if (prevStage === newStage) {
      throw new BadRequestException(`Requirement is already in ${newStage} status`)
    }

    const validTransition = this.isValidTransition(prevStage, newStage)
    if (!validTransition) {
      throw new BadRequestException(`Cannot transition from ${prevStage} to ${newStage}`)
    }

    const updateData: any = { status: newStage }
    if (newStage === 'completed') {
      updateData.completedAt = new Date()
    }

    await this.prisma.requirementTracker.create({
      data: {
        requirementId: id,
        stage: newStage,
        completed: newStage === 'completed',
        completedAt: newStage === 'completed' ? new Date() : null,
        notes: dto.notes || `Status changed from ${prevStage} to ${newStage}`,
      },
    })

    await this.prisma.auditLog.create({
      data: {
        userName: adminName,
        action: 'Requirement Status Change',
        details: `Changed requirement ${requirement.requirementId} status from ${prevStage} to ${newStage}`,
      },
    })

    return this.prisma.requirement.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        trackers: { orderBy: { createdAt: 'asc' } },
        assignments: { include: { recruiter: true } },
        quotations: true,
      },
    })
  }

  async assignRecruiter(id: string, dto: AssignRecruiterDto, assignedBy: string) {
    const requirement = await this.prisma.requirement.findUnique({ where: { id } })
    if (!requirement) throw new NotFoundException('Requirement not found')

    const recruiter = await this.prisma.hRRecruiter.findUnique({
      where: { id: dto.recruiterId },
    })
    if (!recruiter) throw new NotFoundException('Recruiter not found')

    const existing = await this.prisma.recruiterAssignment.findFirst({
      where: { requirementId: id, recruiterId: dto.recruiterId },
    })
    if (existing) {
      throw new BadRequestException('Recruiter already assigned to this requirement')
    }

    await this.prisma.recruiterAssignment.create({
      data: {
        requirementId: id,
        recruiterId: dto.recruiterId,
        assignedBy,
      },
    })

    await this.prisma.requirementTracker.create({
      data: {
        requirementId: id,
        stage: 'recruiter_assigned',
        completed: false,
        notes: `Recruiter ${recruiter.name} assigned by ${assignedBy}`,
      },
    })

    if (requirement.status === 'client_approved' || requirement.status === 'pending') {
      await this.prisma.requirement.update({
        where: { id },
        data: {
          status: 'recruiter_assigned',
          assignedAt: new Date(),
        },
      })
    }

    await this.prisma.auditLog.create({
      data: {
        userName: assignedBy,
        action: 'Recruiter Assignment',
        details: `Assigned recruiter ${recruiter.name} to requirement ${requirement.requirementId}`,
      },
    })

    return this.prisma.requirement.findUnique({
      where: { id },
      include: {
        client: true,
        trackers: { orderBy: { createdAt: 'asc' } },
        assignments: { include: { recruiter: true } },
        quotations: true,
      },
    })
  }

  async getStats() {
    const stages = REQUIREMENT_STAGES
    const counts = await Promise.all(
      stages.map((stage) =>
        this.prisma.requirement.count({ where: { status: stage as any } }),
      ),
    )
    const stats: Record<string, number> = {}
    stages.forEach((stage, i) => {
      stats[stage] = counts[i]
    })
    stats['total'] = counts.reduce((a, b) => a + b, 0)
    return stats
  }

  async getByClient(clientId: string) {
    return this.prisma.requirement.findMany({
      where: { clientId },
      include: {
        trackers: { orderBy: { createdAt: 'asc' } },
        assignments: { include: { recruiter: true } },
        quotations: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  private isValidTransition(from: string, to: string): boolean {
    const fromIndex = REQUIREMENT_STAGES.indexOf(from)
    const toIndex = REQUIREMENT_STAGES.indexOf(to)
    if (fromIndex === -1 || toIndex === -1) return false
    return toIndex === fromIndex + 1 || toIndex > fromIndex
  }
}
