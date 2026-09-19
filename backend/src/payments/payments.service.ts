import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createOrder(companyId: string, planId: string) {
    const plan = await this.prisma.subscription.findUnique({ where: { id: planId } })
    if (!plan) throw new BadRequestException('Plan not found')

    const amountInPaise = Math.round(plan.price * 100)
    const orderId = `order_${Date.now()}`

    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        amount: plan.price,
        orderId,
        status: 'pending',
      },
    })

    return { orderId: payment.orderId, amount: amountInPaise, currency: 'INR', paymentId: payment.id }
  }

  async verifyPayment(data: { paymentId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const payment = await this.prisma.payment.findUnique({ where: { id: data.paymentId } })
    if (!payment) throw new BadRequestException('Payment not found')

    await this.prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: 'completed',
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
      },
    })

    const company = await this.prisma.company.findUnique({ where: { id: payment.companyId } })
    if (company) {
      await this.prisma.subscription.create({
        data: {
          companyId: company.id,
          planName: 'Premium',
          jobPosts: 50,
          candidateAccess: 1500,
          teamMembers: 10,
          validityMonths: 12,
          price: 35000,
          endDate: new Date(Date.now() + 365 * 86400000),
        },
      })
    }

    return { success: true, message: 'Payment verified and subscription activated.' }
  }

  async getMySubscription(companyId: string) {
    return this.prisma.subscription.findFirst({
      where: { companyId, status: 'active', endDate: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPayments(companyId?: string) {
    const where = companyId ? { companyId } : {}
    return this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async getSubscriptions(companyId?: string) {
    const where = companyId ? { companyId } : {}
    return this.prisma.subscription.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async getRevenue() {
    const result = await this.prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    })
    return { revenue: result._sum.amount || 0 }
  }
}
