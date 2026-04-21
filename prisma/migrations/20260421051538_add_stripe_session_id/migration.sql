/*
  Warnings:

  - A unique constraint covering the columns `[stripe_session_id]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "stripe_session_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "purchases_stripe_session_id_key" ON "purchases"("stripe_session_id");
