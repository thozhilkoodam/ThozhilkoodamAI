import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common'
import { Public } from '../common/public.decorator'
import { LocationsService } from './locations.service'

@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  async getCountries(@Query('search') search?: string) {
    return this.locationsService.findCountries(search)
  }

  @Get('states')
  async getStates(
    @Query('countryId', ParseIntPipe) countryId: number,
    @Query('search') search?: string,
  ) {
    return this.locationsService.findStates(countryId, search)
  }

  @Get('districts')
  async getDistricts(
    @Query('stateId', ParseIntPipe) stateId: number,
    @Query('search') search?: string,
  ) {
    return this.locationsService.findDistricts(stateId, search)
  }

  @Get('cities')
  async getCities(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('search') search?: string,
  ) {
    return this.locationsService.findCities(districtId, search)
  }
}
