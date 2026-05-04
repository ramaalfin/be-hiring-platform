# GetJob Hiring Platform — Out-of-Scope Items

## Overview

This document explicitly lists features, enhancements, and integrations that are **intentionally excluded** from the MVP and current roadmap. For each item, we explain why it is excluded and when it might be reconsidered.

---

## Explicitly Out-of-Scope (MVP)

### 1. Video Interviews

**What**: Built-in video interview scheduling, recording, and transcription.

**Why Excluded**:
- **Scope Creep**: Video adds significant complexity (Zoom/Whereby integration, recording storage, transcription).
- **Time Constraint**: MVP timeline is 2–3 weeks; video would add 1–2 weeks.
- **User Need**: Recruiters can use external tools (Zoom, Google Meet) for interviews; GetJob focuses on application submission.
- **Cost**: Video recording and transcription services add infrastructure costs.

**When Reconsidered**: Phase 9 (Video Interview Integration) — planned for Q3 2026 if user demand is high.

**Workaround**: Recruiters can schedule interviews via email or external calendar tools; GetJob provides application data to inform interview decisions.

---

### 2. AI-Powered Candidate Ranking

**What**: Machine learning model to score and rank candidates based on job requirements.

**Why Excluded**:
- **Complexity**: Requires ML model training, feature engineering, and fairness audits.
- **Data Dependency**: Needs historical hiring data to train; MVP has no historical data.
- **Bias Risk**: ML models can perpetuate hiring bias; requires careful validation and fairness testing.
- **Time Constraint**: ML implementation would add 2–3 weeks.

**When Reconsidered**: Phase 8 (AI-Powered Candidate Ranking) — planned for Q3 2026 after sufficient historical data is collected.

**Workaround**: Recruiters manually review applications; GetJob provides clear application data to support decision-making.

---

### 3. Mobile Native Apps (iOS/Android)

**What**: Native iOS and Android applications with offline support and push notifications.

**Why Excluded**:
- **Platform Maintenance**: Native apps require separate codebases (Swift, Kotlin) and platform-specific testing.
- **Time Constraint**: Native development would add 3–4 weeks per platform.
- **Responsive Web**: Next.js frontend is fully responsive; mobile web covers 95% of use cases.
- **App Store Approval**: iOS/Android app store approval adds 1–2 weeks per release cycle.

**When Reconsidered**: Phase 6 (Mobile Native Apps) — planned for Q4 2026 if mobile usage exceeds 40% of traffic.

**Workaround**: Responsive web design works on all devices; users can add web app to home screen (PWA).

---

### 4. ATS Integration (Workday, Greenhouse, Lever)

**What**: Bidirectional sync with popular Applicant Tracking Systems.

**Why Excluded**:
- **Complexity**: Each ATS has different API, authentication, and data models.
- **Maintenance Burden**: ATS APIs change frequently; integration requires ongoing maintenance.
- **Time Constraint**: ATS integration would add 2–3 weeks per system.
- **User Need**: MVP users are small-to-mid-market; most don't use ATS yet.

**When Reconsidered**: Phase 7 (ATS Integration) — planned for Q3 2026 after MVP is stable and enterprise customers request it.

**Workaround**: Recruiters can export applications to CSV and import into their ATS manually.

---

### 5. Bulk Email Campaigns

**What**: Send marketing emails to candidates, job recommendations, or recruiter newsletters.

**Why Excluded**:
- **Compliance Risk**: Email marketing requires GDPR/CAN-SPAM compliance, unsubscribe management, and consent tracking.
- **Scope Creep**: Marketing features are outside core hiring workflow.
- **Time Constraint**: Email campaign builder would add 1–2 weeks.
- **User Need**: MVP focuses on application workflow, not marketing.

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026 if user demand is high.

**Workaround**: Recruiters can use external email marketing tools (Mailchimp, Brevo) to send campaigns.

---

### 6. Two-Factor Authentication (2FA)

**What**: Email or SMS-based 2FA for enhanced account security.

**Why Excluded**:
- **Complexity**: Requires OTP generation, delivery, and verification logic.
- **Time Constraint**: 2FA would add 1 week.
- **User Friction**: 2FA adds login friction; magic links already provide strong security.
- **MVP Priority**: Magic links are sufficient for MVP; 2FA is nice-to-have.

**When Reconsidered**: Phase 2 (Enhanced Security & Compliance) — planned for Q2 2026 for enterprise customers.

**Workaround**: Magic links provide passwordless security; users can use password managers for additional security.

---

### 7. Advanced Analytics & Reporting

**What**: Dashboards showing hiring funnel, time-to-hire, recruiter performance, candidate source analysis.

**Why Excluded**:
- **Complexity**: Requires data warehouse, ETL pipeline, and BI tool integration.
- **Time Constraint**: Analytics would add 2–3 weeks.
- **MVP Priority**: Core hiring workflow is more important than analytics.
- **User Need**: MVP users need basic job/application management; advanced analytics are secondary.

**When Reconsidered**: Phase 4 (Admin Dashboard & Analytics) — planned for Q2 2026 after MVP is stable.

**Workaround**: Recruiters can export data to CSV and analyze in Excel or Google Sheets.

---

### 8. Candidate Recommendations & Job Matching

**What**: Recommend jobs to candidates based on profile, skills, and preferences.

**Why Excluded**:
- **Complexity**: Requires recommendation algorithm, user profiling, and preference tracking.
- **Time Constraint**: Recommendation engine would add 2–3 weeks.
- **Data Dependency**: Needs user behavior data to train; MVP has no historical data.
- **MVP Priority**: Candidates can browse and search jobs; recommendations are nice-to-have.

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026 after sufficient user data is collected.

**Workaround**: Candidates can search and filter jobs manually; job list is sorted by creation date.

---

### 9. Saved Jobs & Job Alerts

**What**: Allow candidates to save jobs for later and receive email alerts for new jobs matching their criteria.

**Why Excluded**:
- **Complexity**: Requires saved job storage, email alert scheduling, and preference management.
- **Time Constraint**: Saved jobs would add 1 week.
- **MVP Priority**: Core application workflow is more important.
- **User Need**: Candidates can apply immediately; saved jobs are nice-to-have.

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026.

**Workaround**: Candidates can bookmark jobs in their browser or apply immediately.

---

### 10. Recruiter Collaboration & Comments

**What**: Allow multiple recruiters to collaborate on applications, leave comments, and share feedback.

**Why Excluded**:
- **Complexity**: Requires real-time collaboration, comment threading, and notification system.
- **Time Constraint**: Collaboration features would add 2–3 weeks.
- **MVP Priority**: Single recruiter per job is sufficient for MVP.
- **User Need**: MVP users are small teams; collaboration is secondary.

**When Reconsidered**: Phase 4 (Admin Dashboard & Analytics) — planned for Q2 2026 for larger teams.

**Workaround**: Recruiters can communicate via email or Slack; GetJob provides application data for discussion.

---

### 11. Candidate Messaging & In-App Chat

**What**: Direct messaging between recruiters and candidates within the platform.

**Why Excluded**:
- **Complexity**: Requires real-time messaging, notification system, and message storage.
- **Time Constraint**: Messaging would add 2–3 weeks.
- **MVP Priority**: Email is sufficient for MVP communication.
- **User Need**: Recruiters and candidates can use email or external tools (Slack, WhatsApp).

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026 if user demand is high.

**Workaround**: Recruiters and candidates communicate via email; GetJob provides contact information.

---

### 12. Blockchain-Based Credentials

**What**: Immutable, verifiable hiring records stored on blockchain.

**Why Excluded**:
- **Complexity**: Requires blockchain integration, smart contracts, and wallet management.
- **Time Constraint**: Blockchain would add 3–4 weeks.
- **User Need**: No user demand for blockchain; traditional database is sufficient.
- **Cost**: Blockchain infrastructure adds significant costs.
- **Regulatory Uncertainty**: Blockchain regulations are still evolving.

**When Reconsidered**: Backlog (Future Consideration) — only if user demand emerges and regulatory clarity improves.

**Workaround**: Traditional database provides immutable audit logs; credentials are stored as JSON.

---

### 13. White-Label Solution

**What**: Customizable branding, domain, and UI for enterprise customers.

**Why Excluded**:
- **Complexity**: Requires multi-tenant architecture, theme engine, and custom domain support.
- **Time Constraint**: White-label would add 3–4 weeks.
- **MVP Priority**: Single-brand MVP is sufficient.
- **User Need**: MVP users don't need white-label; enterprise customers might.

**When Reconsidered**: Backlog (Future Consideration) — planned for Q4 2026 if enterprise customers request it.

**Workaround**: Recruiters can use GetJob branding; custom branding can be added later.

---

### 14. Webhook API & Third-Party Integrations

**What**: Webhooks for real-time events (application submitted, status changed) and third-party integrations (Slack, Teams, Zapier).

**Why Excluded**:
- **Complexity**: Requires webhook infrastructure, event queuing, and retry logic.
- **Time Constraint**: Webhooks would add 2–3 weeks.
- **MVP Priority**: Core hiring workflow is more important.
- **User Need**: MVP users don't need webhooks; power users might.

**When Reconsidered**: Backlog (Future Consideration) — planned for Q3 2026 if user demand is high.

**Workaround**: Recruiters can check GetJob dashboard for updates; email notifications are sent for key events.

---

### 15. GraphQL API

**What**: GraphQL API as alternative to REST API for more flexible queries.

**Why Excluded**:
- **Complexity**: Requires GraphQL schema, resolver implementation, and query optimization.
- **Time Constraint**: GraphQL would add 1–2 weeks.
- **MVP Priority**: REST API is sufficient for MVP.
- **User Need**: MVP users don't need GraphQL; power users might.

**When Reconsidered**: Backlog (Future Consideration) — planned for Q4 2026 if user demand is high.

**Workaround**: REST API provides all necessary endpoints; clients can use REST for MVP.

---

### 16. Gamification (Badges, Leaderboards)

**What**: Badges, leaderboards, and achievement system to gamify the hiring process.

**Why Excluded**:
- **Complexity**: Requires achievement tracking, leaderboard calculation, and UI components.
- **Time Constraint**: Gamification would add 1–2 weeks.
- **MVP Priority**: Core hiring workflow is more important.
- **User Need**: No user demand for gamification; focus is on hiring efficiency.

**When Reconsidered**: Backlog (Future Consideration) — only if user feedback suggests engagement issues.

**Workaround**: Recruiters can track their own performance manually; GetJob provides data for analysis.

---

### 17. Marketplace for Freelance Recruiters

**What**: Platform for freelance recruiters to offer services, bid on jobs, and earn commissions.

**Why Excluded**:
- **Complexity**: Requires marketplace infrastructure, payment processing, and dispute resolution.
- **Time Constraint**: Marketplace would add 4–6 weeks.
- **MVP Priority**: Direct hiring is sufficient for MVP.
- **User Need**: MVP users are employers and candidates; freelance recruiters are secondary.
- **Regulatory**: Marketplace requires compliance with labor laws and payment regulations.

**When Reconsidered**: Backlog (Future Consideration) — only if business model shifts to marketplace.

**Workaround**: Recruiters can use GetJob for direct hiring; freelance recruiters can use external platforms.

---

### 18. Internationalization (i18n) — Phase 1

**What**: Multi-language support (English, Spanish, French, German, Mandarin) in MVP.

**Why Excluded**:
- **Complexity**: Requires translation management, locale-specific formatting, and RTL support.
- **Time Constraint**: i18n would add 1–2 weeks.
- **MVP Priority**: English-only MVP is sufficient for launch.
- **User Need**: MVP users are primarily English-speaking; international expansion is secondary.

**When Reconsidered**: Phase 12 (Internationalization) — planned for Q4 2026 after MVP is stable.

**Workaround**: English-only MVP; translations can be added later.

---

### 19. Compliance & Data Privacy — Phase 1

**What**: GDPR, CCPA, and SOC 2 compliance in MVP.

**Why Excluded**:
- **Complexity**: Requires data export, deletion, consent management, and audit logging.
- **Time Constraint**: Full compliance would add 2–3 weeks.
- **MVP Priority**: Basic security is sufficient for MVP; full compliance is secondary.
- **User Need**: MVP users are primarily in US/EU; compliance is important but not blocking.

**When Reconsidered**: Phase 10 (Compliance & Data Privacy) — planned for Q3 2026 before enterprise launch.

**Workaround**: Basic security is implemented; compliance features can be added later.

---

### 20. Performance Optimization — Phase 1

**What**: Advanced caching (Redis), database query optimization, and frontend code splitting in MVP.

**Why Excluded**:
- **Complexity**: Requires caching infrastructure, query analysis, and performance monitoring.
- **Time Constraint**: Performance optimization would add 1–2 weeks.
- **MVP Priority**: Basic performance is sufficient for MVP; optimization is secondary.
- **User Need**: MVP users are small teams; performance is acceptable.

**When Reconsidered**: Phase 11 (Performance Optimization) — planned for Q3 2026 after MVP is stable.

**Workaround**: Basic performance is acceptable; optimization can be added later.

---

## Intentional Deferral Rationale

### Why These Items Are Deferred

1. **Time Constraint**: MVP timeline is 2–3 weeks; each deferred item would add 1–4 weeks.
2. **Scope Clarity**: Deferred items are not essential for MVP; they are enhancements.
3. **User Feedback**: MVP will be validated with real users; feedback will inform prioritization.
4. **Iterative Development**: Roadmap allows for phased rollout; features can be added incrementally.
5. **Risk Mitigation**: Smaller MVP reduces risk of delays and bugs.

---

## Reconsidering Out-of-Scope Items

### Criteria for Reconsidering

An out-of-scope item will be reconsidered if:

1. **User Demand**: Multiple users request the feature
2. **Business Impact**: Feature would significantly increase revenue or reduce churn
3. **Competitive Pressure**: Competitors offer the feature
4. **Technical Feasibility**: Feature can be implemented in <1 week
5. **Resource Availability**: Team has capacity to implement

### Process for Reconsidering

1. **Collect Feedback**: Gather user feedback on deferred items
2. **Prioritize**: Rank items by impact and effort
3. **Plan**: Add top items to next phase
4. **Communicate**: Inform users of planned features
5. **Execute**: Implement features in planned phase

---

## Assumptions & Dependencies

### Assumptions

- MVP users are primarily English-speaking
- MVP users are small-to-mid-market (1–50 recruiters)
- MVP users don't need advanced analytics or AI
- MVP users can use external tools for video interviews and messaging
- MVP users accept basic performance (API <200ms, page load <3s)

### Dependencies

- Phase 2 depends on Phase 1 (MVP)
- Phase 3 depends on Phase 1 (MVP)
- Phase 4 depends on Phase 1 (MVP)
- Phase 5 depends on Phase 1 (MVP)
- Phase 6 depends on Phase 1 (MVP) and Phase 5
- Phase 7 depends on Phase 1 (MVP) and Phase 4
- Phase 8 depends on Phase 1 (MVP) and Phase 4
- Phase 9 depends on Phase 1 (MVP) and Phase 5
- Phase 10 depends on Phase 1 (MVP) and Phase 2
- Phase 11 depends on Phase 1 (MVP)
- Phase 12 depends on Phase 1 (MVP)

---

## Communication Strategy

### To Users

"GetJob MVP focuses on core hiring workflow: job posting, application submission, and status tracking. Advanced features like video interviews, AI ranking, and mobile apps are planned for future phases based on user feedback."

### To Stakeholders

"Deferred items are intentional to keep MVP scope manageable and timeline realistic. Roadmap includes all deferred items; prioritization will be based on user demand and business impact."

### To Team

"Out-of-scope items are documented to prevent scope creep. If a user requests an out-of-scope item, refer to this document and follow the reconsidering process."

---

**Last Updated**: May 2026 | **Status**: Production Ready
