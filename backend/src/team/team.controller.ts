import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { TeamService } from './team.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get()
  async getMembers(@CurrentUser('id') companyId: string) {
    return this.teamService.getMembers(companyId)
  }

  @Post('invite')
  async invite(@Body() data: { name: string; email: string; role: string }, @CurrentUser('id') companyId: string) {
    return this.teamService.invite(data, companyId)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.teamService.remove(id)
  }
}
