import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { MsmeClientsController } from './msme-clients.controller'
import { MsmeClientsService } from './msme-clients.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'thozhil-koodam-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MsmeClientsController],
  providers: [MsmeClientsService],
  exports: [MsmeClientsService],
})
export class MsmeClientsModule {}
