import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../common/ai/gemini.module';
import { OffersService } from './offers.service';
import {
  EmployerOffersController,
  CandidateOffersController,
} from './offers.controller';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [EmployerOffersController, CandidateOffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
