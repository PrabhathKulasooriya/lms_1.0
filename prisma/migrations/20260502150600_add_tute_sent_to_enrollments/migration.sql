-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "tute_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tute_sent_at" TIMESTAMPTZ(6);
