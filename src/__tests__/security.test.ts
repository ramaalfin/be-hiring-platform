/**
 * Security Tests
 * Requirements: 6.1, 6.2, 6.3
 *
 * Covers:
 * 1. IDOR Prevention — employer cannot access other employer's resources
 * 2. Authorization Middleware — 401/403 on missing/wrong token
 * 3. Input Validation — Zod schema rejects invalid inputs
 * 4. Status Transition Validation — same-status transitions rejected
 * 5. Status History Immutability — no PUT/DELETE endpoints for history
 */
import request from "supertest";
import app from "../app";
import prisma from "../prisma/client";
import {
    createTestUser,
    createTestJob,
    createTestApplication,
    cleanupTestData,
} from "./helpers";

describe("Security Tests", () => {
    // ─── Shared test state ────────────────────────────────────────────────────
    let employerAToken: string;
    let employerAId: string;
    let employerBToken: string;
    let employerBId: string;
    let candidateToken: string;
    let candidateId: string;
    let adminToken: string;
    let adminId: string;

    // Resources owned by Employer A
    let jobAId: string;
    let applicationAId: string;

    // Resources owned by Employer B
    let jobBId: string;
    let applicationBId: string;

    const createdUserIds: string[] = [];

    beforeAll(async () => {
        // Employer A
        const empA = await createTestUser({
            role: "EMPLOYER",
            email: `security-employer-a-${Date.now()}@test.com`,
        });
        employerAToken = empA.accessToken;
        employerAId = empA.user.id;
        createdUserIds.push(employerAId);

        // Employer B
        const empB = await createTestUser({
            role: "EMPLOYER",
            email: `security-employer-b-${Date.now()}@test.com`,
        });
        employerBToken = empB.accessToken;
        employerBId = empB.user.id;
        createdUserIds.push(employerBId);

        // Candidate
        const cand = await createTestUser({
            role: "CANDIDATE",
            email: `security-candidate-${Date.now()}@test.com`,
        });
        candidateToken = cand.accessToken;
        candidateId = cand.user.id;
        createdUserIds.push(candidateId);

        // Admin
        const adm = await createTestUser({
            role: "ADMIN",
            email: `security-admin-${Date.now()}@test.com`,
        });
        adminToken = adm.accessToken;
        adminId = adm.user.id;
        createdUserIds.push(adminId);

        // Job A (owned by Employer A) + application
        const jobA = await createTestJob(employerAId, { jobName: "Security Job A" });
        jobAId = jobA.id;
        const appA = await createTestApplication(jobAId, candidateId);
        applicationAId = appA.id;

        // Job B (owned by Employer B) + application
        const jobB = await createTestJob(employerBId, { jobName: "Security Job B" });
        jobBId = jobB.id;
        const appB = await createTestApplication(jobBId, candidateId);
        applicationBId = appB.id;
    });

    afterAll(async () => {
        await cleanupTestData(createdUserIds);
    });

    // =========================================================================
    // 1. IDOR Prevention Tests
    // =========================================================================

    describe("IDOR Prevention", () => {
        // ── Job-level IDOR ────────────────────────────────────────────────────

        it("Employer A cannot PATCH Employer B's job (403)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobBId}`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ jobName: "Hacked Name" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Employer A cannot DELETE Employer B's job (403)", async () => {
            const res = await request(app)
                .delete(`/api/v1/employer/jobs/${jobBId}`)
                .set("Authorization", `Bearer ${employerAToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        // ── Application-level IDOR ────────────────────────────────────────────

        it("Employer A cannot GET applications for Employer B's job (403)", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobBId}/applications`)
                .set("Authorization", `Bearer ${employerAToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Employer A cannot PATCH status of application belonging to Employer B's job (403)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationBId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Employer A cannot GET history of application belonging to Employer B's job (403)", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${applicationBId}/history`)
                .set("Authorization", `Bearer ${employerAToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Employer A cannot PATCH notes of application belonging to Employer B's job (403)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationBId}/notes`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ notes: "Unauthorized note from Employer A" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        // ── Role-based IDOR ───────────────────────────────────────────────────

        it("Candidate cannot PATCH any employer job (403)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobAId}`)
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({ jobName: "Candidate Hack" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Candidate cannot GET applications for a job (403)", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobAId}/applications`)
                .set("Authorization", `Bearer ${candidateToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Admin cannot access employer-specific job management endpoints (403)", async () => {
            // Admin uses /api/v1/jobs not /api/v1/employer/jobs
            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("Admin cannot PATCH employer job (403)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobAId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ jobName: "Admin Hack" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // =========================================================================
    // 2. Authorization Middleware Tests
    // =========================================================================

    describe("Authorization Middleware", () => {
        // ── No token → 401 ────────────────────────────────────────────────────

        it("POST /api/v1/employer/jobs returns 401 with no token", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .send({
                    jobName: "Test",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });
            expect(res.status).toBe(401);
        });

        it("GET /api/v1/employer/jobs returns 401 with no token", async () => {
            const res = await request(app).get("/api/v1/employer/jobs");
            expect(res.status).toBe(401);
        });

        it("PATCH /api/v1/employer/jobs/:id returns 401 with no token", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobAId}`)
                .send({ jobName: "No Auth" });
            expect(res.status).toBe(401);
        });

        it("DELETE /api/v1/employer/jobs/:id returns 401 with no token", async () => {
            const res = await request(app).delete(`/api/v1/employer/jobs/${jobAId}`);
            expect(res.status).toBe(401);
        });

        it("GET /api/v1/employer/jobs/:jobId/applications returns 401 with no token", async () => {
            const res = await request(app).get(
                `/api/v1/employer/jobs/${jobAId}/applications`
            );
            expect(res.status).toBe(401);
        });

        it("PATCH /api/v1/employer/applications/:appId/status returns 401 with no token", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .send({ status: "SCREENING" });
            expect(res.status).toBe(401);
        });

        it("GET /api/v1/employer/applications/:appId/history returns 401 with no token", async () => {
            const res = await request(app).get(
                `/api/v1/employer/applications/${applicationAId}/history`
            );
            expect(res.status).toBe(401);
        });

        it("PATCH /api/v1/employer/applications/:appId/notes returns 401 with no token", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/notes`)
                .send({ notes: "No auth note" });
            expect(res.status).toBe(401);
        });

        // ── CANDIDATE token → 403 ─────────────────────────────────────────────

        it("POST /api/v1/employer/jobs returns 403 with CANDIDATE token", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({
                    jobName: "Test",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("GET /api/v1/employer/jobs returns 403 with CANDIDATE token", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidateToken}`);
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("PATCH /api/v1/employer/applications/:appId/status returns 403 with CANDIDATE token", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({ status: "SCREENING" });
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        // ── ADMIN token → 403 on employer routes ──────────────────────────────

        it("POST /api/v1/employer/jobs returns 403 with ADMIN token", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    jobName: "Test",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("GET /api/v1/employer/jobs returns 403 with ADMIN token", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        // ── 403 response body contains message ───────────────────────────────

        it("403 response body contains an error message", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidateToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            // The error message should be present
            expect(res.body.error?.message || res.body.message).toBeTruthy();
        });
    });

    // =========================================================================
    // 3. Input Validation Tests
    // =========================================================================

    describe("Input Validation", () => {
        // ── POST /api/v1/employer/jobs ────────────────────────────────────────

        it("POST /api/v1/employer/jobs: missing required fields → 400", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ jobName: "Incomplete Job" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("POST /api/v1/employer/jobs: jobDescription too short (< 10 chars) → 400", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "Short",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("POST /api/v1/employer/jobs: numberOfCandidateNeeded = 0 → 400", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 0,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("POST /api/v1/employer/jobs: numberOfCandidateNeeded > 1000 → 400", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 1001,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("POST /api/v1/employer/jobs: minimumSalary with non-numeric string → 400", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "A valid description here.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "not-a-number",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        // ── PATCH /api/v1/employer/applications/:id/status ────────────────────

        it("PATCH /api/v1/employer/applications/:id/status: invalid status value → 400", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "INVALID_STATUS" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        // ── PATCH /api/v1/employer/applications/:id/notes ─────────────────────

        it("PATCH /api/v1/employer/applications/:id/notes: empty notes string → 400", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/notes`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ notes: "" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("PATCH /api/v1/employer/applications/:id/notes: missing notes field → 400", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/notes`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        // ── PATCH /api/v1/employer/jobs/:id ───────────────────────────────────

        it("PATCH /api/v1/employer/jobs/:id: jobDescription too short → 400", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobAId}`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ jobDescription: "Too short" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // =========================================================================
    // 4. Status Transition Validation Tests
    // =========================================================================

    describe("Status Transition Validation", () => {
        // Helper: reset application to a given status
        const resetStatus = async (appId: string, status: string) => {
            await prisma.application.update({
                where: { id: appId },
                data: { status: status as any },
            });
        };

        it("Same-status transition APPLIED → APPLIED is rejected (400)", async () => {
            await resetStatus(applicationAId, "APPLIED");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "APPLIED" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("Same-status transition SCREENING → SCREENING is rejected (400)", async () => {
            await resetStatus(applicationAId, "SCREENING");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("Error message contains 'Invalid status transition' for same-status", async () => {
            await resetStatus(applicationAId, "APPLIED");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "APPLIED" });

            expect(res.status).toBe(400);
            expect(res.body.error?.message).toContain("Invalid status transition");
        });

        it("Valid transition APPLIED → SCREENING succeeds (200)", async () => {
            await resetStatus(applicationAId, "APPLIED");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("SCREENING");
        });

        it("Valid transition SCREENING → INTERVIEW succeeds (200)", async () => {
            await resetStatus(applicationAId, "SCREENING");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "INTERVIEW" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("INTERVIEW");
        });

        it("Valid transition APPLIED → REJECTED succeeds (200) — full flexibility", async () => {
            await resetStatus(applicationAId, "APPLIED");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "REJECTED" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("REJECTED");
        });

        it("Valid transition APPLIED → HIRED succeeds (200) — full flexibility", async () => {
            await resetStatus(applicationAId, "APPLIED");

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationAId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "HIRED" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("HIRED");
        });
    });

    // =========================================================================
    // 5. Status History Immutability Tests
    // =========================================================================

    describe("Status History Immutability", () => {
        let historyAppId: string;

        beforeAll(async () => {
            // Create a fresh candidate + application for history tests
            const freshCand = await createTestUser({
                role: "CANDIDATE",
                email: `security-history-cand-${Date.now()}@test.com`,
            });
            createdUserIds.push(freshCand.user.id);

            const freshApp = await createTestApplication(jobAId, freshCand.user.id);
            historyAppId = freshApp.id;

            // Clear any pre-existing history
            await prisma.applicationStatusHistory.deleteMany({
                where: { applicationId: historyAppId },
            });
        });

        it("After a status change, a history record is created in the DB", async () => {
            // Reset to APPLIED and clear history
            await prisma.application.update({
                where: { id: historyAppId },
                data: { status: "APPLIED" },
            });
            await prisma.applicationStatusHistory.deleteMany({
                where: { applicationId: historyAppId },
            });

            await request(app)
                .patch(`/api/v1/employer/applications/${historyAppId}/status`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ status: "SCREENING" });

            const history = await prisma.applicationStatusHistory.findMany({
                where: { applicationId: historyAppId },
            });

            expect(history.length).toBe(1);
            expect(history[0].fromStatus).toBe("APPLIED");
            expect(history[0].toStatus).toBe("SCREENING");
            expect(history[0].changedBy).toBe(employerAId);
            expect(history[0].changedAt).toBeDefined();
        });

        it("History record fields are correct (fromStatus, toStatus, changedBy, changedAt)", async () => {
            const history = await prisma.applicationStatusHistory.findMany({
                where: { applicationId: historyAppId },
                orderBy: { changedAt: "asc" },
            });

            expect(history.length).toBeGreaterThan(0);
            const record = history[0];
            expect(record.fromStatus).toBe("APPLIED");
            expect(record.toStatus).toBe("SCREENING");
            expect(record.changedBy).toBe(employerAId);
            expect(record.changedAt).toBeInstanceOf(Date);
        });

        it("History records accumulate correctly (multiple status changes = multiple records)", async () => {
            // Reset and clear
            await prisma.application.update({
                where: { id: historyAppId },
                data: { status: "APPLIED" },
            });
            await prisma.applicationStatusHistory.deleteMany({
                where: { applicationId: historyAppId },
            });

            // Make 3 transitions
            const transitions = ["SCREENING", "INTERVIEW", "OFFER"];
            let currentStatus = "APPLIED";
            for (const nextStatus of transitions) {
                await prisma.application.update({
                    where: { id: historyAppId },
                    data: { status: currentStatus as any },
                });
                await request(app)
                    .patch(`/api/v1/employer/applications/${historyAppId}/status`)
                    .set("Authorization", `Bearer ${employerAToken}`)
                    .send({ status: nextStatus });
                currentStatus = nextStatus;
            }

            const history = await prisma.applicationStatusHistory.findMany({
                where: { applicationId: historyAppId },
            });

            expect(history.length).toBe(3);
        });

        it("History is returned in chronological order (oldest first) via API", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerAToken}`);

            expect(res.status).toBe(200);
            const history = res.body.data;
            expect(Array.isArray(history)).toBe(true);

            for (let i = 1; i < history.length; i++) {
                const prev = new Date(history[i - 1].changedAt).getTime();
                const curr = new Date(history[i].changedAt).getTime();
                expect(curr).toBeGreaterThanOrEqual(prev);
            }
        });

        it("The API has no DELETE endpoint for history (404 on DELETE /api/v1/employer/applications/:id/history)", async () => {
            const res = await request(app)
                .delete(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerAToken}`);

            // No route registered → 404
            expect(res.status).toBe(404);
        });

        it("The API has no PUT endpoint to modify history records directly (404)", async () => {
            const res = await request(app)
                .put(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ fromStatus: "APPLIED", toStatus: "HIRED" });

            expect(res.status).toBe(404);
        });

        it("The API has no PATCH endpoint to modify history records directly (404)", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerAToken}`)
                .send({ fromStatus: "APPLIED", toStatus: "HIRED" });

            expect(res.status).toBe(404);
        });
    });
});
