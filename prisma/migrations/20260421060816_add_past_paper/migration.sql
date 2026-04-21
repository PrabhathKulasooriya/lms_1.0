/*
  Warnings:

  - Added the required column `course_id` to the `resources` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('regular', 'pastpaper');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "type" "CourseType" NOT NULL DEFAULT 'regular',
ALTER COLUMN "grade" DROP NOT NULL;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "course_id" INTEGER NOT NULL,
ALTER COLUMN "lesson_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
