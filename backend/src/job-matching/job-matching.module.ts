import { Module } from '@nestjs/common';
import { JobMatchingService } from './job-matching.service';
import { JobMatchingController } from './job-matching.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../common/ai/gemini.module';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [JobMatchingController],
  providers: [JobMatchingService],
  exports: [JobMatchingService],
})
export class JobMatchingModule {}
