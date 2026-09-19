import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'

@Controller('users')
@UseGuards(RolesGuard)
@Roles('super_admin', 'admin')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  async create(@Body() data: { name: string; email: string; password: string; role: string }) {
    return this.usersService.create(data)
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.updateStatus(id, status)
  }
}
