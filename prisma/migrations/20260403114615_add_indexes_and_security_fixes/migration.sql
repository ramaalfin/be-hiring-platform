/*
  Warnings:

  - A unique constraint covering the columns `[jobId,userId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VerificationCode" DROP CONSTRAINT "VerificationCode_userId_fkey";

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_userId_key" ON "Application"("jobId", "userId");

-- CreateIndex
CREATE INDEX "Job_createdBy_idx" ON "Job"("createdBy");

-- CreateIndex
CREATE INDEX "Job_jobType_idx" ON "Job"("jobType");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "Job_createdBy_createdAt_idx" ON "Job"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationCode_userId_idx" ON "VerificationCode"("userId");

-- CreateIndex
CREATE INDEX "VerificationCode_type_idx" ON "VerificationCode"("type");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "VerificationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationCode_userId_type_idx" ON "VerificationCode"("userId", "type");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
