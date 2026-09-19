import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { OnboardingService } from './onboarding.service';
import {
  EmployerOnboardingController,
  CandidateOnboardingController,
} from './onboarding.controller';

@Module({
  imports: [PrismaModule, DocumentsModule],
  controllers: [EmployerOnboardingController, CandidateOnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
