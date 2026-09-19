# Email & SMS Templates — Full Workflow

## Overview

The Templates Management Module lets admins create, edit, preview, test, and manage all email and SMS notification templates from a centralized UI — without touching code.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Admin Portal (Next.js)                     │
│  /admin/email-templates/*  │  /admin/sms-templates/*          │
│         │                              │                      │
│    api.emailTemplates.*          api.smsTemplates.*           │
└─────────┼──────────────────────────────┼──────────────────────┘
          │                              │
┌─────────▼──────────────────────────────▼──────────────────────┐
│              NestJS Backend (API Gateway)                     │
│  EmailTemplatesController       SmsTemplatesController         │
│  EmailTemplatesService          SmsTemplatesService            │
└─────────┬──────────────────────────────┬──────────────────────┘
          │                              │
┌─────────▼──────────────────────────────▼──────────────────────┐
│                    Prisma ORM / PostgreSQL                    │
│  email_templates table          sms_templates table            │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### `email_templates` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_key` | String (unique) | Machine-readable key (e.g. `welcome_email`) |
| `template_name` | String | Human-readable name (e.g. "Welcome Email") |
| `category` | String | Group: Authentication, Recruitment, Business, Billing, Support |
| `subject` | String | Email subject line (supports `{{variables}}`) |
| `body` | Text | HTML email body (supports `{{variables}}`) |
| `variables` | JSON string | Array of variable names the template uses |
| `status` | String | `active` or `inactive` |
| `description` | Text? | Internal notes |
| `created_by` | String? | Admin user ID who created it |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

### `sms_templates` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_key` | String (unique) | Machine-readable key (e.g. `otp_verification`) |
| `template_name` | String | Human-readable name |
| `category` | String | Group: Authentication, Recruitment, Business, Billing |
| `message` | Text | SMS message body (supports `{{variables}}`) |
| `variables` | JSON string | Array of variable names the template uses |
| `status` | String | `active` or `inactive` |
| `description` | Text? | Internal notes |
| `created_by` | String? | Admin user ID |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

---

## 3. Backend API Endpoints

### Email Templates — `GET|POST|PATCH|DELETE /api/email-templates`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/email-templates` | List all templates (search, filter, paginate) | Admin |
| `GET` | `/api/email-templates/:id` | Get single template | Admin |
| `GET` | `/api/email-templates/:id/preview` | Render template with sample variables | Admin |
| `POST` | `/api/email-templates` | Create new template | Admin |
| `PATCH` | `/api/email-templates/:id` | Update template | Admin |
| `DELETE` | `/api/email-templates/:id` | Delete template permanently | Admin |
| `POST` | `/api/email-templates/:id/duplicate` | Clone a template as `inactive` | Admin |
| `POST` | `/api/email-templates/:id/toggle-status` | Flip `active` ↔ `inactive` | Admin |
| `POST` | `/api/email-templates/:id/send-test` | Send test email to specified address | Admin |

### SMS Templates — `GET|POST|PATCH|DELETE /api/sms-templates`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/sms-templates` | List all templates (search, filter, paginate) | Admin |
| `GET` | `/api/sms-templates/:id` | Get single template | Admin |
| `GET` | `/api/sms-templates/:id/preview` | Render template with sample variables + character count | Admin |
| `POST` | `/api/sms-templates` | Create new template | Admin |
| `PATCH` | `/api/sms-templates/:id` | Update template | Admin |
| `DELETE` | `/api/sms-templates/:id` | Delete template permanently | Admin |
| `POST` | `/api/sms-templates/:id/duplicate` | Clone a template as `inactive` | Admin |
| `POST` | `/api/sms-templates/:id/toggle-status` | Flip `active` ↔ `inactive` | Admin |
| `POST` | `/api/sms-templates/:id/send-test` | Send test SMS to specified phone number | Admin |

### Query Parameters for `GET /api/email-templates` and `GET /api/sms-templates`

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | string | `welcome` | Searches name, key, category, subject/message |
| `category` | string | `Authentication` | Filter by exact category |
| `status` | string | `active` | Filter by status |
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `20` | Items per page (1-50) |

### Response shape (list)

```json
{
  "templates": [ { "id": "...", "templateKey": "...", ... } ],
  "total": 27,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

## 4. Frontend Pages

| Route | Purpose |
|-------|---------|
| `/admin/email-templates` | Email templates listing (search, filter, paginate, actions) |
| `/admin/email-templates/create` | Create new email template |
| `/admin/email-templates/[id]` | View details, desktop/mobile/source preview, send test |
| `/admin/email-templates/[id]/edit` | Edit existing email template |
| `/admin/sms-templates` | SMS templates listing |
| `/admin/sms-templates/create` | Create new SMS template with character counter |
| `/admin/sms-templates/[id]` | View details, phone-style preview, send test |
| `/admin/sms-templates/[id]/edit` | Edit existing SMS template |

---

## 5. Full Template Lifecycle

```
   ┌──────────┐
   │  DRAFT   │  ← Created via Create form (status: inactive)
   └────┬─────┘
        │
        ▼
  ┌───────────┐
  │  PREVIEW  │  ← Admin previews rendering with sample variables
  └─────┬─────┘
        │
        ▼
  ┌───────────┐      ┌──────────────┐
  │   TEST    │──────│ Send Test    │  ← Admin sends test email/SMS
  └─────┬─────┘      └──────────────┘
        │
        ▼
  ┌───────────┐
  │  ACTIVE   │  ← Toggle status to "active"
  └─────┬─────┘
        │
        ▼
  ┌───────────┐
  │ IN USE    │  ← Backend services reference templateKey
  └─────┬─────┘
        │
        ├─────────────────────────────────────┐
        ▼                                     ▼
  ┌───────────┐                       ┌──────────────┐
  │ INACTIVE  │                       │  DUPLICATE   │  ← Clone for variant
  └───────────┘                       └──────────────┘
        │
        ▼
  ┌───────────┐
  │  DELETED  │  ← Permanent deletion (with confirmation)
  └───────────┘
```

### Step-by-step

1. **Navigate** to `/admin/email-templates` or `/admin/sms-templates`
2. **Search/Filter** to find existing templates
3. **Create**: Click "Create Template", fill the form (RichTextEditor for email), click Save
4. **Edit**: Click the row's Edit action to modify any field
5. **Preview**: Open the View page → see Desktop/Mobile/Source tabs
6. **Test**: Enter an email address or phone number → click Send Test
7. **Activate**: Click Toggle Status to set as `active` (inactive templates are skipped during sending)
8. **Duplicate**: Click Duplicate to create a variant copy (new copy starts as `inactive`)
9. **Delete**: Click Delete → confirm dialog → permanently removed

---

## 6. Variable Substitution

### Email variables

| Variable | Sample Value | Used In |
|----------|-------------|---------|
| `{{candidate_name}}` | John Doe | Recruitment emails |
| `{{company_name}}` | Acme Corp | Business emails |
| `{{agency_name}}` | TechRecruit Agency | Agency emails |
| `{{recruiter_name}}` | Jane Smith | Internal notifications |
| `{{job_title}}` | Senior Software Engineer | Job-related emails |
| `{{employee_id}}` | HRTK000001 | Account creation |
| `{{email}}` | user@example.com | Any |
| `{{phone}}` | +91 98765 43210 | Any |
| `{{otp}}` | 123456 | Authentication |
| `{{verification_link}}` | https://.../verify?token=... | Email verification |
| `{{reset_link}}` | https://.../reset?token=... | Password reset |
| `{{login_url}}` | https://app.thozhilkoodam.com/login | Login prompts |
| `{{meeting_link}}` | https://meet.google.com/... | Interview scheduling |
| `{{date}}` | 15/07/2026 | Any date display |
| `{{time}}` | 10:00 AM | Any time display |
| `{{amount}}` | ₹5,999 | Billing |
| `{{plan}}` | Professional | Subscription |
| `{{invoice_number}}` | INV-2024-001 | Billing |
| `{{support_email}}` | support@thozhilkoodam.com | Support |

### SMS variables

| Variable | Sample Value | Used In |
|----------|-------------|---------|
| `{{name}}` | John Doe | Any |
| `{{otp}}` | 123456 | Authentication |
| `{{job_title}}` | Senior Software Engineer | Recruitment |
| `{{company_name}}` | Acme Corp | Business |
| `{{date}}` | 15/07/2026 | Scheduling |
| `{{time}}` | 10:00 AM | Scheduling |
| `{{amount}}` | ₹5,999 | Billing |
| `{{plan}}` | Professional | Subscription |
| `{{login_url}}` | https://.../login | Login prompts |

### Substitution logic

The `preview()` method replaces all `{{variable}}` placeholders with sample values using a simple regex:

```typescript
html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
```

When integrating into real services, the same regex pattern should be used with real data at the point of sending.

---

## 7. How to Integrate Templates into Services

To use templates in backend services instead of hardcoded HTML:

```typescript
// Example: Welcome email using template
async sendWelcomeEmail(user: User) {
  const template = await this.prisma.emailTemplate.findUnique({
    where: { templateKey: 'welcome_email' }
  })

  if (!template || template.status !== 'active') {
    // Fallback: send a basic email or skip
    return
  }

  let html = template.body
    .replace(/\{\{candidate_name\}\}/g, user.name)
    .replace(/\{\{company_name\}\}/g, user.companyName)
    .replace(/\{\{email\}\}/g, user.email)
    .replace(/\{\{login_url\}\}/g, `${process.env.FRONTEND_URL}/login`)

  let subject = template.subject
    .replace(/\{\{candidate_name\}\}/g, user.name)
    .replace(/\{\{company_name\}\}/g, user.companyName)

  await this.mailService.sendTestEmail(user.email, subject, html)
}
```

The same pattern applies for SMS templates:

```typescript
async sendOtpSms(phone: string, otp: string) {
  const template = await this.prisma.smsTemplate.findUnique({
    where: { templateKey: 'otp_verification' }
  })
  if (!template || template.status !== 'active') return

  const message = template.message.replace(/\{\{otp\}\}/g, otp)
  // Send via SMS gateway...
}
```

### Lookup by templateKey (recommended)

Each template has a `templateKey` that never changes once set. Always reference templates by their key in your service code:

| templateKey | Service |
|-------------|---------|
| `welcome_email` | AuthService / UserService |
| `email_verification` | AuthService |
| `password_reset` | AuthService |
| `job_posted_success` | JobsService |
| `job_approved` | JobsService / AdminService |
| `job_rejected` | JobsService / AdminService |
| `candidate_applied` | CandidatePortalService |
| `interview_scheduled` | InterviewService |
| `interview_reminder` | Cron / Scheduler |
| `offer_letter` | PipelineService |
| `agency_registration_received` | CompaniesService |
| `agency_approved` | AdminService |
| `agency_rejected` | AdminService |
| `hr_recruiter_account_created` | HrRecruitersService |
| `msme_registration_received` | MsmeClientsService |
| `msme_approved` | AdminService |
| `msme_requirement_received` | RequirementsService |
| `payment_successful` | PaymentsService |
| `payment_failed` | PaymentsService |
| `invoice` | BillingService |
| `subscription_activated` | SubscriptionService |
| `subscription_expiring` | Cron / Scheduler |
| `subscription_expired` | Cron / Scheduler |
| `contact_form_submitted` | SupportService |
| `support_ticket_created` | SupportService |
| `ticket_closed` | SupportService |
| `otp_verification` (SMS) | AuthService |
| `password_reset_otp` (SMS) | AuthService |
| `sms_interview_reminder` (SMS) | InterviewService |

---

## 8. Seed Data

Run the seed script to populate all 27 email templates and 9 SMS templates:

```bash
cd backend
npx ts-node prisma/seed-templates.ts
```

Templates are upserted by `templateKey`, so re-running the seed updates existing templates without creating duplicates.

---

## 9. Testing Flow

### Email Template Test

1. Go to `/admin/email-templates`
2. Click any template → View
3. Under "Send Test Email", enter an email address
4. Click "Send Test Email"
5. Check inbox — the email should render with sample data substituted

### SMS Template Test

1. Go to `/admin/sms-templates`
2. Click any template → View
3. Under "Send Test SMS", enter a phone number
4. Click "Send Test SMS"
5. In development, the message is logged to console. In production, it goes through the SMS gateway.

---

## 10. API Client Usage (Frontend)

```typescript
import { api } from '@/lib/api-client'

// List with filters
const result = await api.emailTemplates.getAll({
  search: 'welcome',
  category: 'Authentication',
  status: 'active',
  page: '1',
  limit: '10',
})

// Get single
const template = await api.emailTemplates.getOne('template-id')

// Preview (substitutes sample variables)
const preview = await api.emailTemplates.preview('template-id')
// preview.subject, preview.body, preview.template

// Create
await api.emailTemplates.create({
  templateKey: 'my_new_template',
  templateName: 'My New Template',
  category: 'Recruitment',
  subject: 'Hello {{candidate_name}}',
  body: '<p>Dear {{candidate_name}}...</p>',
  variables: JSON.stringify(['candidate_name']),
  status: 'active',
})

// Update
await api.emailTemplates.update(templateId, { subject: 'New subject' })

// Duplicate
await api.emailTemplates.duplicate(templateId)

// Toggle status (active ↔ inactive)
await api.emailTemplates.toggleStatus(templateId)

// Send test
await api.emailTemplates.sendTest(templateId, 'test@example.com')

// Delete
await api.emailTemplates.remove(templateId)
```

SMS templates follow the same pattern via `api.smsTemplates.*`.

---

## 11. Key Design Decisions

- **templateKey is unique**: Never change templateKey after creation. Services reference templates by this key.
- **Variables stored as JSON string**: The `variables` field stores `'["var1","var2"]'` — parsed when editing/displaying.
- **Preview uses sample data**: The preview endpoint replaces variables with hardcoded sample values for visual testing.
- **Inactive templates are NOT deleted**: Set status to `inactive` to disable without losing the template. Only `DELETE` permanently removes.
- **No cascade on deletion**: Deleting a template does not affect existing email logs or sent notifications.
- **Character count for SMS**: The SMS preview and list show character count to help admins stay within the 160-character GSM limit.
- **Rich text editor**: Email body uses Tiptap editor with H1/H2/Bold/Italic/List/Undo/Redo toolbar. The HTML output is stored directly.
