import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { PrismaService } from '../prisma/prisma.service'
import { getRequirementSubmittedHtml } from './templates/requirement-submitted'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(MailService.name)
  private readonly from = 'thozhilkoodam@gmail.com'

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || this.from,
        pass: process.env.SMTP_PASS || '',
      },
    })
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html })
      await this.prisma.emailLog.create({
        data: { recipient: to, subject, status: 'sent' },
      })
      this.logger.log(`Email sent to ${to}: ${subject}`)
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`)
      await this.prisma.emailLog.create({
        data: {
          recipient: to,
          subject,
          status: 'failed',
          errorMessage: error.message,
        },
      })
    }
  }

  async sendRegistrationNotification(data: {
    companyId: string
    agencyName: string
    contactPerson: string
    email: string
  }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">New Agency Registration</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">A new Recruitment Agency has registered on Thozhil Koodam.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Company ID</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${data.companyId}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Agency Name</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${data.agencyName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Contact Person</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${data.contactPerson}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Official Email</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${data.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Status</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #f59e0b;">Pending Approval</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Open the Admin Dashboard to review this registration.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/agencies/pending" style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Open Admin Dashboard</a>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(this.from, 'New Recruitment Agency Registration', html)
  }

  async sendApprovalEmail(to: string, data: { agencyName: string; companyId: string }) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Congratulations!</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.agencyName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Congratulations!</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your Recruitment Agency has been approved.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Company ID</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; font-family: monospace;">${data.companyId}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 14px; color: #374151;">You can now login using your registered email and password.</p>
          <a href="${loginUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Login to Your Account</a>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Thank you.</p>
          <p style="font-size: 13px; color: #6b7280;">Thozhil Koodam Team</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Your Recruitment Agency Has Been Approved', html)
  }

  async sendRejectionEmail(to: string, data: { agencyName: string; reason: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Registration Update</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.agencyName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Unfortunately, your registration has been rejected.</p>
          <div style="margin-top: 16px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
            <p style="font-size: 13px; color: #dc2626; font-weight: 600; margin: 0 0 4px 0;">Reason:</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">${data.reason}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">If you believe this is an error, please contact us at <a href="mailto:thozhilkoodam@gmail.com" style="color: #3b82f6;">thozhilkoodam@gmail.com</a>.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Recruitment Agency Registration Rejected', html)
  }

  async sendRequirementSubmitted(clientEmail: string, data: {
    companyName: string
    position: string
    vacancies: number
    requirementId: string
  }) {
    const html = getRequirementSubmittedHtml(data)
    await this.sendMail(clientEmail, 'Requirement Submitted Successfully - Thozhil Koodam', html)
  }

  async sendHrConsultantInvitation(to: string, data: {
    consultantName: string
    agencyName: string
    employeeId: string
    activationToken: string
  }) {
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/business-operations/hr-consultant/activate?token=${data.activationToken}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Welcome to Thozhil Koodam</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.consultantName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Congratulations!</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your HR Consultant account has been created by <strong>${data.agencyName}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">Employee ID</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; font-family: monospace;">${data.employeeId}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 14px; color: #374151;">Please activate your account.</p>
          <a href="${activationUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #0f766e; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Activate Account</a>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">The activation link expires in 24 hours.</p>
          <p style="font-size: 13px; color: #6b7280;">Regards,<br/>Thozhil Koodam</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Welcome to Thozhil Koodam', html)
  }

  async sendJobApprovalEmail(to: string, data: { agencyName: string; jobTitle: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Job Posting Approved</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.agencyName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your job posting has been approved and is now live.</p>
          <div style="margin-top: 16px; padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Job Title:</p>
            <p style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0;">${data.jobTitle}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">The job is now visible on the Thozhil Koodam Job Portal.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/job-portal" style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">View Job Portal</a>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Job Posting Approved', html)
  }

  async sendJobRejectionEmail(to: string, data: { agencyName: string; jobTitle: string; reason: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Job Posting Update</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.agencyName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your job posting has been reviewed and was not approved at this time.</p>
          <div style="margin-top: 16px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Job Title:</p>
            <p style="font-size: 16px; font-weight: 600; color: #991b1b; margin: 0;">${data.jobTitle}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">Reason:</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">${data.reason}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">You can edit the job and resubmit for review.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Job Posting Update', html)
  }

  async sendJobChangesRequestedEmail(to: string, data: { agencyName: string; jobTitle: string; changes: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Changes Requested</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.agencyName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">The admin has requested changes to your job posting before it can be approved.</p>
          <div style="margin-top: 16px; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Job Title:</p>
            <p style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0;">${data.jobTitle}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">Changes Needed:</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">${data.changes}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Please update the job posting and resubmit for review.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Changes Requested for Job Posting', html)
  }

  async sendHrRecruiterWelcomeEmail(to: string, data: { name: string; employeeId: string; email: string; password: string; loginUrl: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Welcome to Thozhil Koodam</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.name},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your HR Recruiter account has been created.</p>
          <div style="margin-top: 16px; padding: 16px; background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 6px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Employee ID:</p>
            <p style="font-size: 16px; font-weight: 600; color: #7c3aed; margin: 0;">${data.employeeId}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">Login URL:</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">${data.loginUrl}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">Email:</p>
            <p style="font-size: 14px; color: #374151; margin: 0;">${data.email}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">Temporary Password:</p>
            <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0;">${data.password}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Please log in and change your password on first login.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Welcome to Thozhil Koodam', html)
  }

  async sendPasswordResetEmail(to: string, data: { name: string; newPassword: string; loginUrl: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Password Reset</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dear ${data.name},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your password has been reset by the admin.</p>
          <div style="margin-top: 16px; padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0;">New Password:</p>
            <p style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 4px 0 0 0;">${data.newPassword}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Please log in at <a href="${data.loginUrl}" style="color: #3b82f6;">${data.loginUrl}</a> and change your password immediately.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">Thozhil Koodam &bull; Enterprise Recruitment Platform</div>
      </div>`
    await this.sendMail(to, 'Password Reset', html)
  }

  async sendTestEmail(to: string, subject: string, html: string) {
    await this.sendMail(to, subject, html)
  }
}
