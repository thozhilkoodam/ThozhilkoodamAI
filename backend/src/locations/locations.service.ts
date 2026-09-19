import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findCountries(search?: string) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}
    return this.prisma.country.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  async findStates(countryId: number, search?: string) {
    const where: any = { countryId }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }
    return this.prisma.state.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  async findDistricts(stateId: number, search?: string) {
    const where: any = { stateId }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }
    return this.prisma.district.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  async findCities(districtId: number, search?: string) {
    const where: any = { districtId }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const }
    }
    return this.prisma.city.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }
}
