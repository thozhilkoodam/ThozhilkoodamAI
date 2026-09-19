import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common'
import { MasterDataService } from './master-data.service'
import { Public } from '../common/public.decorator'

@Controller('master-data')
export class MasterDataController {
  constructor(private service: MasterDataService) {}

  @Public()
  @Get('job-roles')
  getJobRoles(@Query('search') search?: string) {
    return this.service.getJobRoles(search)
  }

  @Post('job-roles')
  createJobRole(@Body('name') name: string) {
    return this.service.createJobRole(name)
  }

  @Put('job-roles/:id')
  updateJobRole(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.service.updateJobRole(id, name)
  }

  @Delete('job-roles/:id')
  deleteJobRole(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteJobRole(id)
  }

  @Public()
  @Get('industries')
  getIndustries(@Query('search') search?: string) {
    return this.service.getIndustries(search)
  }

  @Post('industries')
  createIndustry(@Body('name') name: string) {
    return this.service.createIndustry(name)
  }

  @Put('industries/:id')
  updateIndustry(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.service.updateIndustry(id, name)
  }

  @Delete('industries/:id')
  deleteIndustry(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteIndustry(id)
  }

  @Public()
  @Get('locations')
  getLocations(@Query('search') search?: string) {
    return this.service.getLocations(search)
  }

  @Post('locations')
  createLocation(@Body('name') name: string) {
    return this.service.createLocation(name)
  }

  @Put('locations/:id')
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.service.updateLocation(id, name)
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLocation(id)
  }
}
