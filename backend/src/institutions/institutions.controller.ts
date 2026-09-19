import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe } from '@nestjs/common'
import { Public } from '../common/public.decorator'
import { InstitutionsService } from './institutions.service'

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Public()
  @Get('colleges')
  async getColleges(@Query('search') search?: string) {
    return this.institutionsService.findColleges(search)
  }

  @Public()
  @Get('universities')
  async getUniversities(@Query('search') search?: string) {
    return this.institutionsService.findUniversities(search)
  }

  @Public()
  @Post('colleges')
  async createCollege(@Body('name') name: string) {
    return this.institutionsService.createCollege(name)
  }

  @Public()
  @Post('universities')
  async createUniversity(@Body('name') name: string) {
    return this.institutionsService.createUniversity(name)
  }

  @Get('admin/colleges')
  async adminColleges(@Query('status') status?: string) {
    return this.institutionsService.adminColleges(status)
  }

  @Get('admin/universities')
  async adminUniversities(@Query('status') status?: string) {
    return this.institutionsService.adminUniversities(status)
  }

  @Patch('admin/colleges/:id/status')
  async updateCollegeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.institutionsService.updateCollegeStatus(id, status)
  }

  @Patch('admin/universities/:id/status')
  async updateUniversityStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.institutionsService.updateUniversityStatus(id, status)
  }
}
