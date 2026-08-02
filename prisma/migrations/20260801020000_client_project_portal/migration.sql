-- CreateTable
CREATE TABLE `ClientUser` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT true,
    `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    `notifySms` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ClientUser_username_key`(`username`),
    INDEX `ClientUser_email_idx`(`email`),
    INDEX `ClientUser_active_idx`(`active`),
    INDEX `ClientUser_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientProject` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `status` ENUM('PLANNING', 'PERMITTING', 'CONSTRUCTION', 'INTERIOR', 'COMPLETED') NOT NULL DEFAULT 'PLANNING',
    `coverImageUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClientProject_status_idx`(`status`),
    INDEX `ClientProject_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientProjectMember` (
    `projectId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,

    INDEX `ClientProjectMember_clientId_idx`(`clientId`),
    PRIMARY KEY (`projectId`, `clientId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientProjectStage` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `orderIndex` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'PENDING',
    `targetDate` DATETIME(3) NULL,
    `completedDate` DATETIME(3) NULL,

    INDEX `ClientProjectStage_projectId_orderIndex_idx`(`projectId`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientProjectUpdate` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClientProjectUpdate_projectId_isPublished_publishedAt_idx`(`projectId`, `isPublished`, `publishedAt`),
    INDEX `ClientProjectUpdate_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientUpdateMedia` (
    `id` VARCHAR(191) NOT NULL,
    `updateId` VARCHAR(191) NOT NULL,
    `cloudinaryUrl` TEXT NOT NULL,
    `cloudinaryPublicId` VARCHAR(191) NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    INDEX `ClientUpdateMedia_updateId_orderIndex_idx`(`updateId`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientNotificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `updateId` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `providerResponse` TEXT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClientNotificationLog_updateId_sentAt_idx`(`updateId`, `sentAt`),
    INDEX `ClientNotificationLog_clientId_sentAt_idx`(`clientId`, `sentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientDeliveryRequest` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClientDeliveryRequest_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `ClientDeliveryRequest_projectId_idx`(`projectId`),
    INDEX `ClientDeliveryRequest_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientProjectMember` ADD CONSTRAINT `ClientProjectMember_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `ClientProject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProjectMember` ADD CONSTRAINT `ClientProjectMember_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProjectStage` ADD CONSTRAINT `ClientProjectStage_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `ClientProject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProjectUpdate` ADD CONSTRAINT `ClientProjectUpdate_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `ClientProject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProjectUpdate` ADD CONSTRAINT `ClientProjectUpdate_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `ClientProjectStage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientUpdateMedia` ADD CONSTRAINT `ClientUpdateMedia_updateId_fkey` FOREIGN KEY (`updateId`) REFERENCES `ClientProjectUpdate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientNotificationLog` ADD CONSTRAINT `ClientNotificationLog_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientNotificationLog` ADD CONSTRAINT `ClientNotificationLog_updateId_fkey` FOREIGN KEY (`updateId`) REFERENCES `ClientProjectUpdate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientDeliveryRequest` ADD CONSTRAINT `ClientDeliveryRequest_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `ClientProject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientDeliveryRequest` ADD CONSTRAINT `ClientDeliveryRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
