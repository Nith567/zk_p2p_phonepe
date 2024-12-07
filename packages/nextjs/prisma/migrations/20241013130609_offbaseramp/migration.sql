/*
  Warnings:

  - Added the required column `email` to the `Sell` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sell` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    MODIFY `text` VARCHAR(191) NULL;
