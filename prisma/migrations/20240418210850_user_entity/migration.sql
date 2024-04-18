/*
  Warnings:

  - You are about to drop the column `verficationCode` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,verificationCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_email_verficationCode_idx";

-- DropIndex
DROP INDEX "users_email_verficationCode_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "verficationCode",
ADD COLUMN     "verificationCode" TEXT;

-- CreateIndex
CREATE INDEX "users_email_verificationCode_idx" ON "users"("email", "verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verificationCode_key" ON "users"("email", "verificationCode");
