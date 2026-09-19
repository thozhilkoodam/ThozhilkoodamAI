import { Injectable } from '@nestjs/common'

@Injectable()
export class Msg91Service {
  private authKey: string
  private templateId: string

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || ''
    this.templateId = process.env.MSG91_TEMPLATE_ID || ''
  }

  get isConfigured(): boolean {
    return !!(this.authKey && this.templateId)
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`[MSG91] Not configured. OTP for ${phone}: ${otp}`)
      return true
    }

    try {
      const mobile = `91${phone.replace(/\D/g, '')}`
      const res = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: this.templateId,
          mobile,
          authkey: this.authKey,
          otp,
          otp_expiry: 5,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error(`[MSG91] Send OTP failed (${res.status}): ${body}`)
        return false
      }
      return true
    } catch (err) {
      console.error('[MSG91] Send OTP error:', err)
      return false
    }
  }
}
