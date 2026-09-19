# Thozhil Koodam AI — Enterprise Recruitment Platform

An AI-native, multi-tenant enterprise recruitment and human resource platform built for candidates, recruiters, HR consultants, and enterprises.

---

## 🚀 Key Modules & Capabilities

1. **Authentication & Multi-Tenant Authorization**:
   - Secure candidate and company authentication with JWT.
   - Strict tenant isolation between recruitment agencies, enterprise employers, and candidates.
   - Comprehensive audit logging and role-based access control.

2. **Candidate Portal & AI Resume Intelligence**:
   - Comprehensive candidate profile builder (skills, education, experience, certificates).
   - Document upload with magic bytes validation and private Supabase storage.
   - Google Gemini-powered **AI Resume Extraction** and **AI Resume Analysis**.
   - Semantic **AI Job Matching** with deterministic match scoring.

3. **Employer Job & Application Management**:
   - Complete job lifecycle: Draft $\rightarrow$ Submitted $\rightarrow$ Published $\rightarrow$ Closed $\rightarrow$ Archived.
   - Multi-tenant application tracking pipeline with filterable status stages.
   - Explainable **AI Candidate Screening Assistant** providing human-in-the-loop candidate alignment without autonomous hiring decisions.

4. **Interview Management & AI Assistants**:
   - Interview scheduling across technical, HR, and managerial rounds.
   - Candidate interview preparation assistant with tailored practice topics.
   - **AI Interview Evaluation Assistant** generating structured assessment criteria and interviewer feedback summaries.

5. **Job Offer Management & AI Offer Assistant**:
   - Compensation package formulation (fixed base, variable bonus, currency, benefits).
   - Gemini-powered AI Offer Letter drafting with legal clauses and tailored candidate details.
   - Formal offer release and candidate acceptance/decline lifecycle.

6. **Onboarding, Joining & Employment Activation**:
   - Post-offer acceptance collaborative onboarding workflows.
   - Role-separated checklists (Candidate Tasks vs Employer Verification Tasks).
   - Secure candidate credential upload with authenticated, expiring signed URLs.
   - **Explicit, human-controlled joining confirmation** updating application stage to `joined` and activating candidate employment profile.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI, Lucide Icons, Recharts
- **Backend**: NestJS, TypeScript, Express, Class-Validator, Passport JWT
- **Database**: PostgreSQL with Prisma ORM
- **Object Storage**: Supabase Private Storage / Storage Repository abstraction
- **AI Engine**: Google Gemini API (with deterministic scoring & offline fallback)
- **Testing**: Jest (Unit & Security, 43 test suites / 238 tests), Playwright E2E

---

## 📁 Repository Structure

```
thozhil-koodam/
├── app/                  # Next.js App Router (Candidate, HR, MSME, Admin portals)
├── components/           # Reusable UI components and layouts
├── lib/                  # Shared utilities and API client
├── backend/              # NestJS backend application
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── auth/         # Authentication & JWT strategy
│   │   ├── applications/ # Application management
│   │   ├── jobs/         # Job lifecycle management
│   │   ├── screening/    # AI Candidate Screening
│   │   ├── interviews/   # Interview management & AI evaluation
│   │   ├── offers/       # Job offer management & AI drafting
│   │   ├── onboarding/   # Onboarding & joining confirmation
│   │   ├── documents/    # Secure document storage service
│   │   └── ...
├── docs/                 # Platform documentation and setup guides
└── package.json
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Supabase Project (optional for cloud storage, fallback enabled)

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npx prisma generate
npm run start:dev
```

### Frontend Setup
```bash
# In project root
cp .env.example .env.local
npm install
npm run dev
```

Platform URL: `http://localhost:3000`  
API Server: `http://localhost:3001/api`

---

## 🧪 Testing

```bash
# Run all backend unit and security test suites
cd backend
npm test

# Build verification
npm run build

# Frontend TypeScript check
cd ..
npx tsc --noEmit
```

---

## 📄 License
Proprietary — Thozhil Koodam. All rights reserved.