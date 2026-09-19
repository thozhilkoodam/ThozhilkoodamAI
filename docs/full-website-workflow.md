# Thozhil Koodam — Full Website Workflow

> Enterprise Recruitment SaaS Platform connecting Recruitment Agencies, HR Recruiters, HR Consultants, MSME Clients, and Candidates.

---

## Table of Contents

1. [Platform Architecture](#1-platform-architecture)
2. [User Personas & Role Hierarchy](#2-user-personas--role-hierarchy)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Public & Marketing Flows](#4-public--marketing-flows)
5. [Candidate Portal Workflow](#5-candidate-portal-workflow)
6. [Recruitment Agency Workflow](#6-recruitment-agency-workflow)
7. [HR Recruiter Workflow](#7-hr-recruiter-workflow)
8. [HR Consultant Workflow](#8-hr-consultant-workflow)
9. [MSME Client Workflow](#9-msme-client-workflow)
10. [Admin Portal Workflow](#10-admin-portal-workflow)
11. [Cross-Cutting Workflows](#11-cross-cutting-workflows)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [API Integration Patterns](#13-api-integration-patterns)

---

## 1. Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOUD INFRASTRUCTURE                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   Next.js    │    │   NestJS     │    │     PostgreSQL       │   │
│  │   Frontend   │───▶│   Backend    │───▶│  (via Prisma ORM)    │   │
│  │  (port 3000) │    │  (port 3001) │    │  (Supabase)          │   │
│  └──────┬───────┘    └──────┬───────┘    └──────────────────────┘   │
│         │                   │                                        │
│         │    JWT Auth       │                                        │
│         │◀──────────────────│                                        │
│         │                   │                                        │
│         │    Razorpay       │    Nodemailer       SMS Gateway        │
│         │◀──────────────────│───────────────────────... (future)     │
└─────────────────────────────────────────────────────────────────────┘

FRONTEND LAYERS:
┌──────────────────────────────────────────────────────────────────────┐
│  Public    │ Candidate  │ Agency    │ HR Rec.  │ HR Consult │ MSME   │
│  (no auth) │ (candidate)│ (agency)  │ (hr)     │ (consult.) │ (msme) │
├────────────┴────────────┴───────────┴──────────┴────────────┴────────┤
│                    Admin Portal (super_admin / admin)                 │
├──────────────────────────────────────────────────────────────────────┤
│  shadcn/ui  │  Tailwind CSS  │  Lucide Icons  │  TanStack Table      │
│  Tiptap Editor │  sonner Toasts  │  IntersectionObserver            │
└──────────────────────────────────────────────────────────────────────┘

BACKEND LAYERS:
┌──────────────────────────────────────────────────────────────────────┐
│  Controllers (route handlers)                                       │
│  Services (business logic)                                          │
│  Guards (JwtAuthGuard, RolesGuard)                                  │
│  PrismaService (database access)                                    │
│  MailService (nodemailer)                                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Personas & Role Hierarchy

```
                    ┌──────────────┐
                    │  super_admin │  (full system access)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    admin     │  (platform management)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   support    │  (ticket management)
                    └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│recruitment_  │  │ hr_recruiter │  │msme_client   │  │  candidate   │
│_agency       │  │              │  │              │  │              │
│(Company)     │  │(HRRecruiter) │  │(MSMEClient)  │  │(User)        │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  hr_consultant  (ConsultantStatus: pending_activation → active)     │
└─────────────────────────────────────────────────────────────────────┘
```

| Role | Auth Table | Auth Method | Dashboard |
|------|-----------|-------------|-----------|
| `super_admin` / `admin` | `User` | Email + Password | `/admin/dashboard` |
| `support` | `User` | Email + Password | `/admin/dashboard` |
| `recruitment_agency` | `Company` | Email + Password | `/dashboard` |
| `hr_recruiter` | `HRRecruiter` | Email/Google + Password | `/hr/dashboard` |
| `hr_consultant` | `HRConsultant` | Email/Google/OTP + Password | `/business-operations/hr-consultant/dashboard` |
| `msme_client` | `MSMEClient` | Email + Password | `/business-operations/msme/dashboard` |
| `candidate` | `User` | Email + Password | `/candidate` |

---

## 3. Authentication & Authorization

### 3.1 Authentication Flows

```
                    ┌──────────────────────────────┐
                    │   PLATFORM ENTRY POINTS       │
                    │  /login  /admin/login         │
                    │  /hr/login  /candidate/login  │
                    │  /recruiter/login             │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │     SELECT LOGIN TYPE         │
                    │  ┌─────────────────────────┐  │
                    │  │ Email + Password         │  │
                    │  │ Google OAuth (HR/Cons.)  │  │
                    │  │ Phone OTP (HR Consultant)│  │
                    │  └─────────────────────────┘  │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │     BACKEND AUTH FLOW         │
                    │                                │
                    │  1. Find user by email         │
                    │  2. bcrypt.compare(password)    │
                    │  3. Check status !== inactive   │
                    │  4. Update lastLogin            │
                    │  5. Generate JWT payload:       │
                    │     { sub, email, role }        │
                    │  6. Return { accessToken, user }│
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │    FRONTEND PERSISTENCE       │
                    │                                │
                    │  Admin:  localStorage          │
                    │          (access_token)        │
                    │  Agency: localStorage          │
                    │          (access_token)        │
                    │  HR Rec: localStorage          │
                    │          (thozhil_hr_user)     │
                    │  MSME:   localStorage          │
                    │          (thozhil_client_user) │
                    │  Cand:   localStorage          │
                    │          (thozhil_user)        │
                    └────────────────────────────────┘
```

### 3.2 Authorization Guards

**JwtAuthGuard** (global, applied in `AppModule`):
- Reads `Bearer` token from `Authorization` header
- Validates JWT signature and expiry
- Attaches decoded payload to `request.user`
- Public routes use `@Public()` decorator to bypass

**RolesGuard** (global):
- Reads `@Roles('super_admin', 'admin')` from handler
- Compares `request.user.role` against allowed roles
- Returns 403 Forbidden if role doesn't match
- Public routes bypass both guards

### 3.3 Token Storage per Portal

| Portal | Storage Key | Token Key | Auto-refresh |
|--------|------------|-----------|--------------|
| Admin | `access_token` | `access_token` | No |
| Agency | `access_token` | `access_token` | No |
| HR Recruiter | `thozhil_hr_user` | `hr_recruiter.accessToken` | No |
| Candidate | `thozhil_user` | `user.accessToken` | No |
| MSME Client | `thozhil_client_user` | `client.accessToken` | No |
| HR Consultant | `thozhil_consultant_user` | `consultant.accessToken` | No |

---

## 4. Public & Marketing Flows

### 4.1 Landing Page (`/`)

```
User visits /
│
├──▶ Hero section (value proposition)
├──▶ Features showcase
├──▶ Statistics / Trust indicators
├──▶ Call-to-action: "Get Started" → /login
├──▶ Footer: About, Pricing, Contact
│
├── Navigation links:
│   ├── /about        → Company info
│   ├── /pricing      → Pricing plans
│   └── /login        → Role selection
└── Candidate quick-access: /jobs → Public Job Portal
```

### 4.2 Public Job Portal (`/jobs`)

```
User visits /jobs
│
├──▶ Fetches GET /api/jobs/published (no auth required)
│   Response: { jobs, total, page, filters }
│
├──▶ Search bar with mic input
├──▶ Filter panel:
│   ├── Location
│   ├── Job Type (Full-time, Part-time, Contract)
│   ├── Experience Range
│   ├── Salary Range
│   ├── Industry
│   ├── Department
│   └── Work Mode (Remote, On-site, Hybrid)
│
├──▶ Job cards:
│   ├── Company logo, title, company, location
│   ├── Salary range, job type, posted date
│   ├── Skills tags
│   └── "View Details" → /jobs/[id]
│
└──▶ Pagination
```

### 4.3 Job Detail (`/jobs/[id]`)

```
User visits /jobs/[id]
│
├──▶ Fetches GET /api/jobs/:id
│
├──▶ Job details:
│   ├── Title, Company, Logo
│   ├── Full description
│   ├── Skills required
│   ├── Experience, Salary, Location
│   ├── Posted date, application deadline
│   └── Organization type, department
│
├──▶ "Apply Now" button:
│   ├── If not logged in → redirect to /candidate/login
│   ├── If logged in → POST /api/candidate-portal/applications
│   └── If already applied → "Already Applied" disabled button
│
├──▶ "Share Job" button → copies URL to clipboard
│
└──▶ Similar jobs section (by category/department)
```

### 4.4 Pricing Page (`/pricing`)

```
User visits /pricing
│
├──▶ Free plan: ₹0 (limited features)
├──▶ Professional: ₹499/15 days
├──▶ Business: ₹5,999/month
├──▶ Enterprise: Custom pricing
│
└──▶ "Get Started" → /login (or role-specific signup)
```

---

## 5. Candidate Portal Workflow

### 5.1 Registration & Login

```
User visits /candidate/register
│
├──▶ Fill form: name, email, phone, password
├──▶ POST /api/candidate-auth/register
├──▶ Success → /candidate/register/success
│   (Email verification link sent via welcome template)
│
User visits /candidate/login
│
├──▶ Email + Password → POST /api/candidate-auth/login
├──▶ Google OAuth → POST /api/candidate-auth/google-login
├──▶ Success → Store token in localStorage (thozhil_user)
└──▶ Redirect to /candidate
```

### 5.2 Candidate Dashboard (`/candidate`)

```
GET /api/candidate-portal/dashboard/stats
│
├──▶ Stats cards: Applications, Saved Jobs, Interviews, Profile %
├──▶ Recent activity feed
├──▶ Recommended jobs (based on skills)
└──▶ Quick actions: Browse Jobs, Update Resume
```

### 5.3 Profile Management

```
/candidate/profile
│
├──▶ GET /api/candidate-portal/profile (CandidateProfile model)
├──▶ Edit: Photo, Gender, DOB, Nationality, Address
├──▶ Current company, Designation, Experience years
└──▶ Resume URL

/candidate/resume
├──▶ Upload resume document
├──▶ GET /api/candidate-portal/documents
└──▶ Delete existing documents

/candidate/resume-builder
├──▶ Step-by-step resume builder
├──▶ Sections: Education, Experience, Skills, Certifications
└──▶ Export as PDF

Education:  GET|POST /api/candidate-portal/education
            PUT|DELETE /api/candidate-portal/education/:id

Experience: GET|POST /api/candidate-portal/experience
            PUT|DELETE /api/candidate-portal/experience/:id

Skills:     GET|POST /api/candidate-portal/skills
            DELETE /api/candidate-portal/skills/:id

Certifications: GET|POST /api/candidate-portal/certifications
                DELETE /api/candidate-portal/certifications/:id
```

### 5.4 Job Application Flow

```
Candidate browses /jobs
│
├──▶ Clicks "Apply Now" on /jobs/[id]
├──▶ POST /api/candidate-portal/applications
│   Body: { jobId, company, position, resumeUrl, coverNote }
│
├──▶ Duplicate check: prevents re-applying to same job
├──▶ Creates CandidateApplication record
├──▶ Auto-notification sent to relevant recruiter/agency
│
└──▶ Status visible in:
    ├── /candidate/applied-jobs → All applications
    ├── /candidate/application-tracker → Timeline per status
    └── Statuses: applied → screening → shortlisted → interview → ...
```

### 5.5 Saved Jobs

```
/candidate/saved-jobs
│
├──▶ GET /api/candidate-portal/saved-jobs
├──▶ Save job: POST /api/candidate-portal/saved-jobs
│   Body: { jobId, company, position, salary, location, jobType }
└──▶ Remove: DELETE /api/candidate-portal/saved-jobs/:id
```

### 5.6 Interviews & Messages

```
/candidate/interviews
│
├──▶ GET /api/candidate-portal/interviews
├──▶ Update status: PATCH /api/candidate-portal/interviews/:id/status
│   (confirm/decline/reschedule)

/candidate/messages
├──▶ GET /api/candidate-portal/messages
├──▶ Send: POST /api/candidate-portal/messages
└──▶ Real-time conversation with recruiters

/candidate/notifications
├──▶ GET /api/candidate-portal/notifications
├──▶ Mark read: PATCH /api/candidate-portal/notifications/:id/read
└──▶ Mark all read: PATCH /api/candidate-portal/notifications/read-all
```

---

## 6. Recruitment Agency Workflow

### 6.1 Registration & Onboarding

```
Agency visits /login → selects "Recruitment Agency"
│
├──▶ POST /api/auth/register
│   Body: { agencyName, contactPerson, email, phone, password, ... }
│
├──▶ Creates Company record (status: pending)
├──▶ Pending admin approval
├──▶ Email sent via "agency_registration_received" template
│
├──▶ Admin approves → Company.status = approved
├──▶ Email sent via "agency_approved" template
│
└──▶ Agency logs in → /dashboard
```

### 6.2 Agency Dashboard (`/dashboard`)

```
GET /api/companies/:id (stats computed)
│
├──▶ Jobs posted count (by status)
├──▶ Active candidates count
├──▶ Upcoming interviews
├──▶ Subscription status
├──▶ Team members
└──▶ Recent activity
```

### 6.3 Job Posting Flow

```
Agency visits /dashboard/job-post
│
├──▶ List existing jobs: GET /api/jobs?companyId=xxx
│
├──▶ Create job: POST /api/jobs
│   Body: { title, department, employmentType, workMode, location,
│           experience, salaryMin, salaryMax, vacancyCount,
│           description, skills, screeningQuestions }
│
├──▶ Backend checks subscription limit:
│   ├── Free tier: max 2 jobs allowed
│   ├── Professional/Business: based on plan jobPosts count
│   └── Exceeded → throws BadRequestException
│
├──▶ Job created with status: "draft"
├──▶ Agency submits → status: "pending_review"
├──▶ Email sent via "job_posted_success" template
│
└──▶ Admin approval flow:
    ├── Admin reviews → approves (→ "published")
    ├── Admin reviews → requests changes (→ "changes_requested")
    └── Admin reviews → rejects (→ "rejected")
```

### 6.4 Team Management

```
/dashboard/team
│
├──▶ GET /api/team → list team members
├──▶ Invite: POST /api/team/invite
│   Body: { name, email, role }
└──▶ Roles: admin, hr_manager, recruiter, interviewer, viewer
```

### 6.5 Subscription & Billing

```
/dashboard/billing
│
├──▶ GET /api/billing/my-subscription
├──▶ GET /api/billing/my-payments
├──▶ POST /api/billing/create-order (Razorpay order)
├──▶ POST /api/billing/verify (Razorpay payment verification)
└──▶ Plans: Free (limited), Professional (₹499/15d), Business (₹5,999/mo), Enterprise
```

---

## 7. HR Recruiter Workflow

### 7.1 Account Creation

```
HR Recruiter account created via two paths:
│
PATH A: Admin creates → POST /api/hr-recruiters
├──▶ Sets employeeId (HRTK######), name, email, password
├──▶ Email sent via "hr_recruiter_account_created" template
├──▶ Includes employeeId, login URL, temporary password
└──▶ Status: pending (until admin approves)

PATH B: Agency creates via /dashboard/hr-consultants/create
├──▶ Saves to sessionStorage (payment-gated flow)
├──▶ Redirects to upgrade-plans page
├──▶ On payment success → POST /api/hr-recruiters
└──▶ Email sent with credentials
```

### 7.2 HR Recruiter Login

```
/hr/login
│
├──▶ Email + Password → POST /api/hr-recruiters/login
├──▶ Google OAuth → POST /api/hr-recruiters/google-login
├──▶ Status check: suspended/inactive → "Account inactive" error
├──▶ Success → Store in localStorage (thozhil_hr_user)
└──▶ Redirect to /hr/dashboard
```

### 7.3 Job Posting (`/hr/job-post`)

```
HR Recruiter posts a job
│
├──▶ List: GET /api/jobs?recruiterId=xxx
├──▶ Create: POST /api/jobs
├──▶ Edit: PUT /api/jobs/:id
├──▶ Submit: PUT /api/jobs/:id/submit
│   (moves from draft → pending_review)
│
└──▶ Same approval flow as agency jobs
```

### 7.4 Candidate Management (`/hr/candidates`)

```
/hr/candidates
│
├──▶ GET /api/candidates → list candidates (paginated, 12/page)
├──▶ Search by name, email, phone, skills
├──▶ Filters: experience, location, current CTC
│
├──▶ View candidate detail: /hr/candidates/[id]
│   ├── Subscription gate: Free users see limited info
│   ├── Subscribed users see full profile
│   └── Download resume, Schedule interview
│
└──▶ Add candidate to pipeline
```

### 7.5 Pipeline Management

```
/hr/pipeline
│
├──▶ GET /api/pipeline → Kanban-style stages
├──▶ Drag & drop candidates between stages
├──▶ PUT /api/pipeline/:stageId → update stage candidates
└──▶ Stages: Applied → Screening → Shortlisted → Interview → Offer → Joined
```

### 7.6 Interviews

```
/hr/interviews
│
├──▶ GET /api/interviews → list all interviews
├──▶ POST /api/interviews → schedule new interview
│   Body: { candidateName, jobTitle, date, startTime, endTime, type }
└──▶ Calendar view with upcoming interviews
```

---

## 8. HR Consultant Workflow

### 8.1 Registration & Activation

```
/business-operations/hr-consultant/signup
│
├──▶ POST /api/hr-consultants/signup
│   Body: { name, email, phone, password, agencyName, department,
│           designation, specialization, experience }
│
├──▶ Creates HRConsultant (status: pending_activation)
├──▶ Sends activation email with token
│
├──▶ User clicks activation link → /business-operations/hr-consultant/activate
├──▶ POST /api/hr-consultants/activate { token }
│   (status → active)
│
└──▶ Login via email, Google OAuth, or phone OTP
```

### 8.2 Consultant Dashboard

```
/business-operations/hr-consultant/dashboard
│
├──▶ Assigned requirements count
├──▶ Candidates sourced
├──▶ Interviews scheduled
├──▶ Performance score
├──▶ Recent activity
└──▶ Pipeline summary
```

### 8.3 Requirements

```
/business-operations/hr-consultant/requirements
│
├──▶ List assigned requirements from MSME clients
├──▶ View requirement detail
├──▶ Source candidates for each requirement
└──▶ Update pipeline status
```

### 8.4 Candidate Database

```
/business-operations/hr-consultant/candidates
│
├──▶ HR Consultant's personal candidate database (CandidateV2)
├──▶ Add candidates: name, email, phone, skills, experience
├──▶ AI match score against requirements
├──▶ Pipeline tracking per candidate
└──▶ Interview scheduling
```

---

## 9. MSME Client Workflow

### 9.1 Registration

```
/business-operations/msme/signup
│
├──▶ POST /api/msme-clients (or via auth)
│   Body: { companyName, email, phone, password, gst, pan,
│           address, website, industry, employeeCount }
│
├──▶ Creates MSMEClient (status: pending)
├──▶ Email sent via "msme_registration_received" template
│
├──▶ Admin approves → status: approved
├──▶ Email sent via "msme_approved" template
│
└──▶ Login → /business-operations/msme/login
```

### 9.2 Verification Documents

```
/business-operations/msme/verification
│
├──▶ Upload: GST certificate, PAN, Incorporation cert,
│          Business registration, Director docs
├──▶ POST /api/upload/document (multipart)
└──▶ Status tracking per document (verified / pending)
```

### 9.3 Requirement Posting

```
/business-operations/msme/requirements
│
├──▶ Form: position, vacancies, skills, experience, salary range
├──▶ Employment type, interview mode, location
├──▶ Hiring deadline, budget
│
├──▶ POST /api/requirements → creates Requirement (status: pending)
├──▶ Email sent via "msme_requirement_received" template
│
└──▶ Requirement lifecycle:
    pending → under_review → quoted → client_approved
    → recruiter_assigned → candidate_search → interview
    → offer → joining → completed
```

### 9.4 Requirement Tracker

```
/business-operations/msme/tracker
│
├──▶ GET /api/requirements → list with status
├──▶ GET /api/requirements/:id/trackers → timeline
└──▶ Visual progress: stages with completion checkmarks
```

### 9.5 Quotations

```
/business-operations/msme/quotation
│
├──▶ View quotations from admin
├──▶ GET /api/quotations
├──▶ Status: draft → sent → approved → rejected
└──▶ Download quotation PDF
```

### 9.6 Support & Meetings

```
/business-operations/msme/support
├──▶ GET /api/support-tickets → list tickets
├──▶ POST /api/support-tickets → create ticket
│   { subject, message, attachment }
└──▶ Status: open → in_progress → resolved → closed

/business-operations/msme/meetings
├──▶ GET /api/meetings → list meetings
├──▶ POST /api/meetings → schedule meeting
│   { date, time, purpose, type, link }
└──▶ Status: scheduled → completed → cancelled
```

---

## 10. Admin Portal Workflow

### 10.1 Admin Login & Dashboard

```
/admin/login
├──▶ Email + Password → POST /api/auth/login
├──▶ Role must be: super_admin or admin
└──▶ Redirect to /admin/dashboard

/admin/dashboard
├──▶ Total registered users, companies
├──▶ Pending approvals count (agencies, MSMEs, HR recruiters, jobs)
├──▶ Revenue stats, subscription metrics
├──▶ Recent activity feed
├──▶ Quick action cards
└──▶ Charts: registrations over time, job postings by status
```

### 10.2 Agency Management

```
/admin/agencies               → All agencies (GET /api/companies)
/admin/agencies/pending       → Pending approval
/admin/agencies/approved      → Active agencies
/admin/agencies/rejected      → Rejected with reason
/admin/agencies/suspended     → Suspended with reason/stats

Per agency:
├──▶ View company details, documents, team members, jobs
├──▶ Approve / Reject with reason / Suspend / Reactivate
├──▶ Track: jobs posted, subscription, payment history
└──▶ Email notification on status change
```

### 10.3 MSME Client Management

```
/admin/msme-clients           → All MSME clients
/admin/msme-clients/pending   → Pending approval
/admin/msme-clients/active    → Active clients
/admin/msme-clients/approved  → Approved
/admin/msme-clients/rejected  → Rejected

Per client:
├──▶ View verification documents
├──▶ Approve / Reject
├──▶ Track requirements, quotations, tickets
└──▶ Email notification
```

### 10.4 HR Recruiter Management

```
/admin/hr-recruiters              → All HR recruiters (TanStack Table)
/admin/hr-recruiters/pending      → Pending approval (approve/reject)
/admin/hr-recruiters/active       → Active recruiters
/admin/hr-recruiters/suspended    → Suspended (reactivate/delete)
/admin/hr-recruiters/performance  → KPIs + leaderboard
/admin/hr-recruiters/create       → Multi-section creation form
/admin/hr-recruiters/[id]         → Profile + stats + assignments
/admin/hr-recruiters/[id]/edit    → Edit all fields

Actions per recruiter:
├──▶ Approve / Reject / Suspend / Reactivate
├──▶ Reset password (sends email with new password)
├──▶ Assign agency
└──▶ Track: assigned jobs, placements, conversion rate
```

### 10.5 Job Approval Workflow

```
/admin/jobs/pending       → Pending review (with TanStack Table)
/admin/jobs/published     → Published jobs
/admin/jobs/rejected      → Rejected with reason
/admin/jobs/expired       → Expired listings
/admin/jobs/archived      → Archived

Pending Review Table:
├──▶ KPI cards: Pending, Published, Rejected, Today's, Waiting >24hrs
├──▶ 16-column table with checkbox selection
├──▶ Search + filters: status, organization type, date range
├──▶ Bulk actions: Approve, Reject, Archive, Delete
├──▶ Job details drawer with full info + approval timeline
├──▶ Approve → email via "job_approved" template
├──▶ Reject → dialog with reason → email via "job_rejected" template
└──▶ Request changes → dialog → email via "job_changes_requested" template

Job Status Flow:
draft → submitted → pending_review → under_review
                                    ├──→ approved → published
                                    ├──→ changes_requested → resubmitted
                                    └──→ rejected
published → expired / archived / closed
```

### 10.6 Email Template Management

```
/admin/email-templates              → All email templates (TanStack Table)
/admin/email-templates/create       → Rich text editor + variables
/admin/email-templates/[id]         → Detail + preview (desktop/mobile/source)
/admin/email-templates/[id]/edit    → Edit template

Table columns: Name, Category, Subject, Status, Last Updated, Updated By, Actions
Actions: View, Preview, Edit, Duplicate (as inactive), Enable/Disable, Delete

Template fields: templateKey, templateName, category, subject,
                 body (HTML via Tiptap editor), variables (JSON), status, description

Preview: Three tabs: Desktop (600px), Mobile (375px), Source (raw HTML)
Test: Enter email → Send Test → renders with sample variable data
```

### 10.7 SMS Template Management

```
/admin/sms-templates              → All SMS templates (TanStack Table)
/admin/sms-templates/create       → Message + character counter + variables
/admin/sms-templates/[id]         → Phone-style preview + test send
/admin/sms-templates/[id]/edit    → Edit template

Table columns: Name, Category, Message, Characters, Status, Last Updated, Actions
Character counter: "{length} characters"
```

### 10.8 Other Admin Sections

```
/admin/requirements       → Requirements CRM
/admin/candidates         → Candidate management
/admin/interviews         → Interview management (all platform interviews)
/admin/placements         → Placement management
/admin/users              → User management (CRUD, status)
/admin/subscriptions      → Subscription management (view all, cancel)
/admin/payments           → Payment history (all companies)
/admin/reports            → Reports & Analytics
/admin/notifications      → System notifications
/admin/settings           → Platform settings
/admin/audit-logs         → Audit trail (user actions, IP, timestamps)
```

---

## 11. Cross-Cutting Workflows

### 11.1 Job Lifecycle (Complete)

```
                    ┌───────────┐
                    │   DRAFT   │ ← Agency/Recruiter creates
                    └─────┬─────┘
                          │ Submit
                    ┌─────▼──────┐
                    │ PENDING_   │ ← Admin notified
                    │ REVIEW     │
                    └─────┬──────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼────┐ ┌───▼───┐ ┌────▼──────┐
        │ UNDER_   │ │CHANGES│ │ REJECTED  │
        │ REVIEW   │ │REQ.   │ │           │
        └─────┬────┘ └───┬───┘ └───────────┘
              │           │
        ┌─────▼────┐     │ (resubmit)
        │ APPROVED │     │
        └─────┬────┘     │
              │          │
        ┌─────▼────┐     │
        │PUBLISHED │◄────┘
        └─────┬────┘
              │
    ┌─────────┼──────────┐
    │         │          │
    ▼         ▼          ▼
┌──────┐ ┌────────┐ ┌────────┐
│EXPIRE│ │ARCHIVE │ │ CLOSED │
│D     │ │D       │ │        │
└──────┘ └────────┘ └────────┘

EMAIL NOTIFICATIONS:
  draft → submitted:     "job_posted_success" (to recruiter)
  → approved:            "job_approved" (to recruiter)
  → rejected:            "job_rejected" (to recruiter + reason)
  → changes_requested:   "job_changes_requested" (to recruiter + notes)

PUBLIC VISIBILITY:
  Only "published" jobs appear in /jobs and /api/jobs/published
```

### 11.2 Requirement Lifecycle (MSME → Admin → Recruiter)

```
MSME Client       Admin              HR Recruiter      Candidate
    │                │                    │                 │
    │ POST /api/     │                    │                 │
    │ requirements   │                    │                 │
    ├───────────────▶│                    │                 │
    │                │  under_review      │                 │
    │                ├───quoted──────────▶│                 │
    │◀───────────────┤  quotation         │                 │
    │  client_       │                    │                 │
    │  approved      │                    │                 │
    ├───────────────▶│                    │                 │
    │                │  recruiter_        │  assigned       │
    │                │  assigned─────────▶│                 │
    │                │                    ├───search───────▶│
    │                │  candidate_search  │                 │
    │                │◀───────────────────┤  candidates     │
    │                │  interview         │  found          │
    │◀───────────────┤────────────────────┤◀────────────────│
    │                │  offer             │                 │
    │◀───────────────┤────────────────────┤◀────────────────│
    │                │  joining           │                 │
    │◀───────────────┤────────────────────┤◀────────────────│
    │  completed     │                    │                 │
    │◀───────────────┤                    │                 │
```

### 11.3 Billing & Subscription Flow

```
User selects plan (Free / Professional ₹499 / Business ₹5,999 / Enterprise)
│
├──▶ Free: instant activation (limited features)
│
├──▶ Professional/Business:
│   ├──▶ POST /api/billing/create-order → Razorpay order
│   ├──▶ Razorpay checkout popup
│   ├──▶ User completes payment on Razorpay
│   ├──▶ POST /api/billing/verify
│   │   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
│   ├──▶ Backend verifies signature with Razorpay key_secret
│   ├──▶ Creates Subscription record (status: active)
│   ├──▶ Records Payment (status: completed)
│   ├──▶ Generates Invoice
│   ├──▶ Email via "payment_successful" template
│   └──▶ Email via "subscription_activated" template
│
└──▶ Subscription expiry:
    ├──▶ Cron job checks end_date
    ├──▶ 7 days before: email via "subscription_expiring"
    ├──▶ On expiry: status → expired, email via "subscription_expired"
    └──▶ Features restricted until renewal
```

### 11.4 Notification & Template Integration

```
Any backend service needs to send email/SMS:
│
├──▶ Look up active template by templateKey:
│
│   const tmpl = await prisma.emailTemplate.findUnique({
│     where: { templateKey: 'job_approved' }
│   })
│   if (!tmpl || tmpl.status !== 'active') return
│
├──▶ Replace {{variables}} with real data:
│
│   let html = tmpl.body
│     .replace(/\{\{recruiter_name\}\}/g, recruiter.name)
│     .replace(/\{\{job_title\}\}/g, job.title)
│     .replace(/\{\{company_name\}\}/g, company.agencyName)
│
├──▶ Send via MailService:
│
│   await this.mailService.sendTestEmail(user.email, subject, html)
│
└──▶ Email is logged in email_logs table (recipient, subject, status)

SAME PATTERN FOR SMS:
  const smsTmpl = await prisma.smsTemplate.findUnique({
    where: { templateKey: 'otp_verification' }
  })
  const message = smsTmpl.message.replace(/\{\{otp\}\}/g, otp)
  // Send via SMS gateway...

TEMPLATE KEYS USED BY SERVICES:

Service              │ templateKey
─────────────────────┼──────────────────────────────
AuthService          │ welcome_email, email_verification,
                     │ password_reset, login_alert
                     │ otp_verification (SMS), password_reset_otp (SMS)
JobsService          │ job_posted_success, job_approved, job_rejected
CandidatePortal      │ candidate_applied, interview_scheduled
InterviewService     │ interview_reminder
                     │ sms_interview_reminder (SMS)
CompaniesService     │ agency_registration_received
AdminService         │ agency_approved, agency_rejected,
                     │ msme_approved
                     │ sms_agency_approved (SMS), sms_msme_approved (SMS)
HrRecruitersService  │ hr_recruiter_account_created
MsmeClientsService   │ msme_registration_received
RequirementsService  │ msme_requirement_received
PaymentsService      │ payment_successful, payment_failed
BillingService       │ invoice
SubscriptionService  │ subscription_activated
Cron/Scheduler       │ subscription_expiring, subscription_expired
SupportService       │ contact_form_submitted, support_ticket_created,
                     │ ticket_closed
```

### 11.5 Audit Trail

```
Every admin action (approve/reject/suspend) creates an AuditLog:
│
├──▶ userId, userName, action, details, ip
│
Examples:
├──▶ "Approved agency Acme Corp" (admin)
├──▶ "Rejected job Senior Developer - 'Insufficient details'" (admin)
├──▶ "Suspended HR Recruiter John - 'Policy violation'" (admin)
├──▶ "Activated subscription for TechRecruit" (system)
│
└──▶ Viewable at /admin/audit-logs
```

---

## 12. Data Flow Diagrams

### 12.1 Job Creation → Public Listing Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Agency  │     │  Next.js │     │  NestJS  │     │   Prisma │     │PostgreSQL│
│  Browser │     │ Frontend │     │ Backend  │     │   ORM    │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │  POST /api/jobs│                │                │                │
     │  {title,desc..}│                │                │                │
     ├───────────────▶│                │                │                │
     │                │  POST /api/jobs│                │                │
     │                ├───────────────▶│                │                │
     │                │                │  Check sub     │                │
     │                │                │  limit (free:2)│                │
     │                │                ├───────▶        │                │
     │                │                │◀───────        │                │
     │                │                │                │                │
     │                │                │  prisma.job    │                │
     │                │                │  .create()     │                │
     │                │                ├───────────────▶│                │
     │                │                │                │ INSERT INTO    │
     │                │                │                │ jobs (...)     │
     │                │                │                ├───────────────▶│
     │                │                │                │◀───────────────│
     │                │                │◀───────────────│                │
     │                │◀───────────────│                │                │
     │◀───────────────│                │                │                │
     │  {job, status: │                │                │                │
     │   "draft"}     │                │                │                │
     │                │                │                │                │
     │  Agency submits│                │                │                │
     │  PUT /api/jobs │                │                │                │
     │  /:id/submit   │                │                │                │
     ├───────────────▶│                │                │                │
     │                ├───────────────▶│                │                │
     │                │                │ status →       │                │
     │                │                │ "pending_review"│               │
     │                │                ├───────────────▶│ UPDATE         │
     │                │                │                ├───────────────▶│
     │                │                │                │                │
     │                │                │ Send email     │                │
     │                │                │ "job_posted_   │                │
     │                │                │  success"      │                │
     │                │                │                │                │
     │  [Admin Review]│                │                │                │
     │                │                │                │                │
     │  Admin approves│                │                │                │
     │  PUT /api/jobs │                │                │                │
     │  /:id/approve  │                │                │                │
     ├───────────────▶│                │                │                │
     │                ├───────────────▶│                │                │
     │                │                │ status →       │                │
     │                │                │ "published"    │                │
     │                │                ├───────────────▶│ UPDATE         │
     │                │                │                ├───────────────▶│
     │                │                │                │                │
     │                │                │ Send email     │                │
     │                │                │ "job_approved" │                │
     │                │                │                │                │
     │                │                │                │                │
     │  [Public View] │                │                │                │
     │                │                │                │                │
     │  User visits   │                │                │                │
     │  /jobs         │                │                │                │
     │                ├───────────────▶│                │                │
     │                │ GET /api/jobs/ │                │                │
     │                │ published      │                │                │
     │                │◀───────────────│                │                │
     │                │                │ WHERE status = │                │
     │                │                │ "published"    │                │
     │                │                ├───────────────▶│ SELECT * FROM  │
     │                │                │                │ jobs WHERE     │
     │                │                │                │ status='pub'   │
     │                │                │◀───────────────│                │
     │◀───────────────│                │                │                │
     │  {jobs[]}      │                │                │                │
```

### 12.2 Authentication Flow (JWT)

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│  Browser │          │  Next.js │          │  NestJS  │          │    DB    │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │                     │
     │  POST /api/auth/    │                     │                     │
     │  login {email,pass} │                     │                     │
     ├────────────────────▶│                     │                     │
     │                     │  POST /api/auth/    │                     │
     │                     │  login              │                     │
     │                     ├────────────────────▶│                     │
     │                     │                     │                     │
     │                     │                     │  Find user by email │
     │                     │                     ├────────────────────▶│
     │                     │                     │◀────────────────────│
     │                     │                     │                     │
     │                     │                     │  bcrypt.compare()   │
     │                     │                     │                     │
     │                     │                     │  Check status       │
     │                     │                     │                     │
     │                     │                     │  Update lastLogin   │
     │                     │                     ├────────────────────▶│
     │                     │                     │                     │
     │                     │                     │  jwt.sign({         │
     │                     │                     │    sub: user.id,    │
     │                     │                     │    email,           │
     │                     │                     │    role             │
     │                     │                     │  })                 │
     │                     │                     │                     │
     │                     │◀────────────────────│                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
     │  Store token in     │                     │                     │
     │  localStorage       │                     │                     │
     │                     │                     │                     │
     │  [Subsequent reqs]  │                     │                     │
     │  Authorization:     │                     │                     │
     │  Bearer <token>     │                     │                     │
     ├────────────────────▶│                     │                     │
     │                     │  Forward with       │                     │
     │                     │  Authorization      │                     │
     │                     ├────────────────────▶│                     │
     │                     │                     │                     │
     │                     │                     │  JwtAuthGuard       │
     │                     │                     │  verifies token     │
     │                     │                     │  attaches user      │
     │                     │                     │                     │
     │                     │                     │  RolesGuard checks  │
     │                     │                     │  @Roles() decorator │
     │                     │                     │                     │
```

---

## 13. API Integration Patterns

### 13.1 Frontend → Backend Communication

All frontend API calls go through `lib/api-client.ts`:

```typescript
// Pattern: unified request() function with auto-token injection
async function request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const token = getToken()  // reads from localStorage
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(err.message)
  return res.json()
}

// Usage in components:
const data = await api.jobs.getPublished({ search: 'developer', page: '1' })
await api.hrRecruiters.approve(recruiterId)
await api.emailTemplates.sendTest(templateId, 'test@example.com')
```

### 13.2 File Upload

```typescript
// Logo upload (multipart/form-data)
const result = await api.upload.logo(file)
// → POST /api/upload/logo with FormData

// Document upload
const result = await api.upload.document(file)
// → POST /api/upload/document with FormData
```

### 13.3 Pagination Pattern

```typescript
// All list endpoints return:
interface PaginatedResponse<T> {
  items: T[]         // or "templates" / "recruiters" / "jobs"
  total: number
  page: number
  limit: number
  totalPages: number
}

// Frontend pattern:
const [page, setPage] = useState(1)
const { data, isLoading } = useQuery({
  queryKey: ['templates', page, search, status],
  queryFn: () => api.emailTemplates.getAll({
    page: String(page),
    limit: '20',
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
  }),
})
```

### 13.4 Error Handling

```typescript
// API client returns null for 401 (unauthorized)
// Returns null for ECONNREFUSED (backend down)
// Throws Error for all other failures

// Component pattern:
const handleSubmit = async () => {
  try {
    const result = await api.emailTemplates.create(formData)
    if (result) {
      toast.success('Template created')
      router.push('/admin/email-templates')
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to create template')
  }
}
```

---

## Quick Reference: Portal Entry Points

| Portal | Entry | Landing Page |
|--------|-------|-------------|
| **Public** | `/` | Marketing Landing |
| **Public Jobs** | `/jobs` | Job Listings |
| **Admin** | `/admin/login` | `/admin/dashboard` |
| **Recruitment Agency** | `/login` | `/dashboard` |
| **HR Recruiter** | `/hr/login` | `/hr/dashboard` |
| **HR Consultant** | `/business-operations/hr-consultant/login` | Dashboard |
| **MSME Client** | `/business-operations/msme/login` | Dashboard |
| **Candidate** | `/candidate/login` | `/candidate` |
| **Pricing** | `/pricing` | — |
