# GetJob Hiring Platform — Tech Stack

## Runtime & Language

- **Node.js**: ≥20.x (LTS)
- **TypeScript**: 5.x (strict mode enabled)
- **Browser Target**: ES2020 (modern browsers; IE11 not supported)

---

## Backend (be-hiring-platform)

### Framework & Core
- **Express.js**: 4.21.x (HTTP server, routing, middleware)
- **TypeScript**: 5.x (compiled to ES2020)

### Database & ORM
- **PostgreSQL**: 14+ (primary data store)
- **Prisma**: 6.18.x (ORM, migrations, type-safe queries)
- **Connection Pooling**: PgBouncer (Railway managed)

### Authentication & Security
- **JWT (JSON Web Tokens)**: jsonwebtoken 9.x
  - Access token: 15 minutes
  - Refresh token: 30 days
  - Stored in secure HTTP-only cookies
- **Password Hashing**: bcrypt 5.x (salt rounds: 10)
- **Rate Limiting**: express-rate-limit (3-tier: auth, sensitive, general)
- **CORS**: cors 2.8.x (origin whitelist: localhost, vercel.app, railway.app)
- **Cookie Parsing**: cookie-parser 1.4.x

### Email & Notifications
- **Primary (Production)**: Resend 4.x (HTTPS-based, Railway-compatible)
- **Fallback (Development)**: Nodemailer 7.x + Gmail SMTP
- **Email Templates**: HTML templates with Resend/Nodemailer integration

### File Uploads & Storage
- **Multer**: 2.0.x (multipart form data parsing)
- **Cloudinary**: 2.8.x (image hosting, CDN, transformations)
- **Supported Formats**: JPEG, PNG, PDF (max 10MB per file)

### Validation & Serialization
- **Zod**: 3.24.x (runtime schema validation, type inference)
- **Custom Validators**: Email format, password strength, phone number

### Utilities
- **dotenv**: 16.4.x (environment variable management)
- **Winston** (optional, for structured logging): Not currently used; using console.log with custom logger

### Testing & Quality
- **No automated tests** (current state; future phase)
- **Manual QA**: Postman collections for API testing
- **Type Checking**: TypeScript strict mode

---

## Frontend (fe-hiring-platform)

### Framework & Core
- **Next.js**: 14.2.x (App Router, SSR, static generation)
- **React**: 18.x (component library, hooks)
- **TypeScript**: 5.x (strict mode enabled)

### Styling & UI
- **Tailwind CSS**: 3.4.x (utility-first CSS)
- **PostCSS**: 8.x (CSS processing)
- **Shadcn/UI**: Latest (pre-built, accessible components)
- **Radix UI**: Latest (accessible primitives: Dialog, Dropdown, Checkbox, etc.)
- **Lucide React**: Latest (icon library)
- **class-variance-authority**: 0.7.x (component variant management)
- **clsx**: 2.1.x (conditional className merging)
- **tailwind-merge**: 3.0.x (Tailwind class conflict resolution)

### State Management
- **TanStack React Query**: 5.59.x (server state, caching, synchronization)
- **Zustand**: 5.0.x (global client state, lightweight alternative to Redux)
- **React Context**: Built-in (auth context, theme context, query provider)

### Forms & Validation
- **React Hook Form**: 7.54.x (performant form handling)
- **Zod**: 3.23.x (runtime schema validation, matches backend)
- **@hookform/resolvers**: 4.1.x (Zod integration with React Hook Form)

### Authentication & Security
- **JWT Decode**: 4.0.x (client-side token parsing, no verification)
- **jsonwebtoken**: 9.x (token generation for testing; not used in production)
- **JS Cookie**: 3.0.x (secure cookie management)
- **Axios**: 1.7.x (HTTP client with interceptors for token refresh)

### AI & Gesture Recognition
- **TensorFlow.js**: 4.22.x (ML in browser)
- **@tensorflow-models/handpose**: 0.1.x (hand pose detection)
- **@tensorflow/tfjs-backend-webgl**: 4.22.x (GPU acceleration)
- **@tensorflow/tfjs-converter**: 4.22.x (model loading)
- **@tensorflow/tfjs-core**: 4.22.x (core ML ops)
- **MediaPipe Hands**: 0.4.x (hand tracking, alternative to TensorFlow)
- **@mediapipe/camera_utils**: 0.3.x (webcam integration)
- **react-webcam**: 7.2.x (React wrapper for webcam access)

### Utilities & Helpers
- **date-fns**: 4.1.x (date formatting and manipulation)
- **input-otp**: 1.4.x (OTP input component)
- **ua-parser-js**: 1.0.x (user agent parsing for device detection)
- **vaul**: 1.1.x (drawer/modal component)
- **next-themes**: 0.4.x (dark mode support)

### Development Tools
- **TypeScript**: 5.x (type checking)
- **ESLint**: Built-in Next.js linting
- **Prettier**: Not configured (future phase)

### Testing & Quality
- **No automated tests** (current state; future phase)
- **Manual QA**: Browser testing, gesture recognition testing
- **Type Checking**: TypeScript strict mode

---

## Deployment & Infrastructure

### Backend Deployment
- **Platform**: Railway.app
- **Build**: Nixpacks (automatic Node.js detection)
- **Start Command**: `npm start` (runs compiled dist/index.js)
- **Environment**: Production (NODE_ENV=production)
- **Database**: Railway PostgreSQL (managed)
- **Monitoring**: Railway logs, error tracking (optional Sentry)

### Frontend Deployment
- **Platform**: Vercel
- **Build**: Next.js build (`npm run build`)
- **Start Command**: `npm start` (Next.js production server)
- **Environment**: Production
- **CDN**: Vercel Edge Network (automatic)
- **Monitoring**: Vercel Analytics, error tracking (optional Sentry)

### Environment Variables

**Backend (.env)**:
```
NODE_ENV=production
PORT=5001
APP_ORIGIN=https://fe-hiring-platform.vercel.app
DATABASE_URL=postgresql://user:pass@host:5432/hiring
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <onboarding@resend.dev>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## Database Schema

### Core Models
1. **User**: Authentication, profile, role (ADMIN/CANDIDATE)
2. **Session**: JWT session tracking, expiration
3. **VerificationCode**: Email verification, magic links, password resets
4. **Job**: Job postings with dynamic requirements
5. **Application**: Candidate applications with resume data

### Indexes (Performance)
- `Job(createdBy, createdAt)` — Admin job queries
- `Session(userId, expiresAt)` — Session cleanup
- `Application(jobId, userId, createdAt)` — Application queries
- `VerificationCode(userId, type, expiresAt)` — Code lookups

---

## External Services & APIs

### Email Delivery
- **Resend** (production): HTTPS-based, 3,000 emails/month free tier
- **Gmail SMTP** (development): Fallback for local testing

### Image Hosting & CDN
- **Cloudinary**: Image uploads, transformations, CDN delivery

### Monitoring & Analytics (Optional)
- **Sentry**: Error tracking and performance monitoring
- **UptimeRobot**: Uptime monitoring and alerts
- **Vercel Analytics**: Frontend performance metrics
- **Railway Logs**: Backend logs and debugging

---

## Development Workflow

### Local Development
```bash
# Backend
npm install
npm run dev  # ts-node-dev with hot reload

# Frontend
npm install
npm run dev  # Next.js dev server on :3000
```

### Build & Test
```bash
# Backend
npm run build  # TypeScript → dist/
npm start      # Run compiled code

# Frontend
npm run build  # Next.js build
npm start      # Production server
```

### Database Management
```bash
npx prisma migrate dev    # Create and run migrations
npx prisma studio         # GUI for database
npm run seed              # Populate test data
```

---

## Security & Compliance

### OWASP Top 10 Mitigations
- **A01: Broken Access Control**: RBAC middleware, IDOR checks, ownership validation
- **A02: Cryptographic Failures**: bcrypt hashing, HTTPS-only, secure cookies
- **A03: Injection**: Parameterized queries (Prisma), Zod validation
- **A04: Insecure Design**: Rate limiting, email verification, 2FA support
- **A05: Security Misconfiguration**: Environment variables, CORS whitelist, secure headers
- **A06: Vulnerable Components**: Dependency updates, npm audit
- **A07: Authentication Failures**: JWT + refresh tokens, magic links, password reset
- **A08: Software & Data Integrity**: Signed cookies, HTTPS
- **A09: Logging & Monitoring**: Request logging, error tracking
- **A10: SSRF**: No external API calls to user-provided URLs

### Data Protection
- **PII**: Encrypted in transit (HTTPS), at rest (PostgreSQL encryption optional)
- **Passwords**: Bcrypt hashing, never logged
- **Tokens**: HTTP-only cookies, short expiration
- **Audit Trail**: Request logging with timestamps and user IDs

---

## Performance Targets

- **Backend API Response**: <200ms (p95) for typical queries
- **Frontend Page Load**: <3s (Lighthouse target)
- **Database Query**: <50ms (p95) with indexes
- **Image Upload**: <5s for 10MB file to Cloudinary
- **Gesture Recognition**: <500ms per hand pose detection

---

## Scalability Considerations

- **Stateless Backend**: Horizontal scaling via Railway replicas
- **Database**: Connection pooling (PgBouncer), read replicas (future)
- **Frontend**: CDN via Vercel, static generation where possible
- **File Storage**: Cloudinary handles scaling
- **Email**: Resend handles queue and retry logic

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | May 2026 | Email verification, magic links, password management, rate limiting, database indexes |
| 1.0.0 | Apr 2026 | Initial MVP: auth, jobs, applications, gesture submission |

---

**Last Updated**: May 2026 | **Status**: Production Ready
