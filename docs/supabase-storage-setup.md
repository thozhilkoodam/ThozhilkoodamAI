# Supabase Storage (Free Plan) + Secure Document Management Setup

This guide details the setup, configuration, security model, and API flows for **Step 5** of the Thozhil Koodam architecture.

---

## 1. Supabase Storage Setup & Private Buckets

The architecture uses the **Supabase Storage Free Plan** with four **PRIVATE** buckets. Public access is disabled for all document buckets to protect sensitive candidate and company information.

### Required Storage Buckets
1. **`candidate-resumes`**: Private bucket for candidate resumes (PDF, DOC, DOCX; max 10MB).
2. **`candidate-certificates`**: Private bucket for candidate educational & professional certificates (PDF, JPG, PNG; max 10MB).
3. **`profile-images`**: Private bucket for candidate profile images (JPG, PNG; max 5MB).
4. **`company-logos`**: Private bucket for company & employer logos (JPG, PNG, SVG; max 5MB).

---

## 2. Environment Variables & Security Constraints

The backend uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to administer private storage buckets securely.

### Backend `.env` Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Security Directives
- **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to client applications (Flutter, React, Next.js).
- **Never store secret keys in Git** or client bundles.
- If credentials are missing at runtime, the backend falls back cleanly using `SparkDisabledStorageRepository`.

---

## 3. Secure Object Key Design

Object storage paths are constructed strictly by the backend to prevent path traversal (`../`) and unauthorized object overwrites:

- `candidate-resumes`: `candidates/{candidateId}/resumes/{documentId}/{safeFileName}`
- `candidate-certificates`: `candidates/{candidateId}/certificates/{documentId}/{safeFileName}`
- `profile-images`: `users/{userId}/profile/{documentId}/{safeFileName}`
- `company-logos`: `companies/{companyId}/logo/{documentId}/{safeFileName}`

---

## 4. API Endpoints

All file operations are authenticated via JWT / Firebase Auth against `/api/v1/files`:

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/files/resume` | `POST` | Upload candidate resume (max 10MB, PDF/DOC/DOCX) |
| `/api/v1/files/certificate` | `POST` | Upload candidate certificate (max 10MB, PDF/JPG/PNG) |
| `/api/v1/files/profile-image` | `POST` | Upload user profile image (max 5MB, JPG/PNG) |
| `/api/v1/files/company-logo` | `POST` | Upload company logo (max 5MB, JPG/PNG/SVG) |
| `/api/v1/files/:documentId/metadata` | `GET` | Retrieve document metadata |
| `/api/v1/files/:documentId/download` | `GET` | Generate short-lived signed download URL (15 mins) |
| `/api/v1/files/:documentId` | `DELETE` | Delete storage object and metadata record |
| `/api/v1/files/:documentId/replace` | `PUT` | Atomic file replacement |

---

## 5. Security & Authorization Rules

1. **Authentication**: Every request is validated against the authenticated Firebase/JWT user session.
2. **File Validation**:
   - Filename sanitization strips dangerous characters and path traversal.
   - Magic byte inspection verifies file headers (%PDF, \x89PNG, \xFF\xD8\xFF, OLE CFBF, ZIP).
   - Executables (`.exe`, `.sh`, `.bat`), scripts, and HTML are rejected.
3. **Owner Isolation**:
   - Candidates may only upload, download, or delete their own documents.
   - Employers may only upload/manage their own company logos.
   - Admins have authorized access according to system rules.
4. **Signed URLs**:
   - Signed download URLs are short-lived (15 minutes / 900 seconds).
   - Generated only after verifying authorization.
   - Never stored permanently.

---

## 6. Testing Strategy

Unit and security tests verify:
- Authenticated candidate upload & unauthenticated rejection.
- Cross-candidate document access prohibition (403 Forbidden).
- Magic byte file signature validation & filename sanitization.
- Storage failure reconciliation and atomic replacement.
- Signed URL authorization & secret key leak prevention.
- Mocking Supabase Storage without requiring live production keys during CI/CD.
