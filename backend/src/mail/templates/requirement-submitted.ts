export function getRequirementSubmittedHtml(data: {
  companyName: string
  position: string
  vacancies: number
  requirementId: string
}): string {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const supportEmail = 'thozhilkoodam@gmail.com'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding: 32px 32px 16px 32px; text-align: center;">
                  <img src="${frontendUrl}/logo.png" alt="Thozhil Koodam" width="180" style="margin-bottom: 16px;" />
                </td>
              </tr>
              <tr>
                <td style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 32px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Requirement Submitted</h1>
                  <p style="color: #d8b4fe; margin: 8px 0 0 0; font-size: 14px;">Your recruitment requirement has been received</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px;">
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 4px 0;">Dear ${data.companyName},</p>
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for submitting your recruitment requirement. Our team will review the details and assign a dedicated recruiter to assist you.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border: 1px solid #e9d5ff; border-radius: 8px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size: 13px; color: #6b7280; width: 40%;">Requirement ID</td>
                                  <td style="font-size: 14px; font-weight: 600; color: #6d28d9; font-family: monospace;">${data.requirementId}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size: 13px; color: #6b7280; width: 40%;">Company Name</td>
                                  <td style="font-size: 14px; font-weight: 600; color: #111827;">${data.companyName}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size: 13px; color: #6b7280; width: 40%;">Position</td>
                                  <td style="font-size: 14px; font-weight: 600; color: #111827;">${data.position}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="font-size: 13px; color: #6b7280; width: 40%;">Vacancies</td>
                                  <td style="font-size: 14px; font-weight: 600; color: #111827;">${data.vacancies}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${frontendUrl}/client/requirements/${data.requirementId}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Track Status</a>
                  </div>

                  <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 4px 0;">Need help or have questions?</p>
                  <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                    Contact us at <a href="mailto:${supportEmail}" style="color: #7c3aed; text-decoration: none; font-weight: 500;">${supportEmail}</a> or call our support team.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 0 8px;">
                              <a href="${frontendUrl}" style="display: inline-block; width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none; font-size: 14px;">f</a>
                            </td>
                            <td style="padding: 0 8px;">
                              <a href="${frontendUrl}" style="display: inline-block; width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none; font-size: 14px;">in</a>
                            </td>
                            <td style="padding: 0 8px;">
                              <a href="${frontendUrl}" style="display: inline-block; width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; line-height: 32px; color: #fff; text-decoration: none; font-size: 14px;">X</a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">
                          Thozhil Koodam &bull; Enterprise Recruitment Platform<br />
                          <a href="mailto:${supportEmail}" style="color: #7c3aed; text-decoration: none;">${supportEmail}</a>
                        </p>
                        <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">
                          This is an automated message. Please do not reply directly.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
