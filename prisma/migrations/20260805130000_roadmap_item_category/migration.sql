-- AlterTable
ALTER TABLE "ClientProjectRoadmapItem" ADD COLUMN "category" "ClientProjectCategory" NOT NULL DEFAULT 'DIGER';

-- CreateIndex
CREATE INDEX "ClientProjectRoadmapItem_projectId_category_idx" ON "ClientProjectRoadmapItem"("projectId", "category");
