-- CreateEnum
CREATE TYPE "ClientProjectStatus" AS ENUM ('PLANNING', 'PERMITTING', 'CONSTRUCTION', 'INTERIOR', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClientStageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "status" TEXT,
    "year" INTEGER,
    "location" TEXT,
    "titleEn" TEXT,
    "categoryEn" TEXT,
    "descriptionEn" TEXT,
    "statusEn" TEXT,
    "locationEn" TEXT,
    "areaM2" INTEGER,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ipHash" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "heroImageUrl" TEXT,
    "titleEn" TEXT,
    "shortDescriptionEn" TEXT,
    "scopeEn" TEXT DEFAULT '[]',
    "processEn" TEXT DEFAULT '[]',
    "faqEn" TEXT DEFAULT '[]',
    "scope" TEXT DEFAULT '[]',
    "process" TEXT DEFAULT '[]',
    "faq" TEXT DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientUser" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifySms" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT,
    "status" "ClientProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectMember" (
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "ClientProjectMember_pkey" PRIMARY KEY ("projectId","clientId")
);

-- CreateTable
CREATE TABLE "ClientProjectStage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "status" "ClientStageStatus" NOT NULL DEFAULT 'PENDING',
    "targetDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),

    CONSTRAINT "ClientProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stageId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProjectUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientUpdateMedia" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "cloudinaryUrl" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "caption" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClientUpdateMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientNotificationLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerResponse" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDeliveryRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientDeliveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_sortOrder_idx" ON "Project"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Project_updatedAt_idx" ON "Project"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_email_idx" ON "Message"("email");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actor_createdAt_idx" ON "AdminAuditLog"("actor", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entity_entityId_idx" ON "AdminAuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_published_sortOrder_idx" ON "Service"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Service_slug_idx" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_createdAt_idx" ON "Service"("createdAt");

-- CreateIndex
CREATE INDEX "Service_updatedAt_idx" ON "Service"("updatedAt");

-- CreateIndex
CREATE INDEX "SiteContent_key_locale_idx" ON "SiteContent"("key", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_locale_key" ON "SiteContent"("key", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_username_key" ON "ClientUser"("username");

-- CreateIndex
CREATE INDEX "ClientUser_email_idx" ON "ClientUser"("email");

-- CreateIndex
CREATE INDEX "ClientUser_active_idx" ON "ClientUser"("active");

-- CreateIndex
CREATE INDEX "ClientUser_createdAt_idx" ON "ClientUser"("createdAt");

-- CreateIndex
CREATE INDEX "ClientProject_status_idx" ON "ClientProject"("status");

-- CreateIndex
CREATE INDEX "ClientProject_createdAt_idx" ON "ClientProject"("createdAt");

-- CreateIndex
CREATE INDEX "ClientProjectMember_clientId_idx" ON "ClientProjectMember"("clientId");

-- CreateIndex
CREATE INDEX "ClientProjectStage_projectId_orderIndex_idx" ON "ClientProjectStage"("projectId", "orderIndex");

-- CreateIndex
CREATE INDEX "ClientProjectUpdate_projectId_isPublished_publishedAt_idx" ON "ClientProjectUpdate"("projectId", "isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "ClientProjectUpdate_createdAt_idx" ON "ClientProjectUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "ClientUpdateMedia_updateId_orderIndex_idx" ON "ClientUpdateMedia"("updateId", "orderIndex");

-- CreateIndex
CREATE INDEX "ClientNotificationLog_updateId_sentAt_idx" ON "ClientNotificationLog"("updateId", "sentAt");

-- CreateIndex
CREATE INDEX "ClientNotificationLog_clientId_sentAt_idx" ON "ClientNotificationLog"("clientId", "sentAt");

-- CreateIndex
CREATE INDEX "ClientDeliveryRequest_status_createdAt_idx" ON "ClientDeliveryRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ClientDeliveryRequest_projectId_idx" ON "ClientDeliveryRequest"("projectId");

-- CreateIndex
CREATE INDEX "ClientDeliveryRequest_clientId_idx" ON "ClientDeliveryRequest"("clientId");

-- AddForeignKey
ALTER TABLE "ClientProjectMember" ADD CONSTRAINT "ClientProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectMember" ADD CONSTRAINT "ClientProjectMember_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectStage" ADD CONSTRAINT "ClientProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectUpdate" ADD CONSTRAINT "ClientProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectUpdate" ADD CONSTRAINT "ClientProjectUpdate_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ClientProjectStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUpdateMedia" ADD CONSTRAINT "ClientUpdateMedia_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "ClientProjectUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNotificationLog" ADD CONSTRAINT "ClientNotificationLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNotificationLog" ADD CONSTRAINT "ClientNotificationLog_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "ClientProjectUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDeliveryRequest" ADD CONSTRAINT "ClientDeliveryRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDeliveryRequest" ADD CONSTRAINT "ClientDeliveryRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
