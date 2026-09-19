import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SkillCategory } from '@prisma/client'

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  getCategories() {
    return Object.values(SkillCategory)
  }

  getSkills(category?: string, search?: string) {
    const where: any = {}
    if (category && Object.values(SkillCategory).includes(category as SkillCategory)) {
      where.category = category as SkillCategory
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    return this.prisma.skill.findMany({ where, orderBy: { name: 'asc' } })
  }

  createSkill(name: string, category: SkillCategory) {
    return this.prisma.skill.create({ data: { name, category } })
  }

  updateSkill(id: number, name: string) {
    return this.prisma.skill.update({ where: { id }, data: { name } })
  }

  deleteSkill(id: number) {
    return this.prisma.skill.delete({ where: { id } })
  }
}
