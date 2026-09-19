import { Module } from '@nestjs/common'
import { CandidatePortalController } from './candidate-portal.controller'
import { CandidatePortalService } from './candidate-portal.service'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thozhil-koodam-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CandidatePortalController],
  providers: [CandidatePortalService],
  exports: [CandidatePortalService],
})
export class CandidatePortalModule {}
