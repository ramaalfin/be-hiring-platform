import "dotenv/config";
import prisma from "../prisma/client";

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up database after all tests
afterAll(async () => {
    await prisma.$disconnect();
});
