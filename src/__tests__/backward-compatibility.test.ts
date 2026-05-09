/**
 * Backward Compatibility Tests
 * Verifies that existing endpoints still work correctly after the employer ATS changes.
 * Tests: GET /api/v1/jobs, GET /api/v1/jobs/:id, POST /api/v1/jobs (ADMIN),
 *        POST /api/v1/applications/:jobId/apply (CANDIDATE)
 * Requirements: 7.1 (REQ-COMPAT-ADMIN-001), 7.2 (REQ-COMPAT-CANDIDATE-001), 7.3 (REQ-COMPAT-ENDPOINTS-001)
 */
import request from "supertest";
import app from "../app";
import { createTestUser, createTestJob, cleanupTestData } from "./helpers";

describe("Backward Compatibility Tests", () => {
    let adminToken: string;
    let adminId: string;
    let candidateToken: string;
    let candidateId: string;
    let jobId: string;
    const createdUserIds: string[] = [];

    beforeAll(async () => {
        // Create admin user
        const admin = await createTestUser({ role: "ADMIN", email: `admin-compat-${Date.now()}@test.com` });
        adminToken = admin.accessToken;
        adminId = admin.user.id;
        createdUserIds.push(adminId);

        // Create candidate user
        const candidate = await createTestUser({ role: "CANDIDATE", email: `candidate-compat-${Date.now()}@test.com` });
        candidateToken = candidate.accessToken;
        candidateId = candidate.user.id;
        createdUserIds.push(candidateId);

        // Create a job for testing
        const job = await createTestJob(adminId);
        jobId = job.id;
    });

    afterAll(async () => {
        await cleanupTestData(createdUserIds);
    });

    // ─── GET /api/v1/jobs (public) ────────────────────────────────────────────

    describe("GET /api/v1/jobs", () => {
        it("should return all jobs without authentication", async () => {
            const res = await request(app).get("/api/v1/jobs");

            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        });

        it("should support pagination", async () => {
            const res = await request(app).get("/api/v1/jobs?page=1&limit=5");

            expect(res.status).toBe(200);
        });
    });

    // ─── GET /api/v1/jobs/:id ─────────────────────────────────────────────────

    describe("GET /api/v1/jobs/:id", () => {
        it("should return a specific job by ID", async () => {
            const res = await request(app).get(`/api/v1/jobs/${jobId}`);

            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        });

        it("should return 404 for non-existent job", async () => {
            const res = await request(app).get("/api/v1/jobs/non-existent-id");

            expect(res.status).toBe(404);
        });
    });

    // ─── POST /api/v1/jobs (ADMIN) ────────────────────────────────────────────

    describe("POST /api/v1/jobs (ADMIN)", () => {
        it("should allow ADMIN to create a job", async () => {
            const res = await request(app)
                .post("/api/v1/jobs")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    jobName: "Admin Created Job",
                    jobType: "Full-time",
                    jobDescription: "This job was created by an admin user for testing purposes.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "5000",
                    maximumSalary: "8000",
                    minimumProfileInformationRequired: {},
                });

            expect(res.status).toBe(201);
            expect(res.body).toBeDefined();
        });

        it("should return 403 for non-ADMIN user", async () => {
            const res = await request(app)
                .post("/api/v1/jobs")
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({
                    jobName: "Unauthorized Job",
                    jobType: "Full-time",
                    jobDescription: "This should not be created by a candidate.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "5000",
                    maximumSalary: "8000",
                    minimumProfileInformationRequired: {},
                });

            expect(res.status).toBe(403);
        });

        it("should return 401 without authentication", async () => {
            const res = await request(app)
                .post("/api/v1/jobs")
                .send({
                    jobName: "No Auth Job",
                    jobType: "Full-time",
                    jobDescription: "This should not be created without auth.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "5000",
                    maximumSalary: "8000",
                    minimumProfileInformationRequired: {},
                });

            expect(res.status).toBe(401);
        });
    });

    // ─── GET /api/v1/jobs/search (public search) ─────────────────────────────

    describe("GET /api/v1/jobs/search", () => {
        it("should work as a public endpoint", async () => {
            const res = await request(app).get("/api/v1/jobs/search");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ─── ADMIN role still works ───────────────────────────────────────────────

    describe("ADMIN role backward compatibility", () => {
        it("ADMIN can still access admin applications endpoint", async () => {
            const res = await request(app)
                .get(`/api/v1/applications/admin/${jobId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            // Should return 200 (even if no applications)
            expect(res.status).toBe(200);
        });

        it("ADMIN can still access all applications", async () => {
            const res = await request(app)
                .get("/api/v1/applications")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });
    });

    // ─── ADMIN can update and delete jobs (REQ-COMPAT-ADMIN-001) ─────────────

    describe("ADMIN can update and delete jobs", () => {
        let updateDeleteJobId: string;

        beforeAll(async () => {
            // Create a fresh job owned by admin for update/delete tests
            const job = await createTestJob(adminId, { jobName: "Job To Update/Delete" });
            updateDeleteJobId = job.id;
        });

        it("ADMIN can update a job they created via PATCH /api/v1/jobs/:id", async () => {
            const res = await request(app)
                .patch(`/api/v1/jobs/${updateDeleteJobId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    jobName: "Updated Job Name",
                    jobDescription: "Updated description for backward compatibility test.",
                });

            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        });

        it("ADMIN can delete a job they created via DELETE /api/v1/jobs/:id", async () => {
            const res = await request(app)
                .delete(`/api/v1/jobs/${updateDeleteJobId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });
    });

    // ─── CANDIDATE role backward compatibility ────────────────────────────────

    describe("CANDIDATE role backward compatibility", () => {
        it("CANDIDATE can view their own applications", async () => {
            const res = await request(app)
                .get(`/api/v1/applications/user/${candidateId}`)
                .set("Authorization", `Bearer ${candidateToken}`);

            expect(res.status).toBe(200);
        });

        it("CANDIDATE cannot access employer endpoints", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidateToken}`);

            expect(res.status).toBe(403);
        });

        it("CANDIDATE cannot create employer jobs", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({
                    jobName: "Candidate Job",
                    jobType: "Full-time",
                    jobDescription: "Candidate should not be able to create jobs.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "5000",
                    maximumSalary: "8000",
                });

            expect(res.status).toBe(403);
        });
    });

    // ─── POST /api/v1/applications/:jobId/apply (REQ-COMPAT-CANDIDATE-001) ───

    describe("POST /api/v1/applications/:jobId/apply", () => {
        let applyJobId: string;

        beforeAll(async () => {
            // Use a fresh job to avoid duplicate-application conflicts
            const job = await createTestJob(adminId, { jobName: "Job For Apply Test" });
            applyJobId = job.id;
        });

        it("CANDIDATE can apply for a job", async () => {
            const res = await request(app)
                .post(`/api/v1/applications/${applyJobId}/apply`)
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({
                    fullName: "Test Candidate",
                    email: "testcandidate@example.com",
                });

            expect(res.status).toBe(201);
            expect(res.body).toBeDefined();
        });

        it("CANDIDATE cannot apply twice for the same job (duplicate prevention)", async () => {
            // Second apply attempt on the same job should fail
            const res = await request(app)
                .post(`/api/v1/applications/${applyJobId}/apply`)
                .set("Authorization", `Bearer ${candidateToken}`)
                .send({
                    fullName: "Test Candidate",
                    email: "testcandidate@example.com",
                });

            expect(res.status).toBe(400);
        });

        it("unauthenticated user cannot apply for a job", async () => {
            const res = await request(app)
                .post(`/api/v1/applications/${applyJobId}/apply`)
                .send({
                    fullName: "No Auth",
                    email: "noauth@example.com",
                });

            expect(res.status).toBe(401);
        });
    });

    // ─── Existing endpoint response format verification ───────────────────────

    describe("Existing endpoint response format verification", () => {
        it("GET /api/v1/jobs returns data array and meta pagination info", async () => {
            const res = await request(app).get("/api/v1/jobs?page=1&limit=5");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty("meta");
            expect(res.body.meta).toHaveProperty("total");
            expect(res.body.meta).toHaveProperty("page");
            expect(res.body.meta).toHaveProperty("limit");
        });

        it("GET /api/v1/jobs/:id returns job with correct fields", async () => {
            const res = await request(app).get(`/api/v1/jobs/${jobId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("id");
            expect(res.body.data).toHaveProperty("jobName");
            expect(res.body.data).toHaveProperty("jobType");
            expect(res.body.data).toHaveProperty("jobDescription");
            expect(res.body.data).toHaveProperty("minimumSalary");
            expect(res.body.data).toHaveProperty("maximumSalary");
        });

        it("GET /api/v1/applications returns data array for ADMIN", async () => {
            const res = await request(app)
                .get("/api/v1/applications")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
