import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ScreeningService } from './screening.service';

@Controller('employer/applications')
@UseGuards(JwtAuthGuard)
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Post(':id/ai-screen')
  async screenApplication(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('reScreen') reScreen?: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    const forceRescreen = reScreen === 'true' || reScreen === '1';
    return this.screeningService.screenApplication(id, companyId, forceRescreen);
  }

  @Get(':id/ai-screen')
  async getScreening(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const companyId = user?.id;
    if (!companyId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.screeningService.getScreening(id, companyId);
  }
}
