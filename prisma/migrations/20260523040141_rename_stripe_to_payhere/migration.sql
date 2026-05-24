/*
  Warnings:

  - You are about to drop the column `stripe_session_id` on the `purchases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payment_reference]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "purchases_stripe_session_id_key";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "stripe_session_id",
ADD COLUMN     "payment_reference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "purchases_payment_reference_key" ON "purchases"("payment_reference");
