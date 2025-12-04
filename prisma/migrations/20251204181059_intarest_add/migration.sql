/*
  Warnings:

  - You are about to drop the column `interests` on the `hosts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hosts" DROP COLUMN "interests";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "interests" TEXT[];
