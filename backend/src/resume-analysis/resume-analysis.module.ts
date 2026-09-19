import { Module } from '@nestjs/common';
import { ResumeAnalysisController } from './resume-analysis.controller';
import { ResumeAnalysisService } from './resume-analysis.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../common/ai/gemini.module';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [ResumeAnalysisController],
  providers: [ResumeAnalysisService],
  exports: [ResumeAnalysisService],
})
export class ResumeAnalysisModule {}
