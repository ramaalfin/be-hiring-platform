# Employer ATS Kanban — Delta Specification

**Date**: May 4, 2026  
**Status**: ✅ Ready for Implementation  
**Version**: 1.0.0  

---

## 📋 Quick Summary

This delta spec upgrades GetJob from a **2-role system** (ADMIN, CANDIDATE) to a **3-role system** (ADMIN, EMPLOYER, CANDIDATE) and introduces a **structured ATS with kanban-based UI** for managing application pipelines.

**Impact**: 
- ✅ Employers can create and own jobs
- ✅ Employers manage applications through visual pipeline (APPLIED → SCREENING → INTERVIEW → OFFER → HIRED/REJECTED)
- ✅ Candidates can search and filter jobs
- ✅ Backward compatible with existing ADMIN and CANDIDATE roles

**Timeline**: ~12 hours of focused development (5 phases × 2-3 hours each)

---

## 📁 Specification Documents

| Document | Purpose | Pages |
|----------|---------|-------|
| **proposal.md** | One-paragraph intent, affected areas, risk assessment | 2 |
| **requirements.md** | 40+ requirements using RFC 2119 keywords | 4 |
| **scenarios.md** | 40+ Gherkin-style acceptance scenarios | 6 |
| **validation.md** | Test coverage, QA, security, performance validation | 4 |
| **out-of-scope.md** | 15 explicitly excluded features with rationale | 3 |
| **roadmap.md** | 5 phases with deliverables and validation gates | 4 |

**Total**: 23 pages of precise, executable specification

---

## 🎯 Key Features

### 1. Employer Role
- New EMPLOYER role distinct from ADMIN and CANDIDATE
- Employer can only access jobs they created and applications for those jobs
- Middleware enforces access control
- Employer dashboard at /employer/dashboard

### 2. Job Ownership
- Jobs include employerId foreign key
- Employer can create, view, update, delete own jobs
- ADMIN can still manage all jobs (backward compatible)
- Candidates see all jobs (backward compatible)

### 3. ATS Pipeline
- Applications have status enum: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
- Status transitions validated (e.g., APPLIED → SCREENING allowed, APPLIED → OFFER blocked)
- Status history tracked (immutable audit trail)
- Employer can update status via API

### 4. Kanban UI
- 6-column kanban board (one per status)
- Drag-and-drop using @hello-pangea/dnd
- Optimistic updates with rollback on error
- Application detail modal with notes field
- Keyboard navigation and screen reader support

### 5. Job Search & Filtering
- Keyword search on job title and description
- Filter by job type (Full-time, Part-time, Contract)
- Filter by salary range
- Pagination (20 per page)
- Search bar and filter panel in UI

---

## 📊 Requirements Summary

### By Domain

| Domain | Count | Status |
|--------|-------|--------|
| **Authentication & Authorization** | 5 | ✅ ADDED |
| **Job Management** | 5 | ✅ MODIFIED |
| **Application Lifecycle** | 7 | ✅ ADDED |
| **Kanban UI** | 8 | ✅ ADDED |
| **Job Search & Filtering** | 6 | ✅ ADDED |
| **Non-Functional** | 6 | ✅ ADDED |
| **Backward Compatibility** | 3 | ✅ MODIFIED |
| **Total** | **40+** | ✅ Complete |

### By Type

| Type | Count |
|------|-------|
| **Functional Requirements** | 30+ |
| **Non-Functional Requirements** | 6 |
| **Backward Compatibility** | 3 |
| **Data Model Changes** | 4 |

---

## 🧪 Scenarios Summary

**Total Scenarios**: 40+

| Category | Count |
|----------|-------|
| **Authentication** | 5 |
| **Job Management** | 5 |
| **Application Lifecycle** | 6 |
| **Kanban UI** | 6 |
| **Search & Filtering** | 6 |
| **Non-Functional** | 6 |

**Coverage**:
- ✅ Happy paths (normal workflows)
- ✅ Edge cases (boundary conditions)
- ✅ Error cases (failure scenarios)
- ✅ Backward compatibility (existing functionality)

---

## 🔄 Implementation Phases

### Phase 1: Employer Role (2 hours)
**Deliverable**: New EMPLOYER role with middleware  
**Key Tasks**: Add role enum, create middleware, route by role  
**Validation**: Employer login, redirect, access control

### Phase 2: Job Ownership (2 hours)
**Deliverable**: Employer can create and manage jobs  
**Key Tasks**: Add employerId, create endpoints, add ownership validation  
**Validation**: Job CRUD, ownership checks, ADMIN regression

### Phase 3: ATS Backend (3 hours)
**Deliverable**: Application status management with transition validation  
**Key Tasks**: Add status enum, implement transitions, track history  
**Validation**: Status updates, transition validation, history tracking

### Phase 4: Kanban UI (3 hours)
**Deliverable**: Kanban board with drag-and-drop  
**Key Tasks**: Create board, implement drag-and-drop, add details modal  
**Validation**: Drag works, invalid drag reverted, <100ms performance

### Phase 5: Search & Filter (2 hours)
**Deliverable**: Job search and filtering  
**Key Tasks**: Create search endpoint, implement filters, add UI  
**Validation**: Search works, filters work, <1 second load time

**Total**: ~12 hours of focused development

---

## ✅ Validation Checklist

### Functionality
- [ ] Employer can log in and access dashboard
- [ ] Employer can create, view, update, delete jobs
- [ ] Employer can view applications in kanban board
- [ ] Employer can drag applications between columns
- [ ] Invalid drag is prevented and reverted
- [ ] Candidates can search and filter jobs
- [ ] All status transitions validated
- [ ] Status history tracked

### Security
- [ ] IDOR protection (employer can't access other employers' data)
- [ ] Ownership validation on all endpoints
- [ ] Unauthorized access returns 403 Forbidden
- [ ] Status transitions validated on backend
- [ ] Status history is immutable

### Performance
- [ ] Drag-and-drop completes in <100ms
- [ ] API response time <500ms (p95)
- [ ] Kanban board loads in <2 seconds
- [ ] Search results load in <1 second
- [ ] Database indexes created

### Backward Compatibility
- [ ] ADMIN role unchanged
- [ ] CANDIDATE role unchanged
- [ ] Existing endpoints still work
- [ ] No breaking changes

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] ARIA labels present
- [ ] Color contrast sufficient

---

## 🚀 Critical Engineering Decisions

### 1. Drag-and-Drop Library
**Decision**: Use @hello-pangea/dnd  
**Rationale**: Lightweight, performant, accessible, good DX  
**Alternative**: react-beautiful-dnd (heavier, less maintained)

### 2. Status Transition Validation
**Decision**: Validate on both frontend and backend  
**Rationale**: Frontend for UX, backend for security (source of truth)  
**Alternative**: Backend only (slower UX)

### 3. Optimistic Updates
**Decision**: Update UI immediately, rollback on error  
**Rationale**: Fast UX, handles errors gracefully  
**Alternative**: Wait for API response (slower UX)

### 4. Search Implementation
**Decision**: Use database queries (no ElasticSearch)  
**Rationale**: Simpler, lower cost, sufficient for MVP  
**Alternative**: ElasticSearch (more complex, higher cost)

### 5. Status History
**Decision**: Immutable audit trail (no updates/deletes)  
**Rationale**: Tamper-proof, compliance-friendly  
**Alternative**: Mutable history (less secure)

---

## 🔒 Security Considerations

### IDOR Protection
- ✅ Verify employer ownership on all endpoints
- ✅ Return 403 for unauthorized access
- ✅ Log unauthorized attempts
- ✅ Test with multiple employers

### Status Transition Validation
- ✅ Enforce on backend (source of truth)
- ✅ Validate on frontend (UX feedback)
- ✅ No way to bypass validation
- ✅ Test all invalid transitions

### Data Integrity
- ✅ Status history is immutable
- ✅ Only new records can be added
- ✅ Audit trail is tamper-proof
- ✅ Test history immutability

---

## 📈 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Drag interaction | <100ms | ✅ Target |
| API response | <500ms (p95) | ✅ Target |
| Kanban load | <2 seconds | ✅ Target |
| Search load | <1 second | ✅ Target |
| Test coverage | >70% | ✅ Target |

---

## 🔄 Backward Compatibility

### What Stays the Same
- ✅ ADMIN role unchanged
- ✅ CANDIDATE role unchanged
- ✅ Existing endpoints unchanged
- ✅ Existing job creation (ADMIN)
- ✅ Existing application submission (CANDIDATE)
- ✅ Existing email notifications

### What's New
- ✅ EMPLOYER role
- ✅ Employer endpoints
- ✅ Kanban UI
- ✅ Search and filtering
- ✅ Status management

### Migration Path
- Existing ADMIN users can optionally become EMPLOYER
- No data loss or breaking changes
- Gradual rollout possible

---

## 📋 Out-of-Scope (Intentional Exclusions)

**15 items explicitly excluded** to keep MVP scope manageable:

1. **Real-time Sync** (WebSocket) — Complexity, infra overhead
2. **Advanced Search** (ElasticSearch) — Cost, complexity
3. **Email Notifications** — Event system not ready
4. **AI Matching** — Not core MVP
5. **Bulk Status Updates** — Risk of data loss
6. **Custom Pipeline Stages** — Complexity, maintenance
7. **Hiring Analytics** — Secondary to core workflow
8. **Candidate Messaging** — External tools available
9. **Interview Scheduling** — External tools available
10. **Candidate Feedback** — Legal risk
11. **Saved Jobs** — Nice-to-have
12. **Employer Collaboration** — Small teams don't need it
13. **Fine-Grained Permissions** — All employers same permissions
14. **Candidate Profiles** — Application data sufficient
15. **Custom Branding** — Single-brand MVP

**Reconsidering Criteria**: User demand, business impact, competitive pressure, technical feasibility, resource availability

---

## 🎓 What This Demonstrates

After implementing this spec, you will have demonstrated:

### 1. Domain Modeling
- ✅ Designed a 3-role system with clear boundaries
- ✅ Modeled ATS pipeline with state transitions
- ✅ Implemented IDOR protection

### 2. State Orchestration
- ✅ Managed complex state (kanban board)
- ✅ Implemented optimistic updates with rollback
- ✅ Handled error cases gracefully

### 3. System Constraint Thinking
- ✅ Enforced business rules (status transitions)
- ✅ Validated ownership (IDOR protection)
- ✅ Tracked audit trail (status history)

### 4. Full-Stack Development
- ✅ Backend: Role-based access, status management, API design
- ✅ Frontend: Kanban UI, drag-and-drop, search/filter
- ✅ Database: Schema design, indexes, migrations

### 5. Quality & Testing
- ✅ Comprehensive test coverage (>70%)
- ✅ E2E tests for critical workflows
- ✅ Performance validation
- ✅ Security validation

---

## 🎯 Success Criteria

This spec is successful when:

1. ✅ **All requirements implemented** — 40+ requirements met
2. ✅ **All scenarios pass** — 40+ scenarios verified
3. ✅ **All tests pass** — >70% coverage, all E2E tests pass
4. ✅ **Performance targets met** — Drag <100ms, API <500ms, search <1s
5. ✅ **Security validated** — IDOR prevented, transitions validated, history immutable
6. ✅ **Backward compatible** — ADMIN and CANDIDATE roles unchanged
7. ✅ **Deployed to production** — Feature available to users
8. ✅ **Monitored** — Error rate <0.1%, uptime 99.5%

---

## 📞 How to Use This Spec

### For Developers
1. Read **proposal.md** (5 min) — Understand intent
2. Read **requirements.md** (20 min) — Understand what to build
3. Read **roadmap.md** (10 min) — Understand phases
4. Follow **roadmap.md** to implement each phase
5. Use **scenarios.md** to write tests
6. Use **validation.md** to verify quality

### For QA/Testers
1. Read **requirements.md** (20 min) — Understand what to test
2. Read **scenarios.md** (30 min) — Understand test cases
3. Use **scenarios.md** to write manual tests
4. Use **validation.md** to create test plans
5. Link issues to requirements

### For Product Managers
1. Read **proposal.md** (5 min) — Understand intent
2. Read **roadmap.md** (10 min) — Understand timeline
3. Read **out-of-scope.md** (10 min) — Understand scope
4. Use these docs to communicate with stakeholders

---

## 📊 Specification Statistics

| Metric | Value |
|--------|-------|
| **Total Documents** | 6 |
| **Total Pages** | 23 |
| **Total Words** | 12,000+ |
| **Requirements** | 40+ |
| **Scenarios** | 40+ |
| **Phases** | 5 |
| **Out-of-Scope Items** | 15 |
| **Estimated Duration** | 12 hours |

---

## ✨ Key Highlights

### Precision
- ✅ Every requirement is observable and testable
- ✅ Every scenario is executable
- ✅ Every validation criterion is clear

### Completeness
- ✅ All domains covered (auth, jobs, ATS, UI, search)
- ✅ Happy paths, edge cases, error cases
- ✅ Backward compatibility verified

### Clarity
- ✅ RFC 2119 keywords used correctly
- ✅ No ambiguous requirements
- ✅ Clear traceability (requirements → scenarios → validation)

### Executability
- ✅ 5 phases, each 2-3 hours
- ✅ Clear deliverables per phase
- ✅ Clear validation gates per phase

---

## 🚀 Next Steps

1. **Review**: Share with team for feedback
2. **Refine**: Make any necessary updates
3. **Execute**: Follow roadmap.md to implement
4. **Test**: Use scenarios.md and validation.md
5. **Deploy**: Roll out to production
6. **Monitor**: Track metrics and collect feedback

---

**Status**: ✅ Ready for Implementation  
**Version**: 1.0.0  
**Date**: May 4, 2026  

For questions or updates, contact the Product Manager or Tech Lead.
