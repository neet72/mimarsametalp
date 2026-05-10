-- AlterTable (MySQL — Project model İngilizce içerik alanları)
ALTER TABLE `Project` ADD COLUMN `titleEn` VARCHAR(191) NULL,
ADD COLUMN `categoryEn` VARCHAR(191) NULL,
ADD COLUMN `descriptionEn` LONGTEXT NULL,
ADD COLUMN `statusEn` VARCHAR(191) NULL,
ADD COLUMN `locationEn` VARCHAR(191) NULL;
