-- CreateTable
CREATE TABLE `Attachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestadorId` BIGINT NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Attachment_prestadorId_fkey`(`prestadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
