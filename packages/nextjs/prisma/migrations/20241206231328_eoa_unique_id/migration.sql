/*
  Warnings:

  - A unique constraint covering the columns `[eoa]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_eoa_key` ON `User`(`eoa`);
