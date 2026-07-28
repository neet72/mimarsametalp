-- Project meta alanları (şemada vardı, migrate geçmişinde yoktu)
ALTER TABLE `Project` ADD COLUMN `status` VARCHAR(191) NULL,
    ADD COLUMN `year` INTEGER NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `areaM2` INTEGER NULL;

-- Hakkımızda CMS (SiteContent tablosu şemada vardı, migrate dosyası yoktu)
CREATE TABLE `SiteContent` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `data` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `SiteContent_key_locale_key` ON `SiteContent`(`key`, `locale`);
CREATE INDEX `SiteContent_key_locale_idx` ON `SiteContent`(`key`, `locale`);
