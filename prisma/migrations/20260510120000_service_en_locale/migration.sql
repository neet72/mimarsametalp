-- AlterTable — Service İngilizce metin alanları (görsel/slug tek)
ALTER TABLE `Service` ADD COLUMN `titleEn` VARCHAR(191) NULL,
ADD COLUMN `shortDescriptionEn` LONGTEXT NULL,
ADD COLUMN `scopeEn` LONGTEXT NULL,
ADD COLUMN `processEn` LONGTEXT NULL,
ADD COLUMN `faqEn` LONGTEXT NULL;
