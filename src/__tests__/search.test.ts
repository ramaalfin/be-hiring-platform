/**
 * Integration tests for Job Search Endpoint
 * Tests: GET /api/v1/jobs/search and GET /api/v1/employer/jobs/search
 */
import request from "supertest";
import app from "../app";
import prisma from "../prisma/client";
import { createTestUser, cleanupTestData } from "./helpers";

describe("Job Search Endpoint", () => {
    let employerId: string;
    const createdUserIds: string[] = [];
    const createdJobIds: string[] = [];

    beforeAll(async () => {
        // Create employer to own the test jobs
        const employer = await createTestUser({ role: "EMPLOYER", email: `employer-search-${Date.now()}@test.com` });
        employerId = employer.user.id;
        createdUserIds.push(employerId);

        // Create test jobs with various attributes
        const jobs = await Promise.all([
            prisma.job.create({
                data: {
                    jobName: "Senior React Developer",
                    jobType: "Full-time",
                    jobDescription: "We need an experienced React developer to build amazing UIs.",
                    numberOfCandidateNeeded: 2,
                    minimumSalary: "8000",
                    maximumSalary: "12000",
                    minimumProfileInformationRequired: {},
                    createdBy: employerId,
                    employerId,
                },
            }),
            prisma.job.create({
                data: {
                    jobName: "Backend Node.js Engineer",
                    jobType: "Full-time",
                    jobDescription: "Looking for a Node.js backend engineer with Express experience.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "7000",
                    maximumSalary: "10000",
                    minimumProfileInformationRequired: {},
                    createdBy: employerId,
                    employerId,
                },
            }),
            prisma.job.create({
                data: {
                    jobName: "Part-time Data Analyst",
                    jobType: "Part-time",
                    jobDescription: "Analyze data and create reports for our business team.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "3000",
                    maximumSalary: "5000",
                    minimumProfileInformationRequired: {},
                    createdBy: employerId,
                    employerId,
                },
            }),
            prisma.job.create({
                data: {
                    jobName: "Contract DevOps Engineer",
                    jobType: "Contract",
                    jobDescription: "Set up CI/CD pipelines and manage cloud infrastructure.",
                    numberOfCandidateNeeded: 1,
                    minimumSalary: "9000",
                    maximumSalary: "15000",
                    minimumProfileInformationRequired: {},
                    createdBy: employerId,
                    employerId,
                },
            }),
        ]);

        createdJobIds.push(...jobs.map((j) => j.id));
    });

    afterAll(async () => {
        // Delete jobs first
        await prisma.job.deleteMany({ where: { id: { in: createdJobIds } } });
        await cleanupTestData(createdUserIds);
    });

    // ─── GET /api/v1/jobs/search (public endpoint) ───────────────────────────

    describe("GET /api/v1/jobs/search", () => {
        it("should return all jobs when no query provided", async () => {
            const res = await request(app).get("/api/v1/jobs/search");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.meta).toBeDefined();
            expect(res.body.meta.total).toBeGreaterThanOrEqual(4);
        });

        it("should search by keyword in job name (case-insensitive)", async () => {
            const res = await request(app).get("/api/v1/jobs/search?q=react");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // Should find "Senior React Developer"
            const found = res.body.data.some((j: any) =>
                j.jobName.toLowerCase().includes("react")
            );
            expect(found).toBe(true);
        });

        it("should search by keyword in job description", async () => {
            const res = await request(app).get("/api/v1/jobs/search?q=Express");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Should find "Backend Node.js Engineer" which mentions Express in description
            const found = res.body.data.some((j: any) =>
                j.jobDescription.toLowerCase().includes("express")
            );
            expect(found).toBe(true);
        });

        it("should filter by jobType", async () => {
            const res = await request(app).get("/api/v1/jobs/search?jobType=Part-time");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // All returned jobs should be Part-time
            for (const job of res.body.data) {
                expect(job.jobType).toBe("Part-time");
            }
        });

        it("should filter by Contract jobType", async () => {
            const res = await request(app).get("/api/v1/jobs/search?jobType=Contract");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            for (const job of res.body.data) {
                expect(job.jobType).toBe("Contract");
            }
        });

        it("should support pagination", async () => {
            const res = await request(app).get("/api/v1/jobs/search?page=1&limit=2");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeLessThanOrEqual(2);
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(2);
            expect(res.body.meta.total).toBeGreaterThanOrEqual(4);
            expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(2);
        });

        it("should return second page of results", async () => {
            const page1 = await request(app).get("/api/v1/jobs/search?page=1&limit=2");
            const page2 = await request(app).get("/api/v1/jobs/search?page=2&limit=2");

            expect(page1.status).toBe(200);
            expect(page2.status).toBe(200);

            // Pages should have different jobs
            const page1Ids = page1.body.data.map((j: any) => j.id);
            const page2Ids = page2.body.data.map((j: any) => j.id);

            const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
            expect(overlap.length).toBe(0);
        });

        it("should return empty array for non-matching keyword", async () => {
            const res = await request(app).get("/api/v1/jobs/search?q=xyznonexistentjob12345");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(0);
        });

        it("should work without authentication (public endpoint)", async () => {
            // No Authorization header
            const res = await request(app).get("/api/v1/jobs/search?q=developer");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return pagination metadata", async () => {
            const res = await request(app).get("/api/v1/jobs/search?page=1&limit=10");

            expect(res.status).toBe(200);
            expect(res.body.meta).toBeDefined();
            expect(res.body.meta).toHaveProperty("total");
            expect(res.body.meta).toHaveProperty("page");
            expect(res.body.meta).toHaveProperty("limit");
            expect(res.body.meta).toHaveProperty("totalPages");
            expect(res.body.meta).toHaveProperty("hasNextPage");
            expect(res.body.meta).toHaveProperty("hasPrevPage");
        });
    });

    // ─── GET /api/v1/employer/jobs/search (employer search endpoint) ─────────

    describe("GET /api/v1/employer/jobs/search", () => {
        it("should return jobs without authentication (public endpoint)", async () => {
            const res = await request(app).get("/api/v1/employer/jobs/search");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should search by keyword", async () => {
            const res = await request(app).get("/api/v1/employer/jobs/search?q=Node");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
