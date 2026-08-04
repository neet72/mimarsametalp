-- CreateEnum
CREATE TYPE "ClientProjectCategory" AS ENUM ('BELEDIYE', 'MIMAR', 'DIGER', 'YAPI_DENETIM');

-- CreateEnum
CREATE TYPE "ClientTransactionType" AS ENUM ('PROJECT_FEE', 'PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ClientAttachmentKind" AS ENUM ('FILE', 'EXTERNAL_LINK');

-- AlterTable
ALTER TABLE "ClientProject" ADD COLUMN "category" "ClientProjectCategory" NOT NULL DEFAULT 'DIGER';

-- AlterTable
ALTER TABLE "ClientProjectUpdate" ADD COLUMN "eventDate" TIMESTAMP(3);

-- Backfill eventDate from publishedAt or createdAt
UPDATE "ClientProjectUpdate"
SET "eventDate" = COALESCE("publishedAt", "createdAt")
WHERE "eventDate" IS NULL;

-- CreateTable
CREATE TABLE "ClientProjectTransaction" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ClientTransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProjectTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectAttachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "ClientAttachmentKind" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT,
    "mimeType" TEXT,
    "uploadedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientProject_category_idx" ON "ClientProject"("category");

-- CreateIndex
CREATE INDEX "ClientProjectTransaction_projectId_eventDate_idx" ON "ClientProjectTransaction"("projectId", "eventDate");

-- CreateIndex
CREATE INDEX "ClientProjectAttachment_projectId_createdAt_idx" ON "ClientProjectAttachment"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientProjectUpdate_projectId_eventDate_idx" ON "ClientProjectUpdate"("projectId", "eventDate");

-- AddForeignKey
ALTER TABLE "ClientProjectTransaction" ADD CONSTRAINT "ClientProjectTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectAttachment" ADD CONSTRAINT "ClientProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
