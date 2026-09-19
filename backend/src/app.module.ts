import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { CompaniesModule } from './companies/companies.module'
import { UsersModule } from './users/users.module'
import { NotificationsModule } from './notifications/notifications.module'
import { AuditLogsModule } from './audit-logs/audit-logs.module'
import { UploadModule } from './upload/upload.module'
import { PaymentsModule } from './payments/payments.module'
import { JobsModule } from './jobs/jobs.module'
import { CandidatesModule } from './candidates/candidates.module'
import { PipelineModule } from './pipeline/pipeline.module'
import { TeamModule } from './team/team.module'
import { MailModule } from './mail/mail.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { RolesGuard } from './common/roles.guard'
import { HrRecruitersModule } from './hr-recruiters/hr-recruiters.module';
import { MsmeClientsModule } from './msme-clients/msme-clients.module';
import { RequirementsModule } from './requirements/requirements.module';
import { QuotationsModule } from './quotations/quotations.module';
import { MeetingsModule } from './meetings/meetings.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { CandidateAuthModule } from './candidate-auth/candidate-auth.module';
import { CandidatePortalModule } from './candidate-portal/candidate-portal.module';
import { HrConsultantsModule } from './hr-consultants/hr-consultants.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { SmsTemplatesModule } from './sms-templates/sms-templates.module';
import { LocationsModule } from './locations/locations.module';
import { Msg91Module } from './msg91/msg91.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { MasterDataModule } from './master-data/master-data.module';
import { SkillsModule } from './skills/skills.module';
import { ResumeParserModule } from './resume-parser/resume-parser.module';
import { DocumentsModule } from './documents/documents.module';
import { ResumeAnalysisModule } from './resume-analysis/resume-analysis.module';
import { JobMatchingModule } from './job-matching/job-matching.module';
import { ApplicationsModule } from './applications/applications.module';
import { ScreeningModule } from './screening/screening.module';
import { InterviewsModule } from './interviews/interviews.module';
import { OffersModule } from './offers/offers.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    NotificationsModule,
    AuditLogsModule,
    UploadModule,
    PaymentsModule,
    JobsModule,
    CandidatesModule,
    PipelineModule,
    TeamModule,
    MailModule,
    HrRecruitersModule,
    MsmeClientsModule,
    RequirementsModule,
    QuotationsModule,
    MeetingsModule,
    SupportTicketsModule,
    HrConsultantsModule,
    CandidateAuthModule,
    CandidatePortalModule,
    EmailTemplatesModule,
    SmsTemplatesModule,
    LocationsModule,
    Msg91Module,
    InstitutionsModule,
    MasterDataModule,
    SkillsModule,
    ResumeParserModule,
    DocumentsModule,
    ResumeAnalysisModule,
    JobMatchingModule,
    ApplicationsModule,
    ScreeningModule,
    InterviewsModule,
    OffersModule,
    OnboardingModule,
  ],

  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
