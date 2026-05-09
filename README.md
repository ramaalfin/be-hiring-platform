# GetJob — Backend API

Platform rekrutmen modern dengan autentikasi passwordless, manajemen lowongan, ATS pipeline berbasis kanban, dan role-based access control.

**Status**: ✅ Production Ready | **Version**: 3.0.0 | **Last Updated**: May 2026

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Changelog](#-changelog)
3. [Tech Stack](#️-tech-stack)
4. [Project Structure](#-project-structure)
5. [Environment Setup](#-environment-setup)
6. [Database Setup](#️-database-setup)
7. [Email Configuration](#-email-configuration)
8. [API Documentation](#-api-documentation)
9. [Security](#-security)
10. [Deployment](#-deployment)
11. [Scripts](#-scripts)
12. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# 3. Setup database
npx prisma migrate dev
npm run seed  # Optional: buat admin + 10 jobs

# 4. Start server
npm run dev
```

Server berjalan di `http://localhost:5001`

### Production Build

```bash
npm run build
npm start
```

---

## 📝 Changelog

### v3.0.0 — May 2026 (Employer ATS Kanban)

**Fitur Baru**

- **Employer Role**: Role baru `EMPLOYER` terpisah dari `ADMIN` dan `CANDIDATE`. Employer hanya bisa mengakses job dan aplikasi milik mereka sendiri.
- **ATS Pipeline**: Status aplikasi diperluas menjadi 6 tahap — `APPLIED → SCREENING → INTERVIEW → OFFER → HIRED / REJECTED`. Transisi status divalidasi di backend (tidak bisa loncat sembarangan).
- **Status History**: Setiap perubahan status tersimpan sebagai audit trail yang immutable.
- **Notes per Aplikasi**: Employer bisa menambahkan catatan internal pada setiap aplikasi.
- **Job Search & Filter**: Endpoint publik untuk pencarian lowongan berdasarkan keyword, tipe pekerjaan, dan rentang gaji dengan pagination.
- **Employer Routes** (`/api/v1/employer`): Endpoint lengkap untuk manajemen job dan aplikasi khusus employer.
- **Input Validation Middleware**: `validateBody` dan `validateQuery` menggunakan Zod schema terpusat di `src/schemas/employer.schemas.ts`.
- **Employer Authorization Middleware**: `authorizeEmployerForJob` dan `authorizeEmployerForApplication` mencegah akses lintas employer.

**Perubahan Database**

- Tabel `User`: tambah nilai enum `EMPLOYER` pada kolom `role`
- Tabel `Job`: tambah kolom `employerId` (foreign key ke `User`)
- Tabel `Application`: ubah kolom `status` menjadi enum 6 nilai
- Tabel baru `ApplicationStatusHistory`: menyimpan riwayat perubahan status
- Tabel `Application`: tambah kolom `notes` (text, nullable)

---

### v2.0.0 — April 2026

- **Email Verification Middleware**: User wajib verifikasi email sebelum akses protected routes (`requireVerified`)
- **Database Seeder**: 1 admin (`admin@getjob.com` / `admin#123`) + 10 job postings siap pakai
- **Password Default System**: User baru via Magic Link mendapat password `User12345`, wajib diubah saat login pertama
- **Profile Management**: `PATCH /api/v1/user/profile` untuk update nama dan password
- **Enhanced Security**: Rate limiting 3-tier, IDOR protection, one-time verification codes, database indexes

---

### v1.0.0 — Initial Release

- Autentikasi tradisional (register, login, logout, refresh token)
- Magic Link login & register (passwordless)
- Forgot/reset password via email
- Role-based access control: `ADMIN` dan `CANDIDATE`
- Job management (CRUD) oleh Admin
- Application system: kandidat apply dengan upload foto/resume ke Cloudinary
- Email service: Gmail (dev) / Resend (prod)
- Rate limiting & security hardening

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT (access + refresh) + Cookies |
| Email | Nodemailer/Gmail (dev), Resend (prod) |
| File Upload | Multer + Cloudinary |
| Validation | Zod |
| Testing | Jest + Supertest |
| Deployment | Railway |

---

## 📂 Project Structure

```text
be-hiring-platform/
├── prisma/
│   ├── schema.prisma         # Database models
│   ├── seed.ts               # Database seeder
│   └── migrations/           # Migration history
├── src/
│   ├── constants/            # Environment variable wrappers & error codes
│   ├── controllers/          # Request handlers
│   ├── lib/                  # Prisma client, Cloudinary config
│   ├── middleware/
│   │   ├── authenticate.ts           # JWT verification
│   │   ├── authorizeRole.ts          # Role-based access
│   │   ├── authorizeEmployer.ts      # Employer ownership check (v3)
│   │   ├── requireVerified.ts        # Email verification check
│   │   ├── rateLimiter.ts            # 3-tier rate limiting
│   │   ├── validateInput.ts          # Zod body/query validation (v3)
│   │   └── errorHandler.ts           # Global error handler
│   ├── repositories/         # Database access layer (Prisma abstraction)
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── jobs.route.ts
│   │   ├── applications.route.ts
│   │   ├── user.route.ts
│   │   └── employer.route.ts         # Employer ATS routes (v3)
│   ├── schemas/
│   │   └── employer.schemas.ts       # Zod schemas untuk employer endpoints (v3)
│   ├── services/             # Business logic
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # Logger, error wrapper
│   └── index.ts              # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔧 Environment Setup

```bash
# Node Environment
NODE_ENV=development  # atau production

# Server
PORT=5001
APP_ORIGIN=http://localhost:3000  # URL frontend (untuk CORS)

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hiring

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email — Development (Gmail)
EMAIL_SERVICE=gmail
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Email — Production (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <noreply@yourdomain.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🗄️ Database Setup

```bash
# Jalankan migrasi
npx prisma migrate dev

# Seed data awal (opsional)
npm run seed
# → Admin: admin@getjob.com / admin#123
# → 10 job postings

# Buka Prisma Studio (GUI)
npx prisma studio  # http://localhost:5555
```

---

## 📧 Email Configuration

Backend otomatis memilih provider berdasarkan environment:

- **Development**: Gmail SMTP
- **Production**: Resend (HTTPS — menghindari blokir port SMTP di Railway)

**Setup Resend**:
1. Daftar di [resend.com](https://resend.com)
2. Buat API key
3. Tambahkan `RESEND_API_KEY` ke environment
4. Untuk testing: gunakan `onboarding@resend.dev`
5. Untuk production: verifikasi domain Anda

---

## 📚 API Documentation

### Base URL

```
http://localhost:5001/api/v1
```

### Authentication

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrasi tradisional | — |
| POST | `/auth/login` | Login dengan password | — |
| GET | `/auth/logout` | Logout | — |
| POST | `/auth/refresh` | Refresh access token | — |
| POST | `/auth/email/verify` | Verifikasi email | — |
| POST | `/auth/password/forgot` | Request reset password | — |
| POST | `/auth/password/reset` | Reset password | — |
| POST | `/auth/magic-login` | Request magic link login | — |
| GET | `/auth/magic-login/verify` | Verifikasi magic link login | — |
| POST | `/auth/magic-register` | Request magic link register | — |
| GET | `/auth/magic-register/verify` | Verifikasi magic link register | — |
| GET | `/auth/me` | Get profil user saat ini | ✅ |

### User

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/user` | Get profil | ✅ |
| PATCH | `/user/profile` | Update nama / password | ✅ |

### Jobs (Admin)

| Method | Endpoint | Deskripsi | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/jobs` | Semua lowongan (publik) | — | — |
| GET | `/jobs/search` | Cari lowongan (publik) | — | — |
| GET | `/jobs/:id` | Detail lowongan | — | — |
| GET | `/jobs/admin/:id` | Lowongan milik admin | ✅ | ADMIN |
| POST | `/jobs` | Buat lowongan | ✅ | ADMIN |
| PATCH | `/jobs/:id` | Update lowongan | ✅ | ADMIN |
| DELETE | `/jobs/:id` | Hapus lowongan | ✅ | ADMIN |

### Applications

| Method | Endpoint | Deskripsi | Auth | Role |
|--------|----------|-----------|------|------|
| POST | `/applications/:jobId/apply` | Apply lowongan | ✅ | CANDIDATE |
| GET | `/applications/admin/:jobId` | Aplikasi per job | ✅ | ADMIN |
| GET | `/applications/user/:userId` | Aplikasi milik kandidat | ✅ | CANDIDATE |
| GET | `/applications` | Semua aplikasi | ✅ | ADMIN |

### Employer (v3.0 — ATS)

| Method | Endpoint | Deskripsi | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/employer/jobs/search` | Cari lowongan (publik) | — | — |
| POST | `/employer/jobs` | Buat lowongan | ✅ | EMPLOYER |
| GET | `/employer/jobs` | Lowongan milik employer | ✅ | EMPLOYER |
| PATCH | `/employer/jobs/:jobId` | Update lowongan | ✅ | EMPLOYER |
| DELETE | `/employer/jobs/:jobId` | Hapus lowongan | ✅ | EMPLOYER |
| GET | `/employer/jobs/:jobId/applications` | Aplikasi per job (dikelompokkan per status) | ✅ | EMPLOYER |
| PATCH | `/employer/applications/:appId/status` | Update status aplikasi | ✅ | EMPLOYER |
| GET | `/employer/applications/:appId/history` | Riwayat status aplikasi | ✅ | EMPLOYER |
| PATCH | `/employer/applications/:appId/notes` | Tambah catatan aplikasi | ✅ | EMPLOYER |

#### ATS Status Transitions

```
APPLIED    → SCREENING, REJECTED
SCREENING  → INTERVIEW, REJECTED
INTERVIEW  → OFFER,     REJECTED
OFFER      → HIRED,     REJECTED
HIRED      → (terminal)
REJECTED   → (terminal)
```

Status default saat aplikasi dibuat: `APPLIED`. Transisi yang tidak valid akan ditolak dengan **HTTP 400 Bad Request**. Request body bisa menyertakan field `reason` (opsional) untuk mencatat alasan perubahan status.

**Catatan backward compatibility**: Kolom `employerId` di tabel `Job` bersifat nullable — job yang dibuat oleh ADMIN sebelum v3.0 tidak memiliki `employerId`.

### PATCH `/employer/applications/:appId/status`

Request body:
```json
{
  "status": "SCREENING",
  "reason": "Passed initial screening"  // opsional
}
```

Response sukses (200):
```json
{
  "success": true,
  "data": { "id": "...", "status": "SCREENING", "updatedAt": "..." },
  "message": "Application status updated"
}
```

Response error transisi tidak valid (400):
```json
{
  "success": false,
  "error": "Invalid status transition from APPLIED to HIRED"
}
```

---

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## 🔒 Security

### Rate Limiting (3-tier)

| Tier | Endpoint | Limit |
|------|----------|-------|
| Auth | `/auth/register`, `/auth/login` | 5 req / 15 menit |
| Strict | `/auth/magic-*`, `/auth/password/forgot` | 10 req / menit |
| General | Semua endpoint lain | 100 req / menit |

### Proteksi Lainnya

- **IDOR Protection**: Validasi kepemilikan resource di semua service
- **Email Verification**: Middleware `requireVerified` di semua protected routes
- **Employer Isolation**: `authorizeEmployerForJob` dan `authorizeEmployerForApplication` memastikan employer hanya akses data miliknya
- **Password Security**: Bcrypt hashing, default password system, forced change on first login
- **JWT**: Access token 15 menit, refresh token 30 hari, disimpan di HTTP-only cookie
- **Database Indexes**: Index pada kolom `createdBy`, `jobId`, `userId`, `expiresAt` — query 10x lebih cepat

---

## 🚢 Deployment

### Railway

```bash
# Deploy otomatis saat push ke main
git push origin main
```

Environment variables yang wajib diset di Railway dashboard:

```bash
NODE_ENV=production
DATABASE_URL=<railway-postgres-url>
APP_ORIGIN=<frontend-url>
PORT=5001
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <noreply@yourdomain.com>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

### Deployment Checklist

- [ ] Semua environment variables sudah diset
- [ ] Migrasi database sudah dijalankan
- [ ] Build TypeScript berhasil
- [ ] CORS dikonfigurasi untuk domain production
- [ ] Resend API key aktif
- [ ] Email sending sudah ditest
- [ ] Magic links berfungsi

---

## 📝 Scripts

```bash
npm run dev           # Development server (hot reload)
npm run build         # Build production (prisma generate + tsc)
npm start             # Jalankan production server
npm run seed          # Seed database
npm run test          # Jalankan semua test
npm run test:watch    # Test mode watch
npm run test:coverage # Test dengan coverage report
npx prisma studio     # Buka Prisma Studio (GUI)
npx prisma migrate dev # Jalankan migrasi
npx prisma generate   # Generate Prisma Client
```

---

## 🐛 Troubleshooting

### Build Error: `Cannot find module '/app/dist/index.js'`

Pastikan `typescript` dan `prisma` ada di `dependencies` (bukan hanya `devDependencies`), dan build command adalah:
```bash
npx prisma generate && tsc
```

### Email Tidak Terkirim: "Connection timeout"

Railway memblokir port SMTP (587/465). Gunakan Resend:
1. Tambahkan `RESEND_API_KEY` ke environment
2. Set `EMAIL_FROM` ke `onboarding@resend.dev` (untuk testing)

### CORS Error di Browser

1. Pastikan `APP_ORIGIN` diset ke URL frontend yang benar
2. Restart server setelah mengubah environment variable

### Magic Link: "Link expired or invalid"

- Link bersifat one-time use — minta link baru jika sudah dipakai
- Link expired setelah 30 menit
- Pastikan frontend menggunakan `useRef` untuk mencegah double-execution di React Strict Mode

### Seeder Error: "Email already in use"

Seeder menggunakan `upsert` — aman dijalankan berulang kali, admin yang sudah ada akan di-skip.

---

## 🗺️ Roadmap

Status saat ini: **MVP v3.0.0 selesai dan production-ready.**

| Phase | Nama | Status | Estimasi |
|-------|------|--------|----------|
| 1 | MVP Foundation (Auth, Jobs, Applications, Gesture) | ✅ Complete | — |
| 2 | Enhanced Security (2FA, audit logging, CSRF, security headers) | ⏳ Planned | 2–3 jam |
| 3 | Automated Testing & CI/CD (Jest, Playwright, GitHub Actions) | ⏳ Planned | 3–4 jam |
| 4 | Admin Dashboard & Analytics (kanban, bulk actions, CSV export) | ⏳ Planned | 3–4 jam |
| 5 | Candidate Portal Enhancements (saved jobs, notifikasi, withdrawal) | ⏳ Planned | 2–3 jam |
| 6 | Mobile Native Apps (React Native, push notifications, offline) | ⏳ Planned | 4–6 jam |
| 7 | ATS Integration (Workday, Greenhouse, Lever, webhook sync) | ⏳ Planned | 3–4 jam |
| 8 | AI-Powered Candidate Ranking (resume parsing, scoring) | ⏳ Planned | 4–5 jam |
| 9 | Video Interview Integration (Zoom, recording, transcript) | ⏳ Planned | 3–4 jam |
| 10 | Compliance & Data Privacy (GDPR, CCPA, data export/deletion) | ⏳ Planned | 2–3 jam |
| 11 | Performance Optimization (Redis caching, N+1 elimination, Lighthouse >90) | ⏳ Planned | 2–3 jam |
| 12 | Internationalization (5+ bahasa, RTL support) | ⏳ Planned | 2–3 jam |

**Fitur yang sengaja tidak diimplementasikan di v3.0** (out-of-scope): real-time sync via WebSocket, ElasticSearch, email notifikasi saat status berubah, AI matching, bulk status update, custom pipeline stages, hiring analytics, candidate messaging, interview scheduling, dan employer branding.

---

**GetJob Team — May 2026**
