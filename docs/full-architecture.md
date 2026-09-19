# Thozhil Koodam — Full Architecture

> **Thozhil Koodam** (தொழில் கூடம்) — "One Platform for Every Opportunity"
> Enterprise Recruitment SaaS Platform

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Architecture](#5-database-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Layer](#7-api-layer)
8. [Component Architecture](#8-component-architecture)
9. [Routing Architecture](#9-routing-architecture)
10. [State Management](#10-state-management)
11. [Email & Notification Architecture](#11-email--notification-architecture)
12. [File Storage Architecture](#12-file-storage-architecture)
13. [Payment Architecture](#13-payment-architecture)
14. [Security Architecture](#14-security-architecture)
15. [Performance Architecture](#15-performance-architecture)
16. [Deployment Architecture](#16-deployment-architecture)

---

## 1. System Architecture Overview

```
                              ┌─────────────────────────────────────┐
                              │         CLOUD INFRASTRUCTURE        │
                              │  ┌──────────┐     ┌──────────────┐  │
                              │  │  Next.js  │     │   Supabase   │  │
                              │  │  Static   │     │  (PostgreSQL │  │
                              │  │  Assets   │     │   + Storage) │  │
                              │  └────┬─────┘     └──────┬───────┘  │
                              │       │                   │          │
                              │  ┌────▼───────────────────▼───────┐  │
                              │  │       NestJS Backend            │  │
                              │  │       (Express + Passport)      │  │
                              │  │       Port 3001                 │  │
                              │  └────────────┬────────────────────┘  │
                              │               │                       │
                              │  ┌────────────▼────────────────────┐  │
                              │  │    External Services             │  │
                              │  │  ┌─────────┐ ┌────────┐         │  │
                              │  │  │Razorpay │ │Gmail   │         │  │
                              │  │  │Payments │ │SMTP    │         │  │
                              │  │  └─────────┘ └────────┘         │  │
                              │  └─────────────────────────────────┘  │
                              └─────────────────────────────────────┘

         LAYERS:

         ┌──────────────────────────────────────────────────────────────────┐
         │  PRESENTATION LAYER                                              │
         │  Next.js App Router (14) │ React 18 │ TypeScript 5.3            │
         │  Tailwind CSS 3.4 │ shadcn/ui │ Lucide Icons │ Recharts         │
         └──────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────────────────────┐
         │  API / INTEGRATION LAYER                                         │
         │  api-client.ts (main) │ api.ts (candidate) │ db.ts (abstraction) │
         │  fetch() with JWT Bearer │ error handling │ pagination           │
         └──────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────────────────────┐
         │  APPLICATION LAYER (NestJS)                                      │
         │  Controllers → Services → Guards → Decorators                    │
         │  25 modules │ 2 global guards │ JWT │ Roles                     │
         └──────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────────────────────┐
         │  DATA LAYER                                                      │
         │  Prisma ORM 5.22 │ PostgreSQL │ 46 models │ 16 enums             │
         │  email_logs │ audit_logs │ notifications (append-only)           │
         └──────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
thozhil-koodam/
│
├── app/                              # Next.js App Router (pages)
│   ├── layout.tsx                    # Root layout: ThemeProvider + AuthProvider + Toaster
│   ├── globals.css                   # CSS vars + Tailwind directives
│   ├── page.tsx                      # Landing page (/)
│   ├── about/page.tsx                # About page
│   ├── login/page.tsx                # Unified login
│   ├── pricing/page.tsx              # Pricing plans
│   │
│   ├── jobs/                         # Public Job Portal (no auth)
│   │   ├── page.tsx                  # Job listing with search/filter/pagination
│   │   └── [id]/page.tsx             # Job detail + apply
│   │
│   ├── admin/                        # Admin Portal (super_admin, admin, support)
│   │   ├── layout.tsx                # AdminSidebar + AdminHeader
│   │   ├── dashboard/page.tsx        # KPI dashboard
│   │   ├── agencies/                 # Recruitment Agency management
│   │   │   ├── page.tsx              # All agencies
│   │   │   ├── pending/page.tsx      # Pending approval
│   │   │   ├── approved/page.tsx     # Active
│   │   │   ├── rejected/page.tsx     # Rejected
│   │   │   └── suspended/page.tsx    # Suspended
│   │   ├── msme-clients/             # MSME management
│   │   ├── hr-recruiters/            # HR Recruiter management
│   │   │   ├── page.tsx              # All (TanStack Table)
│   │   │   ├── create/page.tsx       # Multi-section form
│   │   │   ├── pending/page.tsx      # Approve/reject
│   │   │   ├── active/page.tsx       # Active list
│   │   │   ├── suspended/page.tsx    # Suspended list
│   │   │   ├── performance/page.tsx  # KPIs + leaderboard
│   │   │   ├── [id]/page.tsx         # Profile detail
│   │   │   └── [id]/edit/page.tsx    # Edit form
│   │   ├── jobs/                     # Job approval workflow
│   │   │   ├── pending/page.tsx      # Pending review (approve/reject/request changes)
│   │   │   ├── published/page.tsx    # Published jobs
│   │   │   ├── rejected/page.tsx     # Rejected with reasons
│   │   │   ├── expired/page.tsx      # Expired
│   │   │   └── archived/page.tsx     # Archived
│   │   ├── email-templates/          # Email template management
│   │   │   ├── page.tsx              # TanStack Table
│   │   │   ├── create/page.tsx       # Rich text editor + variables
│   │   │   ├── [id]/page.tsx         # Preview + send test
│   │   │   └── [id]/edit/page.tsx    # Edit
│   │   ├── sms-templates/            # SMS template management
│   │   │   ├── page.tsx              # TanStack Table
│   │   │   ├── create/page.tsx       # Character counter
│   │   │   ├── [id]/page.tsx         # Phone preview + send test
│   │   │   └── [id]/edit/page.tsx    # Edit
│   │   ├── users/page.tsx            # User management
│   │   ├── subscriptions/page.tsx    # Subscription management
│   │   ├── payments/page.tsx         # Payment history
│   │   ├── requirements/page.tsx     # Requirements CRM
│   │   ├── reports/page.tsx          # Reports & analytics
│   │   ├── notifications/page.tsx    # System notifications
│   │   ├── settings/page.tsx         # Platform settings
│   │   └── audit-logs/page.tsx       # Audit trail
│   │
│   ├── dashboard/                    # Recruitment Agency Portal
│   │   ├── layout.tsx                # DashboardSidebar + DashboardHeader
│   │   ├── page.tsx                  # Agency dashboard
│   │   ├── job-post/page.tsx         # Job CRUD (2-post free limit)
│   │   ├── candidates/page.tsx       # Candidate list
│   │   ├── hiring-pipeline/page.tsx  # Kanban pipeline
│   │   ├── interview-schedule/page.tsx
│   │   ├── billing/page.tsx          # Subscription + Razorpay
│   │   ├── team/page.tsx             # Team members
│   │   ├── hr-consultants/           # HR Consultants management
│   │   │   ├── page.tsx              # List
│   │   │   └── create/page.tsx       # Create → sessionStorage → payment gate
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx         # 13-section left-nav settings
│   │   └── contact-sales/page.tsx
│   │
│   ├── hr/                           # HR Recruiter Portal
│   │   ├── layout.tsx                # HrSidebar + HrHeader
│   │   ├── login/page.tsx            # Email/Google login
│   │   ├── dashboard/page.tsx
│   │   ├── requirements/page.tsx
│   │   ├── job-post/page.tsx         # Job CRUD
│   │   ├── candidates/page.tsx       # Paginated + subscription-gated
│   │   │   └── [id]/page.tsx
│   │   ├── pipeline/page.tsx
│   │   ├── interviews/page.tsx
│   │   ├── billing/page.tsx          # Subscription purchase
│   │   ├── notifications/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── candidate/                    # Candidate Portal (self-service)
│   │   ├── layout.tsx                # CandidateSidebar + CandidateHeader
│   │   ├── page.tsx                  # Dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── register/success/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── resume/page.tsx
│   │   ├── resume-builder/page.tsx
│   │   ├── saved-jobs/page.tsx
│   │   ├── applied-jobs/page.tsx
│   │   ├── applications/page.tsx
│   │   ├── application-tracker/page.tsx
│   │   ├── interviews/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── certificates/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── business-operations/          # Portal Hub
│   │   ├── page.tsx                  # Hub landing (role selection)
│   │   ├── recruitment-agency/       # Agency landing
│   │   ├── hr-consultant/            # HR Consultant Portal
│   │   │   ├── layout.tsx            # HrConsultantSidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── google-login/page.tsx
│   │   │   ├── activate/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── requirements/page.tsx
│   │   │   ├── candidates/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── interviews/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   ├── upgrade-plans/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── msme/                    # MSME Client Portal
│   │       ├── layout.tsx            # MSMESidebar
│   │       ├── login/page.tsx
│   │       ├── signup/page.tsx
│   │       ├── signup/success/page.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── verification/page.tsx # Document upload
│   │       ├── requirements/page.tsx
│   │       ├── tracker/page.tsx
│   │       ├── quotation/page.tsx
│   │       ├── support/page.tsx
│   │       ├── meetings/page.tsx
│   │       ├── billing/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── client/                       # Legacy MSME redirect
│   │   └── layout.tsx                # Redirects to /business-operations/msme
│   ├── hr-consultant/                # Legacy consultant redirect
│   │   └── layout.tsx                # Redirects to /business-operations/hr-consultant
│   ├── recruiter/                    # Recruiter landing
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── job-portal/page.tsx           # Legacy → redirects to /jobs
│
├── components/                        # Shared UI components
│   ├── brand-logo.tsx                 # Configurable logo with Tamil subtitle
│   ├── theme-provider.tsx             # next-themes wrapper
│   │
│   ├── layout/                        # Portal layouts (17 files)
│   │   ├── admin-header.tsx
│   │   ├── admin-sidebar.tsx          # 5 sections: Main, Business, Hiring, Management, System
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-sidebar.tsx      # 10 items
│   │   ├── candidate-header.tsx
│   │   ├── candidate-sidebar.tsx      # 13 items + logout
│   │   ├── hr-header.tsx
│   │   ├── hr-sidebar.tsx             # 11 items + switch role
│   │   ├── hr-consultant-header.tsx
│   │   ├── hr-consultant-sidebar.tsx  # 10 items + upgrade
│   │   ├── msme-header.tsx
│   │   ├── msme-sidebar.tsx           # 10 items
│   │   ├── client-header.tsx
│   │   ├── client-sidebar.tsx         # Legacy (redirected)
│   │   ├── navbar.tsx                 # Public navbar
│   │   ├── footer.tsx                 # Public footer
│   │   └── contact-sales-float.tsx    # Floating CTA
│   │
│   └── ui/                           # shadcn/ui primitives (22 files)
│       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx
│       ├── dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx
│       ├── progress.tsx, scroll-area.tsx, select.tsx, separator.tsx
│       ├── sheet.tsx, skeleton.tsx, slider.tsx, switch.tsx
│       ├── table.tsx, tabs.tsx, textarea.tsx, toggle.tsx
│       └── editor/
│           └── rich-text-editor.tsx   # TipTap-based HTML editor
│
├── lib/                               # Utility libraries
│   ├── utils.ts                       # cn(), formatDate(), generateCompanyId()
│   ├── api-client.ts                  # Main API client (405 lines, 17 endpoint groups)
│   ├── api.ts                         # Candidate-specific API client
│   ├── db.ts                          # Database abstraction layer
│   ├── supabase.ts                    # Supabase client singleton
│   └── seed-data.ts                   # Seed admin + test agencies
│
├── hooks/                             # React hooks
│   └── use-auth.tsx                   # AuthProvider + useAuth() context
│
├── public/                            # Static assets
│   ├── logo.png
│   └── logo.svg
│
├── backend/                           # NestJS Backend
│   ├── package.json                   # NestJS v11, Prisma 5, Passport JWT, Nodemailer
│   ├── tsconfig.json                  # ES2023, emitDecoratorMetadata
│   ├── nest-cli.json
│   ├── .env                           # DATABASE_URL, JWT_SECRET, SMTP, SUPABASE
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # 46 models, 16 enums, PostgreSQL
│   │   └── seed-templates.ts          # 27 email + 9 SMS templates
│   │
│   └── src/
│       ├── main.ts                    # NestFactory, CORS, global prefix /api, ValidationPipe
│       ├── app.module.ts              # 25 modules + 2 global guards
│       │
│       ├── prisma/                    # Global database service
│       │   ├── prisma.module.ts       # @Global() export
│       │   └── prisma.service.ts      # extends PrismaClient, onModuleInit/onModuleDestroy
│       │
│       ├── common/                    # Shared decorators & guards
│       │   ├── current-user.decorator.ts  # @CurrentUser() param decorator
│       │   ├── public.decorator.ts        # @Public() route decorator
│       │   ├── roles.decorator.ts         # @Roles() metadata decorator
│       │   └── roles.guard.ts             # RolesGuard (Reflector-based)
│       │
│       ├── auth/                      # Authentication module
│       │   ├── auth.module.ts         # PassportModule + JwtModule (7d expiry)
│       │   ├── auth.service.ts        # login(), loginCompany(), register()
│       │   ├── auth.controller.ts     # POST /api/auth/{login,company-login,register}
│       │   ├── jwt-auth.guard.ts      # Global guard, respects @Public()
│       │   ├── jwt.strategy.ts        # Validates by role, looks up Company/User/Consultant
│       │   └── dto/                   # LoginDto, RegisterDto, CompanyLoginDto
│       │
│       ├── mail/                      # Global email service
│       │   ├── mail.module.ts         # @Global()
│       │   ├── mail.service.ts        # Nodemailer + 11+ HTML templates + emailLog
│       │   └── templates/             # External template files
│       │
│       ├── config/                    # Configuration
│       │   └── supabase.ts            # Supabase admin client
│       │
│       ├── companies/                 # Agency management (Company model)
│       ├── users/                     # User management
│       ├── jobs/                      # Job CRUD + approval workflow + bulk ops
│       ├── candidates/                # Candidate list/filter
│       ├── pipeline/                  # Pipeline stages
│       ├── interviews/                # Interview scheduling
│       ├── payments/                  # Razorpay integration (controller at /billing)
│       ├── team/                      # Team members
│       ├── notifications/             # System notifications
│       ├── audit-logs/                # Audit trail
│       ├── upload/                    # Logo + document upload
│       ├── hr-recruiters/             # HR Recruiter CRUD + mgmt
│       ├── msme-clients/              # MSME client management
│       ├── requirements/              # MSME requirements + tracker
│       ├── quotations/                # Quotation generation
│       ├── meetings/                  # Meeting scheduling
│       ├── support-tickets/           # Support ticket system
│       ├── hr-consultants/            # Consultant signup + activation + CRUD
│       ├── candidate-auth/            # Candidate registration/login
│       ├── candidate-portal/          # Candidate self-service (profile, apps, etc.)
│       ├── email-templates/           # Email template management
│       └── sms-templates/             # SMS template management
│
├── next.config.js                     # Images: localhost
├── tailwind.config.ts                 # shadcn/ui theme (HSL variables)
├── tsconfig.json                      # Path alias @/*
├── postcss.config.js
└── .env.example                       # NEXT_PUBLIC_* vars
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.1.0 | App Router, React Server Components, SSR |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Type safety |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| shadcn/ui | — | Radix-based component primitives |
| TanStack Table | 8.21.3 | Advanced data tables |
| TipTap | 3.27.4 | Rich text HTML editor |
| Lucide React | 0.344.0 | Icon library |
| Recharts | 2.12.0 | Charts & graphs |
| date-fns | 3.3.1 | Date formatting |
| react-hook-form | 7.50.1 | Form state management |
| Zod | 3.22.4 | Schema validation |
| @hello-pangea/dnd | 16.5.0 | Drag & drop (Kanban) |
| sonner | 2.0.7 | Toast notifications |
| react-hot-toast | 2.4.1 | Legacy toast system |
| next-themes | 0.2.1 | Dark/light mode |
| clsx + tailwind-merge | — | className merging |

### 3.2 CSS Architecture

```
globals.css
│
├── @tailwind base, components, utilities
│
├── :root HSL variables (light theme)
│   ├── --primary: 221.2 83.2% 53.3%    (blue)
│   ├── --background: 0 0% 100%
│   └── --radius: 0.5rem
│
├── .dark HSL variables (dark theme)
│   ├── --primary: 217.2 91.2% 59.8%    (lighter blue)
│   └── --background: 222.2 84% 4.9%    (dark navy)
│
├── Utility classes
│   ├── .gradient-blue    → linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)
│   └── .gradient-card    → light/dark adaptive gradient
│
└── shadcn/ui component styles
    ├── button variants (default, destructive, outline, secondary, ghost, link)
    ├── card, dialog, dropdown, table, tabs, etc.
    └── All via cn() utility (clsx + tailwind-merge)
```

### 3.3 Component Hierarchy

```
<RootLayout>                              [app/layout.tsx]
  <ThemeProvider>                          [next-themes]
    <AuthProvider>                         [hooks/use-auth.tsx]
      <PortalLayout>                       [per-portal layout.tsx]
        <Sidebar />                        [portal-specific sidebar]
        <Header />                         [portal-specific header]
        <PageContent />                    [route page.tsx]
          <TanStackTable />                [data tables]
          <RichTextEditor />               [email editor]
          <Dialog />                       [modals]
          <DropdownMenu />                 [actions]
      </PortalLayout>
      <Toaster />                          [react-hot-toast]
    </AuthProvider>
  </ThemeProvider>
</RootLayout>
```

### 3.4 Provider Chain

```
ThemeProvider (next-themes)
  └── AuthProvider (custom context in use-auth.tsx)
       ├── Stores user + token in localStorage
       ├── login(): tries admin auth → falls back to company auth
       ├── register(): calls db.companies.create
       └── logout(): clears localStorage
```

---

## 4. Backend Architecture

### 4.1 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 11.1.27 | Backend framework (Express) |
| TypeScript | 5.7.3 | Type safety |
| Prisma | 5.22.0 | ORM + migrations |
| PostgreSQL | — | Database (via Supabase) |
| Passport.js | 0.7.0 | JWT authentication |
| bcryptjs | 3.0.3 | Password hashing |
| Nodemailer | 9.0.3 | Email delivery |
| Razorpay | — | Payment processing |
| class-validator | 0.15.1 | DTO validation |
| class-transformer | 0.5.1 | Request transformation |

### 4.2 Module Architecture (25 Modules)

```
                        ┌─────────────────────────────────────┐
                        │          AppModule                   │
                        │  Global Guards: JwtAuthGuard,        │
                        │  RolesGuard                          │
                        └──────┬──────────────────────┬──────┐
                               │                      │      │
              ┌────────────────┼──────────────────────┘      │
              │                │                             │
     ┌────────▼────────┐ ┌────▼─────┐          ┌────────────▼───┐
     │  Global Modules  │ │ Auth     │          │ Business        │
     │  (auto-injected) │ │ Module   │          │ Modules         │
     └────────┬─────────┘ └──────────┘          └────────────────┘
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
PrismaModule  MailModule ConfigModule
(@Global())   (@Global()) (global)

AUTH MODULE (provides JWT + Passport)
├── AuthController         POST /api/auth/login
│                           POST /api/auth/company-login
│                           POST /api/auth/register
├── AuthService            Login/Register logic
├── JwtStrategy            Passport strategy (7-day expiry)
└── JwtAuthGuard           Global guard (bypass with @Public())

BUSINESS MODULES (22 modules, each with Controller + Service):
┌──────────────────────┬───────────────────┬─────────────────────┐
│ CompaniesModule      │ UsersModule       │ JobsModule          │
│ /api/companies       │ /api/users        │ /api/jobs           │
├──────────────────────┼───────────────────┼─────────────────────┤
│ CandidatesModule     │ PipelineModule    │ InterviewsModule    │
│ /api/candidates      │ /api/pipeline     │ /api/interviews     │
├──────────────────────┼───────────────────┼─────────────────────┤
│ PaymentsModule       │ TeamModule        │ NotificationsModule │
│ /api/billing         │ /api/team         │ /api/notifications  │
├──────────────────────┼───────────────────┼─────────────────────┤
│ AuditLogsModule      │ UploadModule      │ HrRecruitersModule  │
│ /api/audit-logs      │ /api/upload       │ /api/hr-recruiters  │
├──────────────────────┼───────────────────┼─────────────────────┤
│ MsmeClientsModule    │ RequirementsModule│ QuotationsModule    │
│ /api/msme-clients    │ /api/requirements │ /api/quotations     │
├──────────────────────┼───────────────────┼─────────────────────┤
│ MeetingsModule       │ SupportTickets    │ HrConsultantsModule │
│ /api/meetings        │ /api/support-     │ /api/hr-consultants │
│                      │ tickets           │                     │
├──────────────────────┼───────────────────┼─────────────────────┤
│ CandidateAuthModule  │ CandidatePortal   │ EmailTemplatesModule│
│ /api/candidate-auth  │ /api/candidate-   │ /api/email-templates│
│                      │ portal            │                     │
├──────────────────────┴───────────────────┼─────────────────────┤
│                                           │ SmsTemplatesModule │
│                                           │ /api/sms-templates  │
└───────────────────────────────────────────┴─────────────────────┘
```

### 4.3 Request Lifecycle

```
Incoming Request
│
├──▶ CORS check (origin: FRONTEND_URL or localhost:3000)
│
├──▶ Global prefix: /api prepended
│
├──▶ [JwtAuthGuard] — Checks @Public() decorator
│   ├── If @Public() → skip auth, proceed to route
│   └── If not @Public() → validate Bearer token via JwtStrategy
│       ├── Extract JWT from Authorization header
│       ├── Verify signature + expiry (7 days)
│       ├── Lookup user by role:
│       │   ├── recruitment_agency → Company table
│       │   ├── hr_consultant → HRConsultant table
│       │   ├── candidate → User table
│       │   └── admin/support/etc → User table
│       ├── Attach decoded payload to request.user
│       └── Proceed
│
├──▶ [RolesGuard] — Checks @Roles() decorator
│   ├── If no @Roles() → allow all authenticated
│   └── If @Roles('admin', 'super_admin') → match request.user.role
│
├──▶ [ValidationPipe]
│   ├── whitelist: true (strip unknown properties)
│   ├── forbidNonWhitelisted: true (reject unknown)
│   └── transform: true (auto-transform types)
│
├──▶ Route Handler (Controller method)
│   ├── Extract params, body, query, @CurrentUser()
│   └── Call Service method
│
├──▶ Service (business logic)
│   ├── PrismaService for database
│   ├── MailService for emails
│   └── Audit logging where applicable
│
└──▶ Response (JSON)
```

### 4.4 NestJS Bootstrap Configuration

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(process.env.PORT || 3001)
}
```

---

## 5. Database Architecture

### 5.1 Entity Relationship Diagram

```
                      ┌───────────────────────────────────────────────────────────────────────────────────────┐
                      │                                  COMPANY                                              │
                      │  id, companyId, agencyName, contactPerson, email, passwordHash, category, status,     │
                      │  logo, gst, pan, address, website, registrationNumber, approvedBy, rejectionReason    │
                      └────────┬───────────────────┬────────────────┬────────────────┬────────────────────────┘
                               │                   │                │                │
                    ┌──────────▼──────┐  ┌─────────▼──────┐  ┌─────▼──────┐  ┌─────▼──────────┐
                    │  TeamMember     │  │ Subscription   │  │ Payment    │  │ Invoice        │
                    │  companyId (FK) │  │ companyId (FK) │  │companyId   │  │ paymentId (FK) │
                    └─────────────────┘  └────────────────┘  └────────────┘  └────────────────┘
                    ┌─────────────────┐  ┌────────────────┐  ┌────────────┐
                    │  PipelineStage  │  │    Job         │  │ Interview  │
                    │  companyId (FK) │  │ companyId (FK) │  │companyId   │
                    └─────────────────┘  └───────┬────────┘  └────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │     Application         │
                                    │  jobId (FK)             │
                                    │  candidateId (FK)       │
                                    └─────────────────────────┘

      ┌──────────────────┐       ┌──────────────────────┐
      │   User (admin)   │       │   HRRecruiter        │
      │  id, name, email │       │  id, employeeId,     │
      │  passwordHash,   │       │  name, email,        │
      │  role, status    │       │  agencyId (FK→Company│
      └──────────────────┘       │  status, performance │
                                 └──────────┬───────────┘
                                            │
                                 ┌──────────▼───────────┐
                                 │  RecruiterAssignment │
                                 │  recruiterId (FK)    │
                                 │  requirementId (FK)  │
                                 └──────────────────────┘

      ┌──────────────────┐       ┌──────────────────────┐
      │   MSMEClient     │       │   Requirement        │
      │  id, companyName │       │  id, clientId(FK),   │
      │  email, status   │       │  position, vacancies,│
      │  verification    │       │  status, budget      │
      └──────────────────┘       └──────────┬───────────┘
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                     ┌────────▼──────┐ ┌────▼─────┐ ┌────▼──────────┐
                     │ Quotation    │ │Requirement│ │ Recruiter     │
                     │ requirementId│ │Tracker    │ │ Assignment    │
                     │ clientId(FK) │ │reqId(FK) │ │ requirementId │
                     └───────────────┘ └──────────┘ └───────────────┘

      ┌──────────────────┐       ┌──────────────────────┐
      │   HRConsultant   │       │   CandidateV2        │
      │  id, employeeId  │       │  id, consultantId(FK)│
      │  name, email,    │       │  name, email, skills │
      │  activationToken │       │  aiMatchScore        │
      │  status          │       └──────────┬───────────┘
      └──────────────────┘                  │
                                            ├──────────────────┐
                              ┌─────────────┼─────────────┐    │
                              │             │             │    │
                     ┌────────▼──────┐ ┌────▼─────┐ ┌────▼────┐
                     │CandidateExpV2 │ │CandSkill │ │Candidate│
                     │               │ │   V2     │ │Cert     │
                     └───────────────┘ └──────────┘ └─────────┘

      ┌──────────────────┐       ┌──────────────────────┐
      │   User (candidate)│      │   CandidateProfile   │
      │  id, name, email │──1:1──│  userId (FK), gender │
      │  passwordHash    │       │  dob, address, etc.  │
      │  role=candidate  │       └──────────────────────┘
      └──────┬───────────┘
             │
    ┌────────┼────────────┬──────────────────┐
    │        │            │                  │
    ▼        ▼            ▼                  ▼
┌───────┐ ┌────────┐ ┌──────────┐ ┌───────────────┐
│Saved  │ │Candidate│ │Candidate│ │Candidate      │
│Job    │ │Applicat.│ │Education│ │Experience     │
└───────┘ └────────┘ └──────────┘ └───────────────┘

┌───────────────┐  ┌───────────────┐  ┌──────────────────┐
│EmailTemplate │  │ SmsTemplate   │  │ AuditLog         │
│templateKey   │  │ templateKey   │  │ userId, action   │
│(unique)      │  │ (unique)      │  │ details, ip      │
│category      │  │ category      │  └──────────────────┘
│subject, body │  │ message       │
│status        │  │ status        │  ┌──────────────────┐
└───────────────┘  └───────────────┘  │ EmailLog         │
                                      │ recipient,       │
┌───────────────┐  ┌───────────────┐  │ subject, status  │
│ Notification  │  │ SupportTicket │  │ errorMessage     │
│ type, title   │  │ ticketNo      │  └──────────────────┘
│ message, read │  │ clientId(FK)  │
│ companyId(FK) │  │ subject, msg  │
└───────────────┘  │ status, reply │
                   └───────────────┘
```

### 5.2 Model Summary

| Domain | Models | Count |
|--------|--------|-------|
| **Auth & Users** | User, Company, TeamMember | 3 |
| **Agency Operations** | Job, Candidate, Application, PipelineStage, Interview | 5 |
| **Subscriptions** | Subscription, Payment, Invoice | 3 |
| **System Logs** | Notification, AuditLog, EmailLog | 3 |
| **HR Recruiters** | HRRecruiter, RecruiterAssignment | 2 |
| **MSME** | MSMEClient, Requirement, RequirementTracker, Quotation, SupportTicket, Meeting | 6 |
| **HR Consultants** | HRConsultant, ConsultantAssignment, CandidateV2, CandidateExperienceV2, CandidateSkillV2, CandidateCertificate, CandidatePipelineV2, InterviewV2, ConsultantNotification, ConsultantActivityLog | 10 |
| **Candidate Portal** | CandidateProfile, CandidateEducation, CandidateExperience, CandidateSkill, CandidateDocument, CandidateCertification, CandidateApplication, SavedJob, CandidateNotification, CandidateMessage, InterviewInvitation | 11 |
| **Templates** | EmailTemplate, SmsTemplate | 2 |
| **Total** | | **46 models** |

### 5.3 Enum Summary

| Enum | Values | Used By |
|------|--------|---------|
| `UserRole` | super_admin, admin, support, recruitment_agency, hr_recruiter, msme_client, candidate | User |
| `CompanyStatus` | pending, approved, rejected, suspended | Company |
| `JobStatus` | draft, submitted, pending_review, under_review, changes_requested, approved, published, rejected, expired, archived, closed | Job |
| `JobPriority` | low, medium, high, urgent | Job |
| `ApplicationStatus` | applied, screening, shortlisted, interview, selected, offer, joined, rejected | Application |
| `InterviewType` | online, offline | Interview |
| `InterviewStatus` | scheduled, completed, cancelled | Interview |
| `TeamRole` | admin, hr_manager, recruiter, interviewer, viewer | TeamMember |
| `SubscriptionStatus` | active, expired, cancelled | Subscription |
| `PaymentStatus` | pending, completed, failed, refunded | Payment |
| `RequirementStatus` | pending → under_review → quoted → client_approved → recruiter_assigned → candidate_search → interview → offer → joining → completed | Requirement |
| `QuotationStatus` | draft, sent, approved, rejected | Quotation |
| `TicketStatus` | open, in_progress, resolved, closed | SupportTicket |
| `MeetingType` | online, offline | Meeting |
| `MeetingStatus` | scheduled, completed, cancelled | Meeting |
| `ConsultantStatus` | pending_activation, active, inactive, suspended | HRConsultant |

### 5.4 Indexes

```
Company:     @@index([status])
Job:         @@index([status]), @@index([companyId]), @@index([category])
HRRecruiter: @@index([status]), @@index([agencyId])
Requirement: @@index([clientId]), @@index([status])
EmailTemplate: @@index([category]), @@index([status])
SmsTemplate:  @@index([category]), @@index([status])
```

### 5.5 Prisma Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 6. Authentication & Authorization

### 6.1 Auth Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JWT AUTHENTICATION PIPELINE                         │
│                                                                             │
│  ┌──────────┐    ┌────────────┐    ┌──────────┐    ┌──────────────────┐    │
│  │  Client  │───▶│ JwtAuth    │───▶│ Roles    │───▶│ Controller/      │    │
│  │  Request │    │ Guard      │    │ Guard    │    │ Service          │    │
│  │  +Bearer │    │            │    │          │    │                  │    │
│  │  Token   │    │ Checks     │    │ Checks   │    │ request.user     │    │
│  └──────────┘    │ @Public()  │    │ @Roles() │    │ available        │    │
│                  │ & JWT      │    │ decorator│    │                  │    │
│                  └────────────┘    └──────────┘    └──────────────────┘    │
│                          │                                                  │
│                     ┌────▼────┐                                            │
│                     │ JWT     │                                            │
│                     │ Strategy│                                            │
│                     │ (role-  │                                            │
│                     │ based   │                                            │
│                     │ lookup) │                                            │
│                     └─────────┘                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 JWT Payload Structure

```typescript
// Generated by jwt.sign()
{
  sub: string,        // User/Company/Recruiter/Consultant ID
  email: string,      // User email
  role: string,       // UserRole enum value
  companyId?: string, // Included for recruitment_agency role
  iat: number,        // Issued at (auto)
  exp: number         // Expiry (7 days, auto)
}
```

### 6.3 Role-Based Strategy Lookup

| Role in JWT | Database Lookup | Status Check |
|------------|----------------|--------------|
| `recruitment_agency` | Company table by id | `status === 'approved'` |
| `hr_consultant` | HRConsultant table by id | `status === 'active'` |
| `candidate` | User table by id | Not suspended |
| `super_admin` | User table by id | Not suspended |
| `admin` | User table by id | Not suspended |
| `support` | User table by id | Not suspended |

### 6.4 Token Storage per Portal

| Portal | LocalStorage Key | Token Path |
|--------|-----------------|------------|
| Admin | `access_token` | Direct string |
| Agency | `access_token` | Direct string |
| HR Recruiter | `thozhil_hr_user` | `.accessToken` |
| Candidate | `thozhil_user` | `.accessToken` |
| MSME Client | `thozhil_client_user` | `.accessToken` |
| HR Consultant | `thozhil_consultant_user` | `.accessToken` |

### 6.5 API Client Token Resolution

```typescript
function getToken(): string | null {
  // Priority 1: Direct access_token
  const token = localStorage.getItem('access_token')
  if (token) return token

  // Priority 2: Stored user object with .accessToken
  try {
    const stored = localStorage.getItem('thozhil_user')
    if (stored) {
      const u = JSON.parse(stored)
      return u.accessToken || null
    }
  } catch {}

  return null
}
```

### 6.6 Role-Based Access Control Matrix

| Route | @Roles() | super_admin | admin | support | agency | hr_recruiter | msme | candidate |
|-------|----------|-------------|-------|---------|--------|--------------|------|-----------|
| `/api/auth/*` | @Public | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/api/jobs/published` | @Public | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/api/admin/*` | admin,super_admin | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `/api/companies/*` | admin,super_admin | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `/api/hr-recruiters/*` | admin,super_admin | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `/api/jobs/*` | admin,super_admin | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `/api/jobs` (POST) | — (authenticated) | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `/api/billing/*` | — (authenticated) | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `/api/requirements/*` | — (authenticated) | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `/api/candidate-portal/*` | — (authenticated) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 7. API Layer

### 7.1 API Client Architecture

```
Frontend Components
        │
        ├── use api-client.ts ─────────────────────────────────────────┐
        │   (all roles except candidate)                               │
        │   Uses: getToken() (access_token / thozhil_user)             │
        │   Groups: auth, companies, users, jobs, candidates,          │
        │           pipeline, interviews, billing, team,               │
        │           hrConsultants, hrRecruiters, portal,               │
        │           emailTemplates, smsTemplates, upload, auditLogs    │
        │                                                              │
        ├── use api.ts ────────────────────────────────────────────────┤
        │   (candidate portal only)                                    │
        │   Uses: candidate_token from localStorage                    │
        │   Groups: candidate-auth, portal (profile, education, etc.)  │
        │                                                              │
        └── use db.ts ─────────────────────────────────────────────────┘
            (abstraction over api-client.ts)
            Interfaces: DBUser, DBCompany, DBNotification, DBAuditLog

        All routes share:
        ┌──────────────────────────────────────────────────────────┐
        │  request<T>(endpoint, options?)                          │
        │  ├── Base URL: NEXT_PUBLIC_API_URL or localhost:3001/api │
        │  ├── Auto-injects Bearer token                           │
        │  ├── Content-Type: application/json (default)            │
        │  ├── Returns null on 401 (unauthorized)                  │
        │  ├── Returns null on ECONNREFUSED (backend down)         │
        │  ├── Throws Error on other failures                      │
        │  └── Generic return type <T>                             │
        └──────────────────────────────────────────────────────────┘
```

### 7.2 API Endpoint Groups

| Group | Base Path | Methods |
|-------|-----------|---------|
| **Auth** | `/api/auth` | login, register, companyLogin |
| **Companies** | `/api/companies` | getAll, getOne, getStats, updateStatus |
| **Users** | `/api/users` | getAll, create, updateStatus |
| **Jobs** | `/api/jobs` | CRUD + approve, reject, requestChanges, submit, feature, unfeature, archive, suspend, bulk operations, admin-stats, published (public), by-status |
| **Candidates** | `/api/candidates` | getAll (filtered) |
| **Pipeline** | `/api/pipeline` | get, update |
| **Interviews** | `/api/interviews` | getAll, create |
| **Billing** | `/api/billing` | getMySubscription, getMyPayments, createOrder, verifyPayment |
| **Team** | `/api/team` | getMembers, invite |
| **Notifications** | `/api/notifications` | getAll, create, markRead, markAllRead |
| **Audit Logs** | `/api/audit-logs` | getAll |
| **Upload** | `/api/upload` | logo (multipart), document (multipart) |
| **HR Consultants** | `/api/hr-consultants` | CRUD + signup, login, googleLogin, activate, sendOtp, verifyOtp |
| **HR Recruiters** | `/api/hr-recruiters` | CRUD + approve, reject, suspend, reactivate, resetPassword, assignAgency, performance |
| **Candidate Auth** | `/api/candidate-auth` | login, register, googleLogin, sendOtp, verifyOtp |
| **Candidate Portal** | `/api/candidate-portal` | profile, education, experience, skills, documents, certifications, applications, savedJobs, interviews, notifications, messages, dashboard |
| **Requirements** | `/api/requirements` | CRUD + trackers |
| **Quotations** | `/api/quotations` | CRUD |
| **Meetings** | `/api/meetings` | CRUD |
| **Support Tickets** | `/api/support-tickets` | CRUD |
| **MSME Clients** | `/api/msme-clients` | getAll, getOne |
| **Email Templates** | `/api/email-templates` | CRUD + preview, duplicate, toggleStatus, sendTest |
| **SMS Templates** | `/api/sms-templates` | CRUD + preview, duplicate, toggleStatus, sendTest |

---

## 8. Component Architecture

### 8.1 Component Categories

```
components/
│
├── PROVIDERS (2)
│   ├── theme-provider.tsx       next-themes wrapper
│   └── hooks/use-auth.tsx       AuthProvider context
│
├── LAYOUT (17)
│   ├── navbar.tsx               Public navigation bar
│   ├── footer.tsx               Public footer
│   ├── brand-logo.tsx           Configurable logo component
│   ├── contact-sales-float.tsx  Floating contact CTA
│   │
│   └── layout/                  Portal-specific layouts
│       ├── admin-header.tsx     Admin top bar with user menu
│       ├── admin-sidebar.tsx    Collapsible, 5 sections, 25 items
│       ├── dashboard-header.tsx Agency header
│       ├── dashboard-sidebar.tsx 10 nav items
│       ├── candidate-header.tsx
│       ├── candidate-sidebar.tsx 13 nav items + logout
│       ├── hr-header.tsx
│       ├── hr-sidebar.tsx       11 items + switch role
│       ├── hr-consultant-header.tsx
│       ├── hr-consultant-sidebar.tsx 10 items + upgrade
│       ├── msme-header.tsx
│       ├── msme-sidebar.tsx     10 items
│       ├── client-header.tsx    Legacy (redirected)
│       └── client-sidebar.tsx   Legacy (redirected)
│
└── UI (22)
    ├── avatar.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx
    ├── dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx
    ├── progress.tsx, scroll-area.tsx, select.tsx, separator.tsx
    ├── sheet.tsx, skeleton.tsx, slider.tsx, switch.tsx
    ├── table.tsx, tabs.tsx, textarea.tsx, toggle.tsx
    └── editor/rich-text-editor.tsx
```

### 8.2 Sidebar Pattern

All sidebars follow the same pattern:

```typescript
// Pattern used by all sidebar components
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

// Define sidebar items as array of sections
const sidebarSections = [
  {
    label: 'Section Name',
    items: [
      { icon: IconComponent, label: 'Item Name', href: '/path', badge?: 'NEW' },
    ],
  },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Active route detection
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className={cn('flex flex-col border-r bg-card h-full transition-all', collapsed ? 'w-16' : 'w-64')}>
      <BrandLogo />
      <Button onClick={() => setCollapsed(!collapsed)} />
      <ScrollArea>
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && <SectionLabel />}
            <nav>
              {section.items.map(item => (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-3')}>
                    <item.icon />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && <Badge>{item.badge}</Badge>}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
```

### 8.3 TanStack Table Pattern

```typescript
// Pattern used by admin data tables
'use client'

import {
  ColumnDef, flexRender, getCoreRowModel, useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 9. Routing Architecture

### 9.1 Route Organization

```
/ (public)                    ─── Landing page
/about (public)               ─── About
/pricing (public)             ─── Pricing
/login (public)               ─── Unified login
/jobs (public)                ─── Public job portal (no auth)
/jobs/[id] (public)           ─── Job detail

/admin/*                      ─── Admin Portal (auth: access_token)
  ├── layout.tsx              ─── AdminSidebar + AdminHeader + auth guard
  ├── dashboard               ─── KPI dashboard
  ├── agencies/*              ─── Agency management (5 sub-pages)
  ├── msme-clients/*          ─── MSME management
  ├── hr-recruiters/*         ─── HR Recruiter management (8 sub-pages)
  ├── jobs/*                  ─── Job approval workflow (5 sub-pages)
  ├── email-templates/*       ─── Email template management (4 sub-pages)
  ├── sms-templates/*         ─── SMS template management (4 sub-pages)
  ├── users, subscriptions, payments, reports, etc.

/dashboard/*                  ─── Agency Portal (auth: access_token)
  ├── layout.tsx              ─── DashboardSidebar + Header + auth guard
  ├── page.tsx                ─── Agency dashboard
  ├── job-post, candidates, hiring-pipeline, etc.

/hr/*                         ─── HR Recruiter Portal (auth: thozhil_hr_user)
  ├── layout.tsx              ─── HrSidebar + Header + auth guard
  ├── login (public)          ─── Email/Google login
  ├── dashboard, candidates, job-post, billing, etc.

/business-operations/hr-consultant/*
                              ─── HR Consultant Portal (auth: thozhil_consultant_user)
  ├── layout.tsx              ─── HrConsultantSidebar + auth guard
  ├── login (public)
  ├── signup (public)
  ├── dashboard, candidates, pipeline, etc.

/business-operations/msme/*   ─── MSME Client Portal (auth: thozhil_client_user)
  ├── layout.tsx              ─── MSMESidebar + auth guard
  ├── login (public)
  ├── signup (public)
  ├── dashboard, requirements, tracker, etc.

/candidate/*                  ─── Candidate Portal (auth: thozhil_user)
  ├── layout.tsx              ─── CandidateSidebar + auth guard + profile check
  ├── login (public)
  ├── register (public)
  ├── profile, jobs, applications, etc.

Legacy (redirect):
  /client/* → /business-operations/msme/*
  /hr-consultant/* → /business-operations/hr-consultant/*
  /job-portal → /jobs
```

### 9.2 Layout Hierarchy

```
Each protected portal has:
├── layout.tsx (server component)
│   ├── Imports portal-specific Sidebar + Header components
│   ├── Checks auth (redirects to login if no token)
│   └── Renders sidebar + header + {children}

Public pages have no layout guard:
├── / (landing)
├── /about
├── /pricing
├── /login
├── /jobs
└── /jobs/[id]
```

### 9.3 Auth Guard Pattern

```typescript
// Admin layout example
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) router.push('/admin/login')
  }, [])

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
```

---

## 10. State Management

### 10.1 State Management Approach

The project does NOT use Redux, Zustand, or any external state management library. State is managed through:

1. **React Context** (`use-auth.tsx`) — Auth state (user, token)
2. **Local component state** (`useState` / `useEffect`) — Page-level data
3. **localStorage** — Persisted tokens and user data
4. **URL query params** — Search filters, pagination
5. **sessionStorage** — Cross-page data (HR Recruiter creation → payment flow)

### 10.2 Auth Context

```typescript
// hooks/use-auth.tsx
interface AuthUser {
  id: string
  companyId?: string
  name: string
  email: string
  role: UserRole
  logo?: string
  status?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// AuthProvider:
// - Stores: localStorage('thozhil_user') + localStorage('access_token')
// - login(): calls api.auth.login(), falls back to api.auth.companyLogin()
// - register(): calls db.companies.create()
// - logout(): clears all localStorage
```

### 10.3 Data Fetching Pattern

```typescript
// Standard page pattern (NOT using React Query)
const [data, setData] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

const fetchData = useCallback(async () => {
  setLoading(true)
  setError(null)
  try {
    const res = await api.someEndpoint.getData()
    if (res) setData(res)
    else setError('No data returned')
  } catch (e: any) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}, [dependencies])

useEffect(() => { fetchData() }, [fetchData])
```

### 10.4 Pagination Pattern

```typescript
const [page, setPage] = useState(1)
const [search, setSearch] = useState('')
const [filters, setFilters] = useState({})

const fetchData = useCallback(async () => {
  const res = await api.endpoint.getAll({
    page: String(page),
    limit: '20',
    search: search || undefined,
    ...filters,
  })
  if (res) {
    setItems(res.items || res.recruiters || res.templates)
    setTotal(res.total)
    setTotalPages(res.totalPages)
  }
}, [page, search, filters])
```

---

## 11. Email & Notification Architecture

### 11.1 Email Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        EMAIL SYSTEM                               │
│                                                                   │
│  Any Service                                                      │
│       │                                                           │
│       ├──▶ this.mailService.sendXxxEmail(to, data)                │
│       │                                                           │
│       ▼                                                           │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  MailService (Global Module)                           │       │
│  │                                                        │       │
│  │  Transporter: Nodemailer (Gmail SMTP)                  │       │
│  │  From: thozhilkoodam@gmail.com                         │       │
│  │                                                        │       │
│  │  Flow:                                                  │       │
│  │  1. Build HTML from template                            │       │
│  │  2. transporter.sendMail({to, subject, html})           │       │
│  │  3. Log to email_logs table                             │       │
│  │  4. On failure: log error + status='failed'             │       │
│  │                                                        │       │
│  │  Methods:                                               │       │
│  │  ├── sendRegistrationNotification()                    │       │
│  │  ├── sendApprovalEmail()                                │       │
│  │  ├── sendRejectionEmail()                               │       │
│  │  ├── sendRequirementSubmitted()                        │       │
│  │  ├── sendHrConsultantInvitation()                      │       │
│  │  ├── sendJobApprovalEmail()                             │       │
│  │  ├── sendJobRejectionEmail()                            │       │
│  │  ├── sendJobChangesRequestedEmail()                     │       │
│  │  ├── sendHrRecruiterWelcomeEmail()                      │       │
│  │  ├── sendPasswordResetEmail()                           │       │
│  │  └── sendTestEmail()                                    │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  Email Templates (DB-driven, admin-managed)             │       │
│  │                                                        │       │
│  │  Table: email_templates                                 │       │
│  │  ├── templateKey (unique identifier)                    │       │
│  │  ├── templateName, category, subject, body (HTML)       │       │
│  │  ├── variables (JSON array of supported variable names) │       │
│  │  └── status (active/inactive)                           │       │
│  │                                                        │       │
│  │  Usage:                                                  │       │
│  │  const tmpl = await prisma.emailTemplate.findUnique({   │       │
│  │    where: { templateKey: 'welcome_email' }              │       │
│  │  })                                                     │       │
│  │  let html = tmpl.body                                   │       │
│  │    .replace(/{{name}}/g, user.name)                     │       │
│  │    .replace(/{{email}}/g, user.email)                   │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  Database Logging                                       │       │
│  │  email_logs table:                                      │       │
│  │  ├── recipient, subject, status (sent/failed)           │       │
│  │  └── errorMessage (if failed)                           │       │
│  └────────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 Notification System

```
┌──────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION SYSTEM                          │
│                                                                   │
│  Table: notifications                                             │
│  ├── type: string (e.g. 'job_approved', 'agency_registered')     │
│  ├── title: string                                                │
│  ├── message: string                                              │
│  ├── read: boolean (default false)                                │
│  └── companyId: FK to Company (nullable)                          │
│                                                                   │
│  API:                                                              │
│  ├── GET    /api/notifications       → All (desc by createdAt)    │
│  ├── POST   /api/notifications       → Create                     │
│  ├── PATCH  /api/notifications/:id/read → Mark one read           │
│  └── POST   /api/notifications/mark-all-read → Mark all read      │
│                                                                   │
│  Created by:                                                       │
│  ├── Admin actions (approve/reject)                               │
│  ├── Job status changes                                           │
│  ├── Payment events                                               │
│  └── Registration events                                          │
└──────────────────────────────────────────────────────────────────┘
```

### 11.3 Template Integration Pattern

```typescript
// How to integrate email templates into any service
async sendNotification(recipient: { email: string, name: string }, context: any) {
  // 1. Look up active template
  const template = await this.prisma.emailTemplate.findUnique({
    where: { templateKey: context.templateKey }
  })
  if (!template || template.status !== 'active') {
    // Fallback or skip
    return
  }

  // 2. Replace variables
  let html = template.body
  let subject = template.subject
  for (const [key, value] of Object.entries(context.variables)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  // 3. Send
  await this.mailService.sendTestEmail(recipient.email, subject, html)
}
```

---

## 12. File Storage Architecture

### 12.1 Upload System

```
┌──────────────────────────────────────────────────────────────────┐
│                      FILE UPLOAD SYSTEM                           │
│                                                                   │
│  Backend: UploadModule                                            │
│  ├── Controller: POST /api/upload/logo (multipart)               │
│  │              POST /api/upload/document (multipart)            │
│  └── Uses: multer for multipart handling                         │
│                                                                   │
│  Storage: Supabase Storage (via service-role key)                 │
│  ├── Buckets: company-logos, documents                           │
│  └── Public URLs returned to frontend                            │
│                                                                   │
│  Frontend:                                                        │
│  ├── api.upload.logo(file: File) → FormData POST                 │
│  └── api.upload.document(file: File) → FormData POST             │
│                                                                   │
│  Document types (via MSME verification):                         │
│  ├── GST certificate                                             │
│  ├── PAN card                                                    │
│  ├── Incorporation certificate                                   │
│  ├── Business registration certificate                           │
│  └── Director Aadhaar / PAN                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 13. Payment Architecture

### 13.1 Razorpay Integration

```
┌──────────────────────────────────────────────────────────────────┐
│                      PAYMENT SYSTEM (Razorpay)                   │
│                                                                   │
│  Frontend Flow:                                                   │
│  1. User selects plan (Professional / Business)                   │
│  2. POST /api/billing/create-order                                │
│     → Backend creates Razorpay order                              │
│     → Returns { orderId, amount, currency }                      │
│  3. Open Razorpay checkout with orderId                          │
│  4. User completes payment on Razorpay                           │
│  5. POST /api/billing/verify                                      │
│     Body: { razorpay_order_id, razorpay_payment_id,              │
│             razorpay_signature }                                  │
│     → Backend verifies HMAC signature                            │
│     → Creates Subscription (active) + Payment (completed)        │
│     → Generates Invoice                                          │
│     → Sends confirmation emails                                  │
│                                                                   │
│  Backend:                                                         │
│  ├── POST /api/billing/create-order                               │
│  │   → Razorpay.orders.create({ amount, currency, receipt })     │
│  ├── POST /api/billing/verify                                    │
│  │   → crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)          │
│  │   → Compare generated signature with received signature       │
│  ├── GET /api/billing/my-subscription                            │
│  ├── GET /api/billing/my-payments                                │
│  └── Roles: hr_recruiter, msme_client, hr_consultant             │
│                                                                   │
│  Tables:                                                          │
│  ├── Subscription: id, companyId, planName, jobPosts, price,     │
│  │                 status, startDate, endDate                     │
│  ├── Payment: id, companyId, amount, currency, status,           │
│  │            razorpayOrderId, razorpayPaymentId,                │
│  │            razorpaySignature                                   │
│  └── Invoice: id, paymentId (unique FK), number, url             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 14. Security Architecture

### 14.1 Security Layers

```
┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                        │
│                                                                   │
│  LAYER 1: Network                                                 │
│  ├── CORS: restricted to FRONTEND_URL (localhost:3000)           │
│  └── Port: 3001 (backend not publicly exposed)                   │
│                                                                   │
│  LAYER 2: Authentication                                          │
│  ├── JWT with 7-day expiry                                       │
│  ├── Passwords: bcryptjs hashing (no plaintext stored)           │
│  ├── Google OAuth (HR Consultant, Candidate)                     │
│  └── Phone OTP (HR Consultant)                                   │
│                                                                   │
│  LAYER 3: Authorization                                           │
│  ├── JwtAuthGuard: validates every request (except @Public)      │
│  ├── RolesGuard: role-based endpoint access                      │
│  └── JwtStrategy: role-specific database lookup + status check   │
│                                                                   │
│  LAYER 4: Input Validation                                        │
│  ├── ValidationPipe: whitelist=true, forbidNonWhitelisted=true   │
│  ├── class-validator DTOs (@IsEmail, @MinLength, @IsOptional)   │
│  └── transform: true (auto-type casting)                         │
│                                                                   │
│  LAYER 5: API Client                                              │
│  ├── Returns null on 401 (graceful degradation)                  │
│  ├── Returns null on ECONNREFUSED (graceful degradation)         │
│  └── No sensitive data in localStorage keys                      │
│                                                                   │
│  LAYER 6: Audit                                                   │
│  ├── All admin actions logged to audit_logs table                │
│  └── Email logs track all outbound communications                │
└──────────────────────────────────────────────────────────────────┘
```

### 14.2 Security Details

| Concern | Implementation |
|---------|---------------|
| Password storage | bcryptjs with salt rounds (default) |
| JWT secret | Environment variable `JWT_SECRET` |
| Token expiry | 7 days |
| CORS | Whitelist: `FRONTEND_URL` env var |
| Input validation | class-validator DTOs with whitelist mode |
| SQL injection | Prevented by Prisma ORM (parameterized queries) |
| XSS | React's default escaping; HTML content via TipTap is stored as-is |
| CSRF | JWT in Authorization header (not cookies) |
| Rate limiting | Not implemented (should be added) |
| File upload | Multipart via multer (file type validation needed) |

---

## 15. Performance Architecture

### 15.1 Frontend Performance

| Technique | Implementation |
|-----------|---------------|
| Static pages | Public routes pre-rendered (SSG) |
| Client components | Only where needed ('use client' minimized) |
| Dynamic routes | Server-rendered on demand (SSR) |
| Image optimization | next/image with localhost domain |
| Skeleton loading | All data pages show loading skeletons |
| Pagination | Server-side pagination (10-20 items per page) |
| Debounced search | Search fires on Enter or debounced onChange |

### 15.2 Backend Performance

| Technique | Implementation |
|-----------|---------------|
| Pagination | All list endpoints: skip/take with page/limit |
| Indexed queries | Key fields indexed (status, companyId, category) |
| Connection pooling | Prisma auto-manages connection pool |
| Lazy loading | Prisma relations loaded only when `include` is specified |
| Selective fields | `select` used instead of full model where possible |

### 15.3 Database Indexes

```sql
-- Key indexes defined in Prisma schema
CREATE INDEX ON companies(status);
CREATE INDEX ON jobs(status);
CREATE INDEX ON jobs(company_id);
CREATE INDEX ON hr_recruiters(status);
CREATE INDEX ON hr_recruiters(agency_id);
CREATE INDEX ON requirements(client_id);
CREATE INDEX ON requirements(status);
CREATE INDEX ON email_templates(category);
CREATE INDEX ON email_templates(status);
CREATE INDEX ON sms_templates(category);
CREATE INDEX ON sms_templates(status);
```

---

## 16. Deployment Architecture

### 16.1 Local Development

```
┌──────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT                │
│                                               │
│  Frontend:  npm run dev                       │
│             http://localhost:3000             │
│                                               │
│  Backend:   npm run start:dev                 │
│             http://localhost:3001             │
│             Global prefix: /api               │
│                                               │
│  Database:  PostgreSQL via Docker or Supabase │
│             Connection: DATABASE_URL env      │
│                                               │
│  Email:     Nodemailer (Gmail SMTP)           │
│             SMTP_HOST / SMTP_USER / SMTP_PASS │
│                                               │
│  Payments:  Razorpay test mode                │
│             RAZORPAY_KEY_ID / KEY_SECRET      │
│                                               │
│  Storage:   Supabase storage                  │
│             SUPABASE_URL / SERVICE_KEY        │
└──────────────────────────────────────────────┘
```

### 16.2 Environment Variables

```
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/thozhilkoodam
JWT_SECRET=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=thozhilkoodam@gmail.com
SMTP_PASS=xxx
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 16.3 Production Considerations

| Component | Recommendation |
|-----------|---------------|
| Frontend | Deploy to Vercel (native Next.js support) |
| Backend | Deploy to Railway / Render / AWS ECS |
| Database | Supabase PostgreSQL (managed, backups included) |
| Email | Upgrade to SendGrid / AWS SES for production volume |
| Storage | Supabase Storage (S3-compatible) |
| Payments | Razorpay live mode |
| File uploads | Add file size limits + type validation |
| Rate limiting | Add @nestjs/throttler or express-rate-limit |
| Error monitoring | Add Sentry or Datadog |
| CI/CD | GitHub Actions for lint + test + deploy |

---

## Architecture Decision Records

### ADR-1: Why Prisma db push instead of migrations?
**Context**: Shadow database corruption prevented `prisma migrate dev` from working.
**Decision**: Use `prisma db push` for schema updates. This skips migration file generation.
**Trade-off**: No versioned migration history. Schema changes are immediate and not reversible.

### ADR-2: Why two separate application models?
**Context**: The platform has two candidate application flows.
**Decision**: Keep `Application` (agency-side, linked to Candidate+Job) and `CandidateApplication` (candidate-side, linked to User) separate.
**Rationale**: Different ownership, different lifecycle, different UI portals.

### ADR-3: Why localStorage over cookies?
**Context**: No server-side rendering requirements for authenticated pages.
**Decision**: Store JWT tokens in localStorage with portal-specific keys.
**Rationale**: Simpler implementation, no CSRF concerns with Bearer-header pattern.

### ADR-4: Why no React Query / TanStack Query?
**Context**: Many pages fetch data from API.
**Decision**: Use raw `useState` + `useEffect` + `useCallback` pattern.
**Rationale**: Simpler for the current scope; can be migrated to React Query when caching/refetching requirements grow.

### ADR-5: Why two API clients (api-client.ts + api.ts)?
**Context**: Candidate portal uses different auth token than admin/agency portals.
**Decision**: Maintain separate API clients with different token resolution logic.
**Rationale**: Clean separation of concerns; avoids complex token resolution branching.

### ADR-6: Why TipTap for rich text editor?
**Context**: Email body requires HTML editing with formatting.
**Decision**: Use TipTap (based on ProseMirror) over alternatives (Quill, CKEditor, etc.).
**Rationale**: Modern, extensible, TypeScript-first, well-maintained, tree-shakeable.
