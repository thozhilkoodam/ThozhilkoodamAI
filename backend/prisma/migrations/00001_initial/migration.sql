-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'support', 'recruitment_agency', 'hr_recruiter', 'msme_client');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('draft', 'pending_review', 'published', 'closed');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('applied', 'screening', 'shortlisted', 'interview', 'selected', 'offer', 'joined', 'rejected');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('online', 'offline');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('admin', 'hr_manager', 'recruiter', 'interviewer', 'viewer');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('pending', 'under_review', 'quoted', 'client_approved', 'recruiter_assigned', 'candidate_search', 'interview', 'offer', 'joining', 'completed');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('draft', 'sent', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('online', 'offline');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ConsultantStatus" AS ENUM ('pending_activation', 'active', 'inactive', 'suspended');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'support',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "agency_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "position" TEXT,
    "employee_count" TEXT,
    "vacancy_count" TEXT,
    "registration_number" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'recruitment-agencies',
    "status" "CompanyStatus" NOT NULL DEFAULT 'pending',
    "logo" TEXT,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "suspended_by" TEXT,
    "suspended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_documents" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "employment_type" TEXT,
    "work_mode" TEXT,
    "location" TEXT,
    "experience" TEXT,
    "salary_range" TEXT,
    "vacancy_count" INTEGER,
    "notice_period" TEXT,
    "description" TEXT,
    "responsibilities" TEXT,
    "skills" TEXT,
    "qualifications" TEXT,
    "benefits" TEXT,
    "primary_skills" TEXT,
    "secondary_skills" TEXT,
    "mandatory_skills" TEXT,
    "preferences" TEXT,
    "screening_questions" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "current_company" TEXT,
    "experience" TEXT,
    "skills" TEXT,
    "location" TEXT,
    "last_active" TIMESTAMP(3),
    "photo" TEXT,
    "gender" TEXT,
    "current_ctc" DOUBLE PRECISION,
    "expected_ctc" DOUBLE PRECISION,
    "notice_period" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "resume_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "candidate_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "recruiter_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "job_posts" INTEGER NOT NULL,
    "candidate_access" INTEGER NOT NULL,
    "team_members" INTEGER NOT NULL,
    "validity_months" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "order_id" TEXT,
    "payment_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "razorpay_signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_recruiters" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "photo" TEXT,
    "company" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "reporting_manager" TEXT,
    "hiring_manager" TEXT,
    "experience" TEXT,
    "preferred_industry" TEXT,
    "preferred_locations" TEXT,
    "skills" TEXT,
    "resume_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "google_id" TEXT,
    "phone_otp" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msme_clients" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "logo" TEXT,
    "gst" TEXT,
    "pan" TEXT,
    "address" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "employee_count" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "gst_cert" TEXT,
    "pan_cert" TEXT,
    "incorporation_cert" TEXT,
    "business_reg_cert" TEXT,
    "director_aadhaar" TEXT,
    "director_pan" TEXT,
    "aadhaar_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "phone_otp" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "msme_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "experience" TEXT,
    "education" TEXT,
    "skills" TEXT,
    "min_salary" DOUBLE PRECISION,
    "max_salary" DOUBLE PRECISION,
    "hiring_deadline" TIMESTAMP(3),
    "joining_date" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "employment_type" TEXT,
    "interview_mode" TEXT,
    "venue" TEXT,
    "interview_date" TIMESTAMP(3),
    "interview_time" TEXT,
    "contact_person" TEXT,
    "contact_phone" TEXT,
    "google_map" TEXT,
    "instructions" TEXT,
    "meeting_link" TEXT,
    "meeting_platform" TEXT,
    "status" "RequirementStatus" NOT NULL DEFAULT 'pending',
    "priority" TEXT DEFAULT 'medium',
    "budget" DOUBLE PRECISION,
    "timeline" TEXT,
    "assigned_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_trackers" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiter_assignments" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruiter_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotation_no" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "service_charges" DOUBLE PRECISION NOT NULL,
    "placement_charges" DOUBLE PRECISION NOT NULL,
    "gst_percentage" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "terms" TEXT,
    "status" "QuotationStatus" NOT NULL DEFAULT 'draft',
    "pdf_url" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachment" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "admin_reply" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
    "link" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_consultants" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activation_token" TEXT,
    "activation_expires" TIMESTAMP(3),
    "phone" TEXT,
    "photo" TEXT,
    "agency_id" TEXT,
    "agency_name" TEXT,
    "branch" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "reporting_manager" TEXT,
    "hiring_manager" TEXT,
    "experience" TEXT,
    "specialization" TEXT,
    "preferred_industries" TEXT,
    "preferred_job_roles" TEXT,
    "preferred_locations" TEXT,
    "languages" TEXT,
    "skills" TEXT,
    "certifications" TEXT,
    "achievements" TEXT,
    "resume_url" TEXT,
    "linked_in_url" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "status" "ConsultantStatus" NOT NULL DEFAULT 'active',
    "performance_score" DOUBLE PRECISION DEFAULT 0,
    "google_id" TEXT,
    "phone_otp" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_consultants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_assignments" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "requirement_id" TEXT,
    "client_name" TEXT,
    "position" TEXT,
    "assigned_by" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates_v2" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "photo" TEXT,
    "designation" TEXT,
    "current_company" TEXT,
    "experience" TEXT,
    "skills" TEXT,
    "education" TEXT,
    "location" TEXT,
    "current_ctc" DOUBLE PRECISION,
    "expected_ctc" DOUBLE PRECISION,
    "notice_period" TEXT,
    "ai_match_score" DOUBLE PRECISION DEFAULT 0,
    "resume_url" TEXT,
    "documents" TEXT,
    "comments" TEXT,
    "source" TEXT DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'applied',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_experiences_v2" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "duration" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_experiences_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills_v2" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT DEFAULT 'intermediate',

    CONSTRAINT "candidate_skills_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_certificates" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "year" TEXT,
    "url" TEXT,

    CONSTRAINT "candidate_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_pipeline_v2" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "notes" TEXT,
    "moved_by" TEXT,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_pipeline_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews_v2" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "company_name" TEXT,
    "position" TEXT,
    "interview_type" TEXT NOT NULL,
    "interview_date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "venue" TEXT,
    "meeting_link" TEXT,
    "interviewer" TEXT,
    "feedback" TEXT,
    "rating" INTEGER DEFAULT 0,
    "result" TEXT DEFAULT 'pending',
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interviews_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_notifications" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_activity_logs" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_id_key" ON "companies"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_recruiters_employee_id_key" ON "hr_recruiters"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_recruiters_email_key" ON "hr_recruiters"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hr_recruiters_google_id_key" ON "hr_recruiters"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "msme_clients_company_id_key" ON "msme_clients"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "msme_clients_email_key" ON "msme_clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "msme_clients_google_id_key" ON "msme_clients"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "requirements_requirement_id_key" ON "requirements"("requirement_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_no_key" ON "quotations"("quotation_no");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_no_key" ON "support_tickets"("ticket_no");

-- CreateIndex
CREATE UNIQUE INDEX "hr_consultants_employee_id_key" ON "hr_consultants"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_consultants_email_key" ON "hr_consultants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hr_consultants_activation_token_key" ON "hr_consultants"("activation_token");

-- CreateIndex
CREATE UNIQUE INDEX "hr_consultants_google_id_key" ON "hr_consultants"("google_id");

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "hr_recruiters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "msme_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_trackers" ADD CONSTRAINT "requirement_trackers_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_assignments" ADD CONSTRAINT "recruiter_assignments_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_assignments" ADD CONSTRAINT "recruiter_assignments_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "hr_recruiters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "msme_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "msme_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "msme_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_assignments" ADD CONSTRAINT "consultant_assignments_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "hr_consultants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates_v2" ADD CONSTRAINT "candidates_v2_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "hr_consultants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences_v2" ADD CONSTRAINT "candidate_experiences_v2_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills_v2" ADD CONSTRAINT "candidate_skills_v2_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_certificates" ADD CONSTRAINT "candidate_certificates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_pipeline_v2" ADD CONSTRAINT "candidate_pipeline_v2_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews_v2" ADD CONSTRAINT "interviews_v2_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "hr_consultants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews_v2" ADD CONSTRAINT "interviews_v2_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_notifications" ADD CONSTRAINT "consultant_notifications_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "hr_consultants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_activity_logs" ADD CONSTRAINT "consultant_activity_logs_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "hr_consultants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
