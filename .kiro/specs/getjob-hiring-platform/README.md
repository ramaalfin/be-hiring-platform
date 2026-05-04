# GetJob Hiring Platform — Specification Package

## Overview

This is the authoritative specification package for the **GetJob Hiring Platform** — a modern, full-stack hiring platform enabling employers to post jobs and candidates to apply with passwordless authentication and gesture-based document submission.

**Status**: ✅ Production Ready (v2.0.0) | **Last Updated**: May 2026

---

## Specification Documents

### 1. **mission.md** — What We Build
- **Purpose**: Define the product vision, target audience, and success metrics
- **Contents**: 
  - What GetJob is and does
  - Primary and secondary audiences
  - Success metrics (frictionless auth, application completion, uptime, time-to-hire)
  - Core value propositions for recruiters and candidates
  - Technical philosophy and competitive differentiation
  - Out-of-scope items (intentional exclusions)
  - MVP success criteria

**Use When**: Onboarding new team members, communicating with stakeholders, making product decisions

---

### 2. **tech-stack.md** — How We Build It
- **Purpose**: Document all technologies, frameworks, and infrastructure
- **Contents**:
  - Runtime and language versions (Node.js 20+, TypeScript 5.x)
  - Backend stack (Express.js, Prisma, PostgreSQL, JWT, bcrypt, Resend, Cloudinary)
  - Frontend stack (Next.js 14, React 18, Tailwind CSS, TensorFlow.js, MediaPipe)
  - Deployment platforms (Railway, Vercel)
  - External services (Resend, Cloudinary, optional Sentry)
  - Database schema and indexes
  - Environment variables
  - Security and compliance measures
  - Performance targets
  - Scalability considerations

**Use When**: Setting up development environment, deploying to production, evaluating technology choices, onboarding developers

---

### 3. **roadmap.md** — What We Build Next
- **Purpose**: Define phases of development with clear deliverables and validation gates
- **Contents**:
  - Phase 1: MVP Foundation (✅ COMPLETE)
  - Phase 2: Enhanced Security & Compliance (⏳ PLANNED)
  - Phase 3: Automated Testing & CI/CD (⏳ PLANNED)
  - Phase 4: Admin Dashboard & Analytics (⏳ PLANNED)
  - Phase 5: Candidate Portal Enhancements (⏳ PLANNED)
  - Phase 6: Mobile Native Apps (⏳ PLANNED)
  - Phase 7: ATS Integration (⏳ PLANNED)
  - Phase 8: AI-Powered Candidate Ranking (⏳ PLANNED)
  - Phase 9: Video Interview Integration (⏳ PLANNED)
  - Phase 10: Compliance & Data Privacy (⏳ PLANNED)
  - Phase 11: Performance Optimization (⏳ PLANNED)
  - Phase 12: Internationalization (⏳ PLANNED)
  - Backlog (Future Consideration)

**Use When**: Planning sprints, prioritizing features, communicating timeline to stakeholders, managing expectations

---

### 4. **requirements.md** — What Must Be Built
- **Purpose**: Specify all functional and non-functional requirements using RFC 2119 keywords
- **Contents**:
  - Authentication & Authorization (magic links, JWT, RBAC, IDOR protection)
  - User Management (profile, email verification, account deletion)
  - Job Management (create, view, update, delete, search, filter)
  - Application Management (submit, track, update status, withdraw)
  - Email & Notifications (delivery, verification, magic links, status updates)
  - Security & Rate Limiting (auth limits, sensitive limits, general limits)
  - File Uploads & Storage (Cloudinary integration)
  - Data Validation & Error Handling (Zod schemas, centralized error handling)
  - Performance & Scalability (database indexes, connection pooling, API response time)
  - Accessibility & Compliance (WCAG 2.1 AA, GDPR)
  - Deployment & Operations (Railway, Vercel, monitoring, logging)
  - Non-Functional Requirements (reliability, maintainability)

**Use When**: Writing code, reviewing pull requests, testing features, ensuring compliance

---

### 5. **scenarios.md** — How We Verify It Works
- **Purpose**: Define acceptance scenarios using Gherkin-style GIVEN/WHEN/THEN format
- **Contents**:
  - Authentication scenarios (magic link, password reset, token refresh, logout)
  - Job management scenarios (create, view, update, delete, search, filter)
  - Application scenarios (apply, gesture capture, track, update status, withdraw)
  - Email scenarios (delivery, verification, magic links, status updates)
  - Security scenarios (rate limiting, password hashing, password strength)
  - Performance scenarios (database queries, API response time)
  - Accessibility scenarios (keyboard navigation)
  - Data privacy scenarios (GDPR compliance)

**Use When**: Writing tests, performing manual QA, validating features, documenting expected behavior

---

### 6. **validation.md** — How We Know It's Done
- **Purpose**: Define validation criteria, test coverage, and sign-off requirements
- **Contents**:
  - MVP validation checklist (functionality, security, performance, deployment)
  - Automated test coverage (unit, integration, E2E)
  - Manual QA checklist (browser compatibility, device testing, user flows, error handling)
  - Security validation (OWASP Top 10, penetration testing)
  - Performance validation (API response time, database performance, load testing)
  - Deployment validation (backend, frontend, database)
  - Monitoring & alerting (uptime, errors, performance, security)
  - Sign-off criteria (development, QA, security, product teams)
  - Post-deployment validation (day 1, week 1, month 1)
  - Definition of Done (per feature)

**Use When**: Planning QA, setting up CI/CD, deploying to production, monitoring in production

---

### 7. **out-of-scope.md** — What We Don't Build (Yet)
- **Purpose**: Explicitly list excluded features and explain why
- **Contents**:
  - Video interviews (deferred to Phase 9)
  - AI-powered candidate ranking (deferred to Phase 8)
  - Mobile native apps (deferred to Phase 6)
  - ATS integration (deferred to Phase 7)
  - Bulk email campaigns (deferred to Phase 5)
  - 2FA (deferred to Phase 2)
  - Advanced analytics (deferred to Phase 4)
  - Candidate recommendations (deferred to Phase 5)
  - Saved jobs & alerts (deferred to Phase 5)
  - Recruiter collaboration (deferred to Phase 4)
  - Candidate messaging (deferred to Phase 5)
  - Blockchain credentials (backlog)
  - White-label solution (backlog)
  - Webhook API (backlog)
  - GraphQL API (backlog)
  - Gamification (backlog)
  - Freelance recruiter marketplace (backlog)
  - Internationalization Phase 1 (deferred to Phase 12)
  - Compliance Phase 1 (deferred to Phase 10)
  - Performance optimization Phase 1 (deferred to Phase 11)

**Use When**: Managing scope, communicating with stakeholders, preventing scope creep, planning future phases

---

## How to Use This Specification

### For Developers

1. **Start Here**: Read `mission.md` to understand the product vision
2. **Setup**: Follow `tech-stack.md` to set up your development environment
3. **Implement**: Use `requirements.md` to understand what to build
4. **Test**: Use `scenarios.md` to write tests and validate your implementation
5. **Verify**: Use `validation.md` to ensure your code meets quality standards
6. **Deploy**: Follow `tech-stack.md` deployment section to deploy to production

### For QA/Testers

1. **Understand**: Read `mission.md` and `requirements.md` to understand the product
2. **Test**: Use `scenarios.md` to write manual and automated tests
3. **Validate**: Use `validation.md` to create test plans and checklists
4. **Report**: Document any issues and link them to requirements

### For Product Managers

1. **Vision**: Read `mission.md` to understand the product vision
2. **Roadmap**: Review `roadmap.md` to understand planned phases
3. **Scope**: Review `out-of-scope.md` to understand what's excluded
4. **Communicate**: Use these documents to communicate with stakeholders

### For Architects

1. **Design**: Read `tech-stack.md` to understand the technology choices
2. **Requirements**: Read `requirements.md` to understand non-functional requirements
3. **Validation**: Read `validation.md` to understand performance and security targets
4. **Scale**: Review `tech-stack.md` scalability section for future growth

---

## Key Metrics & Targets

### Success Metrics (Mission)
- Frictionless Authentication: 95%+ of users complete magic-link login without support
- Application Completion Rate: 80%+ of candidates who start an application complete it
- Platform Uptime: 99.5% availability in production
- Time-to-Hire: 40% reduction vs. traditional platforms

### Performance Targets (Tech Stack)
- Backend API Response: <200ms (p95)
- Frontend Page Load: <3s
- Database Query: <50ms (p95)
- Image Upload: <5s for 10MB file
- Gesture Recognition: <500ms per hand pose detection

### Test Coverage (Validation)
- Unit Tests: >80% for critical paths
- Integration Tests: All critical flows
- E2E Tests: All user journeys
- Manual QA: All browsers, devices, accessibility

### Security Targets (Requirements)
- OWASP Top 10: No critical issues
- Rate Limiting: 5 attempts per 15 minutes (auth), 10 per minute (sensitive), 100 per minute (general)
- Password Hashing: bcrypt with 10 salt rounds
- Token Security: HTTP-only cookies, 15-minute access token, 30-day refresh token

---

## Document Maintenance

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | May 2026 | Email verification, magic links, password management, rate limiting, database indexes |
| 1.0.0 | Apr 2026 | Initial MVP: auth, jobs, applications, gesture submission |

### Update Process

1. **Change Request**: Submit change request with rationale
2. **Review**: Review with product, engineering, and QA teams
3. **Update**: Update relevant specification documents
4. **Communicate**: Communicate changes to all stakeholders
5. **Version**: Increment version number and update date

### Document Owners

- **mission.md**: Product Manager
- **tech-stack.md**: Tech Lead / Architect
- **roadmap.md**: Product Manager
- **requirements.md**: Product Manager + Tech Lead
- **scenarios.md**: QA Lead
- **validation.md**: QA Lead
- **out-of-scope.md**: Product Manager

---

## Quick Reference

### Critical Paths

**User Authentication**
- Magic Link Login: `mission.md` → `requirements.md` (REQ-AUTH-001) → `scenarios.md` (AUTH-001) → `validation.md` (Auth tests)
- Traditional Login: `requirements.md` (REQ-AUTH-003) → `scenarios.md` (AUTH-003) → `validation.md` (Auth tests)

**Job Management**
- Create Job: `requirements.md` (REQ-JOB-001) → `scenarios.md` (JOB-001) → `validation.md` (Job tests)
- View Jobs: `requirements.md` (REQ-JOB-005) → `scenarios.md` (JOB-005) → `validation.md` (Job tests)

**Application Workflow**
- Apply for Job: `requirements.md` (REQ-APP-001) → `scenarios.md` (APP-001) → `validation.md` (App tests)
- Gesture Capture: `requirements.md` (REQ-APP-002) → `scenarios.md` (APP-002) → `validation.md` (Gesture tests)

**Security**
- Rate Limiting: `requirements.md` (REQ-SEC-001) → `scenarios.md` (SEC-001) → `validation.md` (Security tests)
- IDOR Protection: `requirements.md` (REQ-AUTH-011) → `scenarios.md` (AUTH-011) → `validation.md` (Security tests)

---

## Support & Questions

### For Questions About...

- **Product Vision**: See `mission.md`
- **Technology Choices**: See `tech-stack.md`
- **What to Build**: See `requirements.md`
- **How to Test**: See `scenarios.md` and `validation.md`
- **Future Plans**: See `roadmap.md`
- **What's Not Included**: See `out-of-scope.md`

### Escalation Path

1. **Question**: Check relevant specification document
2. **Clarification**: Ask team lead or product manager
3. **Change**: Submit change request following update process
4. **Documentation**: Update specification and communicate changes

---

## Compliance & Governance

### Specification Governance

- **Authority**: Product Manager (final decision on requirements)
- **Review**: Tech Lead (technical feasibility), QA Lead (testability)
- **Approval**: Product Manager + Tech Lead + QA Lead
- **Communication**: All changes communicated to team within 24 hours

### Specification Compliance

- **Developers**: MUST follow requirements.md when implementing features
- **QA**: MUST follow scenarios.md and validation.md when testing
- **Product**: MUST follow mission.md and roadmap.md when communicating
- **Architects**: MUST follow tech-stack.md when making technology decisions

### Specification Violations

- **Minor**: Document in issue tracker, fix in next sprint
- **Major**: Escalate to product manager, discuss in team meeting
- **Critical**: Halt work, convene emergency meeting, update specification

---

## Related Documents

- **Backend Repository**: `be-hiring-platform/`
- **Frontend Repository**: `fe-hiring-platform/`
- **Database Schema**: `be-hiring-platform/prisma/schema.prisma`
- **API Documentation**: `be-hiring-platform/README.md`
- **Frontend Documentation**: `fe-hiring-platform/README.md`

---

**Last Updated**: May 2026 | **Status**: Production Ready | **Version**: 2.0.0

For questions or updates, contact the Product Manager or Tech Lead.
