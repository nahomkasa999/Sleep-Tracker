/*
  Warnings:

  - You are about to drop the column `comments` on the `sleep_entries` table. All the data in the column will be lost.
  - You are about to drop the `wellbeing_entries` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[entryDate]` on the table `sleep_entries` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "wellbeing_entries" DROP CONSTRAINT "wellbeing_entries_userId_fkey";

-- AlterTable
ALTER TABLE "sleep_entries" DROP COLUMN "comments",
ADD COLUMN     "day_rating" SMALLINT NOT NULL DEFAULT 5,
ADD COLUMN     "daycomments" TEXT,
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mood" "Mood",
ADD COLUMN     "sleepcomments" TEXT;

-- DropTable
DROP TABLE "wellbeing_entries";

-- CreateIndex
CREATE UNIQUE INDEX "sleep_entries_entryDate_key" ON "sleep_entries"("entryDate");
