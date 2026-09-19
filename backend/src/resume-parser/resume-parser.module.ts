import { Module } from '@nestjs/common';
import { ResumeParserController } from './resume-parser.controller';
import { ResumeParserService } from './resume-parser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { GeminiModule } from '../common/ai/gemini.module';

@Module({
  imports: [PrismaModule, DocumentsModule, GeminiModule],
  controllers: [ResumeParserController],
  providers: [ResumeParserService],
  exports: [ResumeParserService],
})
export class ResumeParserModule {}
