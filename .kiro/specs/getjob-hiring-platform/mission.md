# GetJob Hiring Platform — Mission

## What We Build

**GetJob is a modern, full-stack hiring platform that enables employers to post job opportunities and candidates to discover, apply for, and track applications with passwordless authentication, role-based access control, and gesture-based document submission.**

### Target Audience

**Primary**: Mid-market and enterprise recruiters and HR teams seeking a modern, frictionless hiring workflow.

**Secondary**: Job candidates (professionals) seeking a streamlined, secure application experience with passwordless login and gesture-based interactions.

### Success Metrics

1. **Frictionless Authentication**: 95%+ of users complete magic-link login/signup without support tickets (passwordless reduces friction).
2. **Application Completion Rate**: 80%+ of candidates who start an application complete it (gesture-based submission reduces abandonment).
3. **Platform Uptime**: 99.5% availability in production (SLA compliance for enterprise customers).
4. **Time-to-Hire**: Average 40% reduction in hiring cycle time vs. traditional platforms (measured via admin dashboards).

---

## Core Value Propositions

### For Recruiters (Admin Role)
- **Job Posting**: Create and manage job listings with dynamic candidate requirements (e.g., mandatory photo, optional resume).
- **Application Review**: Centralized dashboard to view all applications for posted jobs, with candidate profiles and submission data.
- **Flexible Requirements**: Define which profile fields (photo, phone, documents) are mandatory vs. optional per job.

### For Candidates
- **Passwordless Access**: Magic-link login/signup eliminates password fatigue and reduces account lockouts.
- **Gesture-Based Submission**: Hand-pose recognition (TensorFlow.js + MediaPipe) allows candidates to submit photos/documents via webcam with a simple gesture (counting to 3).
- **Application Tracking**: View all submitted applications, their status, and feedback from recruiters.
- **Dynamic Forms**: Application forms adapt to recruiter requirements—no unnecessary fields.

---

## Technical Philosophy

- **Security First**: JWT-based authentication, bcrypt password hashing, email verification, rate limiting, IDOR protection.
- **Performance**: Optimized database queries with indexes, React Query caching, lazy-loaded components.
- **Accessibility**: WCAG 2.1 AA compliance via Radix UI primitives, semantic HTML, keyboard navigation.
- **Scalability**: Stateless backend (Express.js), cloud-ready (Railway/Vercel deployment), PostgreSQL with connection pooling.
- **Developer Experience**: TypeScript for type safety, Zod for runtime validation, clear layered architecture (routes → controllers → services → repositories).

---

## Competitive Differentiation

1. **Passwordless-First**: No password management overhead; magic links reduce support burden.
2. **Gesture Interaction**: Unique UX for document submission; reduces friction vs. traditional file uploads.
3. **Dynamic Requirements**: Recruiters define per-job requirements; candidates see only relevant fields.
4. **Modern Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS—fast, maintainable, developer-friendly.

---

## Out-of-Scope (Intentional Exclusions)

- **Video Interviews**: Not included; focus is on application submission, not interview scheduling.
- **AI-Powered Candidate Ranking**: Not included; recruiters manually review applications.
- **Bulk Email Campaigns**: Not included; focus is on 1:1 application feedback.
- **Integrations with ATS Systems**: Not included; GetJob is standalone (future phase).
- **Mobile Native Apps**: Not included; responsive web design covers mobile (future phase).

---

## Success Criteria (MVP)

- ✅ Passwordless authentication (magic link) works end-to-end.
- ✅ Recruiters can create jobs with dynamic requirements.
- ✅ Candidates can apply with gesture-based photo submission.
- ✅ Applications are stored and retrievable by both parties.
- ✅ Email verification and rate limiting prevent abuse.
- ✅ Deployment to Railway (backend) and Vercel (frontend) succeeds.
- ✅ No critical security vulnerabilities (OWASP Top 10 check).

---

## Maintenance & Support

- **Monitoring**: Error tracking (Sentry), uptime monitoring (UptimeRobot).
- **Logging**: Structured logs (Winston) for debugging and audit trails.
- **Backups**: Daily PostgreSQL backups (Railway managed).
- **Incident Response**: On-call rotation for production issues.

---

**Version**: 2.0.0 | **Last Updated**: May 2026 | **Status**: Production Ready
