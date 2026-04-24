-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "sequence" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;
