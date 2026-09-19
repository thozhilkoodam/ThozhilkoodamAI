import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiService } from '../common/ai/gemini.service';
import { ScreeningService } from './screening.service';
import { ScreeningController } from './screening.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ScreeningController],
  providers: [ScreeningService, GeminiService],
  exports: [ScreeningService],
})
export class ScreeningModule {}
