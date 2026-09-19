import { Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { CandidateAuthService } from './candidate-auth.service'
import { Public } from '../common/public.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('candidate-auth')
export class CandidateAuthController {
  constructor(private service: CandidateAuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: { name: string; email: string; password: string; phone?: string }) {
    return this.service.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; password: string }) {
    return this.service.login(dto)
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: { phone: string }) {
    return this.service.sendOtp(dto)
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: { phone: string; otp: string }) {
    return this.service.verifyOtp(dto)
  }

  @Public()
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: { googleId: string; email: string; name: string; photo?: string }) {
    return this.service.googleLogin(dto)
  }

  @Public()
  @Post('google-setup')
  @HttpCode(HttpStatus.OK)
  async googleSetup(@Body() dto: { googleId: string; email: string; name: string; photo?: string; phone: string; otp: string }) {
    return this.service.googleSetup(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-profile')
  async checkProfile(@CurrentUser('id') userId: string) {
    return this.service.checkProfile(userId)
  }
}
