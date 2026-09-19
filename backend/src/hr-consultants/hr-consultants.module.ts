import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { HrConsultantsController } from './hr-consultants.controller'
import { HrConsultantsService } from './hr-consultants.service'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thozhil-koodam-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [HrConsultantsController],
  providers: [HrConsultantsService],
  exports: [HrConsultantsService],
})
export class HrConsultantsModule {}
