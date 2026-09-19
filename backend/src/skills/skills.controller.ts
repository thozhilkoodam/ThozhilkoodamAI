import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common'
import { SkillsService } from './skills.service'
import { Public } from '../common/public.decorator'
import { SkillCategory } from '@prisma/client'

@Controller('skills')
export class SkillsController {
  constructor(private service: SkillsService) {}

  @Public()
  @Get()
  getSkills(@Query('category') category?: string, @Query('search') search?: string) {
    return this.service.getSkills(category, search)
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.service.getCategories()
  }

  @Post()
  createSkill(@Body('name') name: string, @Body('category') category: SkillCategory) {
    return this.service.createSkill(name, category)
  }

  @Put(':id')
  updateSkill(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.service.updateSkill(id, name)
  }

  @Delete(':id')
  deleteSkill(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSkill(id)
  }
}
