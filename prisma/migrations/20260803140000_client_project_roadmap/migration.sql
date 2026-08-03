-- CreateTable
CREATE TABLE "ClientProjectRoadmapItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProjectRoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientProjectRoadmapItem_projectId_orderIndex_idx" ON "ClientProjectRoadmapItem"("projectId", "orderIndex");

-- CreateIndex
CREATE INDEX "ClientProjectRoadmapItem_projectId_visible_idx" ON "ClientProjectRoadmapItem"("projectId", "visible");

-- AddForeignKey
ALTER TABLE "ClientProjectRoadmapItem" ADD CONSTRAINT "ClientProjectRoadmapItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
