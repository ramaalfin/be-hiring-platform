/**
 * Performance Tests for Employer ATS Kanban API Endpoints
 *
 * Validates performance requirements:
 * - REQ-NF-PERF-002: PATCH /api/v1/employer/applications/:id/status < 500ms (p95)
 * - REQ-NF-PERF-003: GET /api/v1/employer/jobs/:jobId/applications < 2000ms
 * - REQ-NF-PERF-004: GET /api/v1/jobs/search < 1000ms
 *
 * Note: These tests measure actual HTTP response times including middleware,
 * service logic, and database queries. They run against the real database
 * configured in the test environment.
 */
import request from "supertest";
import app from "../../app";
import prisma from "../../prisma/client";
import {
    createTestUser,
    createTestJob,
    createTestApplication,
    cleanupTestData,
} from "../helpers";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Measures the response time of a single HTTP request in milliseconds.
 */
async function measureResponseTime(
    requestFn: () => Promise<request.Response>
): Promise<number> {
    const start = Date.now();
    await requestFn();
    return Date.now() - start;
}

/**
 * Runs `n` requests and returns the p95 latency (95th percentile).
 * Sorts the durations and picks the value at the 95th percentile index.
 */
async function measureP95(
    requestFn: () => Promise<request.Response>,
    n: number = 20
): Promise<number> {
    const durations: number[] = [];
    for (let i = 0; i < n; i++) {
        const duration = await measureResponseTime(requestFn);
        durations.push(duration);
    }
    durations.sort((a, b) => a - b);
    const p95Index = Math.floor(n * 0.95);
    return durations[Math.min(p95Index, durations.length - 1)];
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Performance Tests", () => {
    let employerToken: string;
    let employerId: string;
    let jobId: string;
    let applicationId: string;
    const createdUserIds: string[] = [];

    beforeAll(async () => {
        // Create employer
        const employer = await createTestUser({
            role: "EMPLOYER",
            email: `perf-employer-${Date.now()}@test.com`,
        });
        employerToken = employer.accessToken;
        employerId = employer.user.id;
        createdUserIds.push(employerId);

        // Create a job
        const job = await createTestJob(employerId);
        jobId = job.id;

        // Create multiple applications to simulate a realistic board
        const candidatePromises = Array.from({ length: 10 }, (_, i) =>
            createTestUser({
                role: "CANDIDATE",
                email: `perf-candidate-${i}-${Date.now()}@test.com`,
            })
        );
        const candidates = await Promise.all(candidatePromises);
        candidates.forEach((c) => createdUserIds.push(c.user.id));

        const appPromises = candidates.map((c) =>
            createTestApplication(jobId, c.user.id)
        );
        const apps = await Promise.all(appPromises);
        applicationId = apps[0].id;

        // Spread applications across different statuses for realistic data
        const statuses = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;
        await Promise.all(
            apps.slice(1).map((app, i) =>
                prisma.application.update({
                    where: { id: app.id },
                    data: { status: statuses[i % statuses.length] },
                })
            )
        );
    }, 60000);

    afterAll(async () => {
        await cleanupTestData(createdUserIds);
    });

    // ─── REQ-NF-PERF-002: Status Update < 500ms p95 ──────────────────────────

    describe("PATCH /api/v1/employer/applications/:id/status — target: <500ms p95", () => {
        it("should complete status update within 500ms p95 over 20 requests", async () => {
            let callCount = 0;
            const statusCycle = ["APPLIED", "SCREENING", "APPLIED", "SCREENING"] as const;

            // Reset application to APPLIED before measuring
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });
            await prisma.applicationStatusHistory.deleteMany({
                where: { applicationId },
            });

            const p95 = await measureP95(async () => {
                // Alternate between APPLIED and SCREENING to keep transitions valid
                const currentStatus = callCount % 2 === 0 ? "APPLIED" : "SCREENING";
                const nextStatus = callCount % 2 === 0 ? "SCREENING" : "APPLIED";

                // Reset status directly in DB to avoid transition validation issues
                await prisma.application.update({
                    where: { id: applicationId },
                    data: { status: currentStatus },
                });

                callCount++;
                return request(app)
                    .patch(`/api/v1/employer/applications/${applicationId}/status`)
                    .set("Authorization", `Bearer ${employerToken}`)
                    .send({ status: nextStatus });
            }, 20);

            console.log(`[PERF] Status update p95: ${p95}ms (target: <500ms)`);
            expect(p95).toBeLessThan(500);
        }, 120000);

        it("single status update should complete within 500ms", async () => {
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "APPLIED" },
            });

            const duration = await measureResponseTime(() =>
                request(app)
                    .patch(`/api/v1/employer/applications/${applicationId}/status`)
                    .set("Authorization", `Bearer ${employerToken}`)
                    .send({ status: "SCREENING" })
            );

            console.log(`[PERF] Single status update: ${duration}ms (target: <500ms)`);
            expect(duration).toBeLessThan(500);
        }, 30000);
    });

    // ─── REQ-NF-PERF-003: Kanban Board Load < 2000ms ─────────────────────────

    describe("GET /api/v1/employer/jobs/:jobId/applications — target: <2000ms", () => {
        it("should load kanban board applications within 2000ms", async () => {
            const duration = await measureResponseTime(() =>
                request(app)
                    .get(`/api/v1/employer/jobs/${jobId}/applications`)
                    .set("Authorization", `Bearer ${employerToken}`)
            );

            console.log(`[PERF] Kanban board load: ${duration}ms (target: <2000ms)`);
            expect(duration).toBeLessThan(2000);
        }, 30000);

        it("should load kanban board within 2000ms p95 over 10 requests", async () => {
            const p95 = await measureP95(
                () =>
                    request(app)
                        .get(`/api/v1/employer/jobs/${jobId}/applications`)
                        .set("Authorization", `Bearer ${employerToken}`),
                10
            );

            console.log(`[PERF] Kanban board p95: ${p95}ms (target: <2000ms)`);
            expect(p95).toBeLessThan(2000);
        }, 60000);

        it("should load kanban board with status filter within 2000ms", async () => {
            const duration = await measureResponseTime(() =>
                request(app)
                    .get(`/api/v1/employer/jobs/${jobId}/applications?status=APPLIED`)
                    .set("Authorization", `Bearer ${employerToken}`)
            );

            console.log(`[PERF] Kanban board (filtered) load: ${duration}ms (target: <2000ms)`);
            expect(duration).toBeLessThan(2000);
        }, 30000);
    });

    // ─── REQ-NF-PERF-004: Search Results < 1000ms ────────────────────────────

    describe("GET /api/v1/jobs/search — target: <1000ms", () => {
        it("should return search results within 1000ms (no query)", async () => {
            const duration = await measureResponseTime(() =>
                request(app).get("/api/v1/jobs/search")
            );

            console.log(`[PERF] Search (no query): ${duration}ms (target: <1000ms)`);
            expect(duration).toBeLessThan(1000);
        }, 30000);

        it("should return keyword search results within 1000ms", async () => {
            const duration = await measureResponseTime(() =>
                request(app).get("/api/v1/jobs/search?q=engineer")
            );

            console.log(`[PERF] Search (keyword): ${duration}ms (target: <1000ms)`);
            expect(duration).toBeLessThan(1000);
        }, 30000);

        it("should return filtered search results within 1000ms", async () => {
            const duration = await measureResponseTime(() =>
                request(app).get("/api/v1/jobs/search?jobType=Full-time&page=1&limit=20")
            );

            console.log(`[PERF] Search (filtered): ${duration}ms (target: <1000ms)`);
            expect(duration).toBeLessThan(1000);
        }, 30000);

        it("should return search results within 1000ms p95 over 10 requests", async () => {
            const p95 = await measureP95(
                () => request(app).get("/api/v1/jobs/search?q=software"),
                10
            );

            console.log(`[PERF] Search p95: ${p95}ms (target: <1000ms)`);
            expect(p95).toBeLessThan(1000);
        }, 60000);
    });

    // ─── REQ-NF-PERF-002: Employer Jobs List < 300ms p95 ─────────────────────

    describe("GET /api/v1/employer/jobs — target: <300ms p95", () => {
        it("should return employer jobs list within 300ms p95", async () => {
            const p95 = await measureP95(
                () =>
                    request(app)
                        .get("/api/v1/employer/jobs")
                        .set("Authorization", `Bearer ${employerToken}`),
                10
            );

            console.log(`[PERF] Employer jobs list p95: ${p95}ms (target: <300ms)`);
            expect(p95).toBeLessThan(300);
        }, 60000);
    });
});
