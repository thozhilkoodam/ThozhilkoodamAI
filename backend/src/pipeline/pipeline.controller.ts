import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common'
import { PipelineService } from './pipeline.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('pipeline')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Get()
  async getPipeline(@CurrentUser('id') companyId: string) {
    return this.pipelineService.getPipeline(companyId)
  }

  @Put(':stageId')
  async updateStage(
    @Param('stageId') stageId: string,
    @Body() data: { candidates: any[] },
    @CurrentUser('id') companyId: string,
  ) {
    return this.pipelineService.updateStage(
      stageId,
      { candidateIds: data.candidates.map((c: any) => c.id) },
      companyId,
    )
  }
}
