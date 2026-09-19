import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { CandidateAuthController } from './candidate-auth.controller'
import { CandidateAuthService } from './candidate-auth.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thozhil-koodam-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CandidateAuthController],
  providers: [CandidateAuthService],
  exports: [CandidateAuthService],
})
export class CandidateAuthModule {}
