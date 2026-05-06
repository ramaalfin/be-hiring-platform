/**
 * Integration tests for Employer Application Endpoints
 * Tests: PATCH /api/v1/employer/applications/:appId/status
 *        GET  /api/v1/employer/applications/:appId/history
 *        PATCH /api/v1/employer/applications/:appId/notes
 *        GET  /api/v1/employer/jobs/:jobId/applications
 */
import request from "supertest";
import app from "../app";
import prisma from "../prisma/client";
import { createTestUser, createTestJob, createTestApplication, cleanupTestData } from "./helpers";

describe("Employer Application Endpoints", () => {
    let employerToken: string;
    let employerId: string;
    let otherEmployerToken: string;
    let otherEmployerId: string;
    let candidateId: string;
    let jobId: string;
    let applicationId: string;
    const createdUserIds: string[] = [];

    beforeAll(async () => {
        // Create employer
        const employer = await createTestUser({ role: "EMPLOYER", email: `employer-apps-${Date.now()}@test.com` });
        employerToken = employer.accessToken;
        employerId = employer.user.id;
        createdUserIds.push(employerId);

        // Create another employer for IDOR tests
        const otherEmployer = await createTestUser({ role: "EMPLOYER", email: `other-employer-apps-${Date.now()}@test.com` });
        otherEmployerToken = otherEmployer.accessToken;
        otherEmployerId = otherEmployer.user.id;
        createdUserIds.push(otherEmployerId);

        // Create candidate
        const candidate = await createTestUser({ role: "CANDIDATE", email: `candidate-apps-${Date.now()}@test.com` });
        candidateId = candidate.user.id;
        createdUserIds.push(candidateId);

        // Create a job owned by the employer
        const job = await createTestJob(employerId);
        jobId = job.id;

        // Create an application
        const application = await createTestApplication(jobId, candidateId);
        applicationId = application.id;
    });

    afterAll(async () => {
        await cleanupTestData(createdUserIds);
    });

    // ─── PATCH /api/v1/employer/applications/:appId/status ───────────────────

    describe("PATCH /api/v1/employer/applications/:appId/status", () => {
        it("should update application status with a valid transition (APPLIED → SCREENING)", async () => {
            // Reset application to APPLIED first
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("SCREENING");
        });

        it("should create a status history record on status update", async () => {
            // Reset to APPLIED
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });
            // Clear existing history for clean test
            await prisma.applicationStatusHistory.deleteMany({
                where: { applicationId },
            });

            await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "SCREENING", reason: "Good candidate" });

            const history = await prisma.applicationStatusHistory.findMany({
                where: { applicationId },
            });

            expect(history.length).toBe(1);
            expect(history[0].fromStatus).toBe("APPLIED");
            expect(history[0].toStatus).toBe("SCREENING");
            expect(history[0].changedBy).toBe(employerId);
            expect(history[0].reason).toBe("Good candidate");
        });

        it("should return 400 for invalid status transition (APPLIED → HIRED)", async () => {
            // Reset to APPLIED
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "HIRED" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toContain("Invalid status transition");
        });

        it("should return 400 for invalid status transition (APPLIED → OFFER)", async () => {
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "OFFER" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for invalid status value", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "INVALID_STATUS" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 403 when another employer tries to update status", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .set("Authorization", `Bearer ${otherEmployerToken}`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/status`)
                .send({ status: "SCREENING" });

            expect(res.status).toBe(401);
        });

        it("should support full valid transition chain: APPLIED → SCREENING → INTERVIEW → OFFER → HIRED", async () => {
            // Create a fresh application for this test
            const freshCandidate = await createTestUser({ role: "CANDIDATE", email: `chain-candidate-${Date.now()}@test.com` });
            createdUserIds.push(freshCandidate.user.id);
            const freshApp = await createTestApplication(jobId, freshCandidate.user.id);

            const transitions = [
                { from: "APPLIED", to: "SCREENING" },
                { from: "SCREENING", to: "INTERVIEW" },
                { from: "INTERVIEW", to: "OFFER" },
                { from: "OFFER", to: "HIRED" },
            ];

            for (const { to } of transitions) {
                const res = await request(app)
                    .patch(`/api/v1/employer/applications/${freshApp.id}/status`)
                    .set("Authorization", `Bearer ${employerToken}`)
                    .send({ status: to });

                expect(res.status).toBe(200);
                expect(res.body.data.status).toBe(to);
            }

            // Verify HIRED → anything is rejected
            const finalRes = await request(app)
                .patch(`/api/v1/employer/applications/${freshApp.id}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "REJECTED" });

            expect(finalRes.status).toBe(400);
        });

        it("should support REJECTED transition from APPLIED", async () => {
            const freshCandidate = await createTestUser({ role: "CANDIDATE", email: `reject-candidate-${Date.now()}@test.com` });
            createdUserIds.push(freshCandidate.user.id);
            const freshApp = await createTestApplication(jobId, freshCandidate.user.id);

            const res = await request(app)
                .patch(`/api/v1/employer/applications/${freshApp.id}/status`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ status: "REJECTED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("REJECTED");
        });
    });

    // ─── GET /api/v1/employer/applications/:appId/history ────────────────────

    describe("GET /api/v1/employer/applications/:appId/history", () => {
        let historyAppId: string;

        beforeAll(async () => {
            // Create a fresh application with some history
            const freshCandidate = await createTestUser({ role: "CANDIDATE", email: `history-candidate-${Date.now()}@test.com` });
            createdUserIds.push(freshCandidate.user.id);
            const freshApp = await createTestApplication(jobId, freshCandidate.user.id);
            historyAppId = freshApp.id;

            // Create some history
            await prisma.applicationStatusHistory.create({
                data: {
                    applicationId: historyAppId,
                    fromStatus: "APPLIED",
                    toStatus: "SCREENING",
                    changedBy: employerId,
                    reason: "Looks good",
                },
            });
            await prisma.application.update({
                where: { id: historyAppId },
                data: { status: "SCREENING" },
            });
        });

        it("should return status history for an application", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);

            const historyEntry = res.body.data[0];
            expect(historyEntry.fromStatus).toBe("APPLIED");
            expect(historyEntry.toStatus).toBe("SCREENING");
            expect(historyEntry.changedBy).toBe(employerId);
        });

        it("should return history in chronological order (oldest first)", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            const history = res.body.data;

            if (history.length > 1) {
                for (let i = 1; i < history.length; i++) {
                    const prev = new Date(history[i - 1].changedAt).getTime();
                    const curr = new Date(history[i].changedAt).getTime();
                    expect(curr).toBeGreaterThanOrEqual(prev);
                }
            }
        });

        it("should return 403 when another employer tries to view history", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${historyAppId}/history`)
                .set("Authorization", `Bearer ${otherEmployerToken}`);

            expect(res.status).toBe(403);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/applications/${historyAppId}/history`);

            expect(res.status).toBe(401);
        });
    });

    // ─── PATCH /api/v1/employer/applications/:appId/notes ────────────────────

    describe("PATCH /api/v1/employer/applications/:appId/notes", () => {
        it("should add notes to an application", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ notes: "This candidate looks very promising." });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.notes).toBe("This candidate looks very promising.");
        });

        it("should update existing notes", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ notes: "Updated notes: candidate passed phone screen." });

            expect(res.status).toBe(200);
            expect(res.body.data.notes).toBe("Updated notes: candidate passed phone screen.");
        });

        it("should return 400 for empty notes", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ notes: "" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for missing notes field", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 403 when another employer tries to add notes", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .set("Authorization", `Bearer ${otherEmployerToken}`)
                .send({ notes: "Unauthorized note" });

            expect(res.status).toBe(403);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/applications/${applicationId}/notes`)
                .send({ notes: "No auth note" });

            expect(res.status).toBe(401);
        });
    });

    // ─── GET /api/v1/employer/jobs/:jobId/applications ───────────────────────

    describe("GET /api/v1/employer/jobs/:jobId/applications", () => {
        it("should return applications grouped by status", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobId}/applications`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();

            // Should have all 6 status groups
            expect(res.body.data).toHaveProperty("APPLIED");
            expect(res.body.data).toHaveProperty("SCREENING");
            expect(res.body.data).toHaveProperty("INTERVIEW");
            expect(res.body.data).toHaveProperty("OFFER");
            expect(res.body.data).toHaveProperty("HIRED");
            expect(res.body.data).toHaveProperty("REJECTED");

            // Each group should be an array
            expect(Array.isArray(res.body.data.APPLIED)).toBe(true);
            expect(Array.isArray(res.body.data.SCREENING)).toBe(true);
        });

        it("should filter by status when status query param provided", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobId}/applications?status=APPLIED`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // When filtering by status, only that status group is returned
            expect(res.body.data).toHaveProperty("APPLIED");
            expect(res.body.data).not.toHaveProperty("SCREENING");
        });

        it("should return 403 when another employer tries to view applications", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobId}/applications`)
                .set("Authorization", `Bearer ${otherEmployerToken}`);

            expect(res.status).toBe(403);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .get(`/api/v1/employer/jobs/${jobId}/applications`);

            expect(res.status).toBe(401);
        });

        it("should return 403 for non-existent job", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs/non-existent-job-id/applications")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(403);
        });
    });
});
