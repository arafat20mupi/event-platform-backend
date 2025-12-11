/*
  Warnings:

  - Added the required column `categoryName` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "categoryName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "EventCategory"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
