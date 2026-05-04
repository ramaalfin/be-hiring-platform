# Employer ATS Kanban — Out-of-Scope Items

## Explicitly Out-of-Scope (MVP)

### 1. Real-Time Sync (WebSocket)

**What**: Live updates when other employers update applications (e.g., another employer moves an application, you see it update in real-time).

**Why Excluded**:
- **Infrastructure Complexity**: Requires WebSocket server, connection management, message broadcasting
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Polling/refresh is sufficient for MVP
- **Operational Overhead**: WebSocket requires more infrastructure and monitoring

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026 if user demand is high

**Workaround**: Employer can refresh page to see latest updates; auto-refresh every 30 seconds (optional)

---

### 2. Advanced Search (ElasticSearch)

**What**: Full-text search with relevance scoring, faceted search, autocomplete suggestions.

**Why Excluded**:
- **Infrastructure Overhead**: Requires ElasticSearch cluster, indexing pipeline, maintenance
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Database queries are sufficient for MVP
- **Cost**: ElasticSearch adds infrastructure costs

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026 if search volume is high

**Workaround**: Database queries with LIKE and filters; pagination handles large result sets

---

### 3. Email Notifications on Status Change

**What**: Send email to candidate when application status changes (e.g., "Your application moved to Interview stage").

**Why Excluded**:
- **Event System Not Ready**: Requires event-driven architecture (not implemented yet)
- **Time Constraint**: Would add 1-2 hours
- **MVP Priority**: Candidates can check dashboard for updates
- **Complexity**: Requires email template management, unsubscribe handling

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026

**Workaround**: Candidates can check dashboard; employers can manually email candidates

---

### 4. AI-Powered Candidate Matching

**What**: CV parsing, skill extraction, and automatic candidate scoring based on job requirements.

**Why Excluded**:
- **Complexity**: Requires ML model, CV parsing library, feature engineering
- **Time Constraint**: Would add 3-4 hours
- **Data Dependency**: Needs historical hiring data to train
- **Bias Risk**: ML models can perpetuate hiring bias

**When Reconsidered**: Phase 8 (AI-Powered Candidate Ranking) — planned for Q3 2026

**Workaround**: Employers manually review applications; kanban board helps organize candidates

---

### 5. Bulk Status Updates

**What**: Select multiple applications and update status in bulk (e.g., reject all candidates in SCREENING stage).

**Why Excluded**:
- **Complexity**: Requires multi-select UI, bulk API endpoint, transaction handling
- **Time Constraint**: Would add 1-2 hours
- **MVP Priority**: Single updates are sufficient for MVP
- **Risk**: Bulk operations can cause accidental data loss

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026

**Workaround**: Employers can update applications one by one; drag-and-drop makes this fast

---

### 6. Custom Pipeline Stages

**What**: Allow employers to define custom pipeline stages (e.g., "Phone Screen", "Technical Test", "Final Round").

**Why Excluded**:
- **Complexity**: Requires dynamic stage management, transition rule configuration
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Fixed 6 stages are sufficient for MVP
- **Maintenance**: Custom stages require more support and testing

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026

**Workaround**: Fixed 6 stages cover most hiring workflows; employers can use notes for custom info

---

### 7. Hiring Analytics & Reporting

**What**: Dashboards showing hiring funnel, time-to-hire, recruiter performance, candidate source analysis.

**Why Excluded**:
- **Complexity**: Requires data warehouse, ETL pipeline, BI tool integration
- **Time Constraint**: Would add 3-4 hours
- **MVP Priority**: Core ATS workflow is more important than analytics
- **User Need**: Employers need to manage applications first; analytics are secondary

**When Reconsidered**: Phase 4 (Admin Dashboard & Analytics) — planned for Q2 2026

**Workaround**: Employers can export data to CSV and analyze in Excel or Google Sheets

---

### 8. Candidate Messaging & In-App Chat

**What**: Direct messaging between employers and candidates within the platform.

**Why Excluded**:
- **Complexity**: Requires real-time messaging, notification system, message storage
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Email is sufficient for MVP communication
- **User Need**: Employers and candidates can use email or external tools (Slack, WhatsApp)

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026

**Workaround**: Employers and candidates communicate via email; kanban board provides context

---

### 9. Interview Scheduling Integration

**What**: Built-in calendar integration for scheduling interviews (Zoom, Google Calendar, Outlook).

**Why Excluded**:
- **Complexity**: Requires calendar API integration, availability management, reminder system
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Employers can schedule interviews externally
- **User Need**: External tools (Calendly, Google Calendar) already handle this

**When Reconsidered**: Phase 9 (Video Interview Integration) — planned for Q3 2026

**Workaround**: Employers use external calendar tools; kanban board helps track interview stage

---

### 10. Candidate Feedback & Rejection Reasons

**What**: Structured feedback form for employers to provide feedback to rejected candidates.

**Why Excluded**:
- **Complexity**: Requires feedback template management, email integration
- **Time Constraint**: Would add 1-2 hours
- **MVP Priority**: Employers can use notes field for feedback
- **Legal Risk**: Feedback can create legal liability

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026

**Workaround**: Employers can add notes to application; manually email candidates

---

### 11. Saved Jobs & Job Alerts (Candidate)

**What**: Allow candidates to save jobs for later and receive email alerts for new jobs matching their criteria.

**Why Excluded**:
- **Complexity**: Requires saved job storage, email alert scheduling, preference management
- **Time Constraint**: Would add 1-2 hours
- **MVP Priority**: Candidates can apply immediately; saved jobs are nice-to-have
- **User Need**: Candidates can bookmark jobs in browser

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026

**Workaround**: Candidates can bookmark jobs in browser or apply immediately

---

### 12. Employer Collaboration & Comments

**What**: Allow multiple employers to collaborate on applications, leave comments, and share feedback.

**Why Excluded**:
- **Complexity**: Requires real-time collaboration, comment threading, notification system
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Single employer per job is sufficient for MVP
- **User Need**: MVP employers are small teams; collaboration is secondary

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026

**Workaround**: Employers can communicate via email or Slack; kanban board provides context

---

### 13. Employer Permissions & Roles

**What**: Fine-grained permissions (e.g., some employers can only view applications, others can update status).

**Why Excluded**:
- **Complexity**: Requires permission matrix, role management, audit logging
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: All employers have same permissions
- **User Need**: MVP employers are small teams; fine-grained permissions are secondary

**When Reconsidered**: Phase 2 (Enhanced ATS) — planned for Q3 2026

**Workaround**: All employers have same permissions; can be added later

---

### 14. Candidate Profiles & Skill Tags

**What**: Candidate profiles with skill tags, experience level, location, availability.

**Why Excluded**:
- **Complexity**: Requires profile schema, skill taxonomy, search indexing
- **Time Constraint**: Would add 2-3 hours
- **MVP Priority**: Application data is sufficient for MVP
- **User Need**: Employers can review resume and notes

**When Reconsidered**: Phase 5 (Candidate Portal Enhancements) — planned for Q2 2026

**Workaround**: Candidates provide info in application; employers review resume

---

### 15. Employer Branding & Custom Domains

**What**: Custom employer branding, domain, and UI for employer job pages.

**Why Excluded**:
- **Complexity**: Requires multi-tenant architecture, theme engine, custom domain support
- **Time Constraint**: Would add 3-4 hours
- **MVP Priority**: Single-brand MVP is sufficient
- **User Need**: MVP employers don't need custom branding

**When Reconsidered**: Backlog (Future Consideration) — planned for Q4 2026

**Workaround**: Employers use GetJob branding; custom branding can be added later

---

## Intentional Deferral Rationale

### Why These Items Are Deferred

1. **Time Constraint**: MVP timeline is 12 hours; each deferred item would add 1-4 hours
2. **Scope Clarity**: Deferred items are not essential for MVP; they are enhancements
3. **User Feedback**: MVP will be validated with real employers; feedback will inform prioritization
4. **Iterative Development**: Roadmap allows for phased rollout; features can be added incrementally
5. **Risk Mitigation**: Smaller MVP reduces risk of delays and bugs

---

## Reconsidering Out-of-Scope Items

### Criteria for Reconsidering

An out-of-scope item will be reconsidered if:

1. **User Demand**: Multiple employers request the feature
2. **Business Impact**: Feature would significantly increase revenue or reduce churn
3. **Competitive Pressure**: Competitors offer the feature
4. **Technical Feasibility**: Feature can be implemented in <1 hour
5. **Resource Availability**: Team has capacity to implement

### Process for Reconsidering

1. **Collect Feedback**: Gather feedback from employers on deferred items
2. **Prioritize**: Rank items by impact and effort
3. **Plan**: Add top items to next phase
4. **Communicate**: Inform employers of planned features
5. **Execute**: Implement features in planned phase

---

## Assumptions & Dependencies

### Assumptions

- MVP employers are small-to-mid-market (1-10 hiring managers)
- MVP employers don't need advanced analytics or AI
- MVP employers can use external tools for messaging and scheduling
- MVP employers accept basic performance (drag <100ms, API <500ms)
- MVP candidates don't need saved jobs or job alerts

### Dependencies

- Phase 1 (Employer Role) → Phase 2 (Job Ownership)
- Phase 2 (Job Ownership) → Phase 3 (ATS Backend)
- Phase 3 (ATS Backend) → Phase 4 (Kanban UI)
- Phase 1 (Employer Role) → Phase 5 (Search & Filter)

---

## Communication Strategy

### To Employers

"GetJob MVP focuses on core ATS workflow: job posting, application management, and kanban board. Advanced features like real-time sync, AI matching, and analytics are planned for future phases based on employer feedback."

### To Stakeholders

"Deferred items are intentional to keep MVP scope manageable and timeline realistic. Roadmap includes all deferred items; prioritization will be based on employer demand and business impact."

### To Team

"Out-of-scope items are documented to prevent scope creep. If an employer requests an out-of-scope item, refer to this document and follow the reconsidering process."

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
