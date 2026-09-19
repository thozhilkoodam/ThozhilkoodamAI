import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { CompanyLoginDto } from './dto/company-login.dto'
import { Public } from '../common/public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Public()
  @Post('company-login')
  @HttpCode(HttpStatus.OK)
  async companyLogin(@Body() dto: CompanyLoginDto) {
    return this.authService.loginCompany(dto)
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }
}
