import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { HrRecruitersController } from './hr-recruiters.controller'
import { HrRecruitersService } from './hr-recruiters.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thozhil-koodam-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [HrRecruitersController],
  providers: [HrRecruitersService],
  exports: [HrRecruitersService],
})
export class HrRecruitersModule {}
