import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../common/ai/gemini.module';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
