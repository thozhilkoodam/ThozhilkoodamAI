import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async getPipeline(companyId: string) {
    const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Offer', 'Joined']
    const result = []
    for (let i = 0; i < stages.length; i++) {
      const candidates = await this.prisma.pipelineStage.findMany({
        where: { companyId, title: stages[i] },
        include: { candidate: true },
        orderBy: { createdAt: 'desc' },
      })
      result.push({
        id: `stage_${i}`,
        title: stages[i],
        candidates: candidates.filter((c) => c.candidate).map((c) => c.candidate),
      })
    }
    return result
  }

  async updateStage(stageId: string, data: { candidateIds: string[] }, companyId: string) {
    const stageIndex = parseInt(stageId.replace('stage_', ''))
    const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Offer', 'Joined']
    const title = stages[stageIndex] || 'Applied'

    await this.prisma.pipelineStage.deleteMany({ where: { companyId, title } })

    const stageData = data.candidateIds.map((candidateId, idx) => ({
      companyId,
      title,
      candidateId,
      orderIndex: idx,
    }))
    await this.prisma.pipelineStage.createMany({ data: stageData })
    return { success: true }
  }
}
