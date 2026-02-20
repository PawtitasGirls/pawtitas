-- CreateTable
CREATE TABLE `MascotaFoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mascotaId` BIGINT NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MascotaFoto_mascotaId_fkey`(`mascotaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MascotaFoto` ADD CONSTRAINT `MascotaFoto_mascotaId_fkey` FOREIGN KEY (`mascotaId`) REFERENCES `Mascota`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
