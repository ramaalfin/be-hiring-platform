/**
 * Integration tests for Employer Job Endpoints
 * Tests: POST /api/v1/employer/jobs, GET /api/v1/employer/jobs,
 *        PATCH /api/v1/employer/jobs/:jobId, DELETE /api/v1/employer/jobs/:jobId
 */
import request from "supertest";
import app from "../app";
import prisma from "../prisma/client";
import { createTestUser, createTestJob, cleanupTestData } from "./helpers";

describe("Employer Job Endpoints", () => {
    let employerToken: string;
    let employerId: string;
    let otherEmployerToken: string;
    let otherEmployerId: string;
    const createdUserIds: string[] = [];

    beforeAll(async () => {
        // Create employer user
        const employer = await createTestUser({ role: "EMPLOYER", email: `employer-jobs-${Date.now()}@test.com` });
        employerToken = employer.accessToken;
        employerId = employer.user.id;
        createdUserIds.push(employerId);

        // Create another employer for IDOR tests
        const otherEmployer = await createTestUser({ role: "EMPLOYER", email: `other-employer-jobs-${Date.now()}@test.com` });
        otherEmployerToken = otherEmployer.accessToken;
        otherEmployerId = otherEmployer.user.id;
        createdUserIds.push(otherEmployerId);
    });

    afterAll(async () => {
        await cleanupTestData(createdUserIds);
    });

    // ─── POST /api/v1/employer/jobs ───────────────────────────────────────────

    describe("POST /api/v1/employer/jobs", () => {
        it("should create a job successfully as employer", async () => {
            const jobData = {
                jobName: "Backend Developer",
                jobType: "Full-time",
                jobDescription: "We are looking for a skilled backend developer to join our team.",
                numberOfCandidateNeeded: 2,
                minimumSalary: "5000",
                maximumSalary: "8000",
            };

            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerToken}`)
                .send(jobData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.jobName).toBe(jobData.jobName);
            expect(res.body.data.employerId).toBe(employerId);
            expect(res.body.data.createdBy).toBe(employerId);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "Test description for this job position.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 403 when user is not EMPLOYER role", async () => {
            const candidate = await createTestUser({ role: "CANDIDATE", email: `candidate-jobs-${Date.now()}@test.com` });
            createdUserIds.push(candidate.user.id);

            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidate.accessToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "Test description for this job position.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    jobName: "Test Job",
                    // missing jobType, jobDescription, etc.
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for invalid numberOfCandidateNeeded", async () => {
            const res = await request(app)
                .post("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({
                    jobName: "Test Job",
                    jobType: "Full-time",
                    jobDescription: "Test description for this job position.",
                    numberOfCandidateNeeded: 0, // invalid: must be >= 1
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ─── GET /api/v1/employer/jobs ────────────────────────────────────────────

    describe("GET /api/v1/employer/jobs", () => {
        let jobId: string;

        beforeAll(async () => {
            const job = await createTestJob(employerId, { jobName: "List Test Job" });
            jobId = job.id;
        });

        it("should return only the employer's own jobs", async () => {
            // Create a job for the other employer
            await createTestJob(otherEmployerId, { jobName: "Other Employer Job" });

            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All returned jobs should belong to this employer
            for (const job of res.body.data) {
                expect(job.employerId).toBe(employerId);
            }
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app).get("/api/v1/employer/jobs");
            expect(res.status).toBe(401);
        });

        it("should return 403 for non-employer role", async () => {
            const candidate = await createTestUser({ role: "CANDIDATE", email: `candidate-list-${Date.now()}@test.com` });
            createdUserIds.push(candidate.user.id);

            const res = await request(app)
                .get("/api/v1/employer/jobs")
                .set("Authorization", `Bearer ${candidate.accessToken}`);

            expect(res.status).toBe(403);
        });

        it("should support pagination", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs?page=1&limit=5")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.meta).toBeDefined();
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(5);
        });

        it("should support search filter", async () => {
            const res = await request(app)
                .get("/api/v1/employer/jobs?search=List+Test+Job")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // Should find the job we created
            const found = res.body.data.some((j: any) => j.id === jobId);
            expect(found).toBe(true);
        });
    });

    // ─── PATCH /api/v1/employer/jobs/:jobId ──────────────────────────────────

    describe("PATCH /api/v1/employer/jobs/:jobId", () => {
        let jobId: string;

        beforeAll(async () => {
            const job = await createTestJob(employerId, { jobName: "Update Test Job" });
            jobId = job.id;
        });

        it("should update a job successfully", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobId}`)
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ jobName: "Updated Job Name" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.jobName).toBe("Updated Job Name");
        });

        it("should return 403 when another employer tries to update", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobId}`)
                .set("Authorization", `Bearer ${otherEmployerToken}`)
                .send({ jobName: "Hacked Job Name" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 when no token provided", async () => {
            const res = await request(app)
                .patch(`/api/v1/employer/jobs/${jobId}`)
                .send({ jobName: "No Auth Update" });

            expect(res.status).toBe(401);
        });

        it("should return 404 for non-existent job", async () => {
            const res = await request(app)
                .patch("/api/v1/employer/jobs/non-existent-job-id")
                .set("Authorization", `Bearer ${employerToken}`)
                .send({ jobName: "Updated" });

            expect(res.status).toBe(404);
        });
    });

    // ─── DELETE /api/v1/employer/jobs/:jobId ─────────────────────────────────

    describe("DELETE /api/v1/employer/jobs/:jobId", () => {
        it("should delete a job successfully", async () => {
            const job = await createTestJob(employerId, { jobName: "Delete Test Job" });

            const res = await request(app)
                .delete(`/api/v1/employer/jobs/${job.id}`)
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify job is deleted
            const deleted = await prisma.job.findUnique({ where: { id: job.id } });
            expect(deleted).toBeNull();
        });

        it("should return 403 when another employer tries to delete", async () => {
            const job = await createTestJob(employerId, { jobName: "Protected Job" });

            const res = await request(app)
                .delete(`/api/v1/employer/jobs/${job.id}`)
                .set("Authorization", `Bearer ${otherEmployerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);

            // Verify job still exists
            const stillExists = await prisma.job.findUnique({ where: { id: job.id } });
            expect(stillExists).not.toBeNull();
        });

        it("should return 401 when no token provided", async () => {
            const job = await createTestJob(employerId, { jobName: "No Auth Delete Job" });

            const res = await request(app)
                .delete(`/api/v1/employer/jobs/${job.id}`);

            expect(res.status).toBe(401);
        });

        it("should return 404 for non-existent job", async () => {
            const res = await request(app)
                .delete("/api/v1/employer/jobs/non-existent-job-id")
                .set("Authorization", `Bearer ${employerToken}`);

            expect(res.status).toBe(404);
        });
    });
});
