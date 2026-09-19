import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { CandidatesService } from './candidates.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  async findAll(@Query() filters: any) {
    if (filters.search) return this.candidatesService.search(filters.search)
    return this.candidatesService.findAll(filters)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id)
  }
}
