import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/current-user.decorator'

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @Roles('recruitment_agency', 'hr_recruiter', 'msme_client')
  async createOrder(@CurrentUser('id') userId: string, @Body('planId') planId: string) {
    return this.paymentsService.createOrder(userId, planId)
  }

  @Post('verify')
  @Roles('recruitment_agency', 'hr_recruiter', 'msme_client')
  async verifyPayment(@Body() data: { paymentId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.paymentsService.verifyPayment(data)
  }

  @Get('my-subscription')
  @Roles('recruitment_agency', 'hr_recruiter', 'msme_client')
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.paymentsService.getMySubscription(userId)
  }

  @Get('my-payments')
  @Roles('recruitment_agency', 'hr_recruiter', 'msme_client')
  async getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getPayments(userId)
  }

  @Get('payments')
  @Roles('super_admin', 'admin')
  async getPayments() {
    return this.paymentsService.getPayments()
  }

  @Get('subscriptions')
  @Roles('super_admin', 'admin')
  async getSubscriptions() {
    return this.paymentsService.getSubscriptions()
  }

  @Get('revenue')
  @Roles('super_admin', 'admin')
  async getRevenue() {
    return this.paymentsService.getRevenue()
  }
}
