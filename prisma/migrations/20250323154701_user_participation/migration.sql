/*
  Warnings:

  - You are about to drop the column `stakeAmount` on the `UserParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `userAddress` on the `UserParticipation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stakeKey]` on the table `UserParticipation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicKey,eventId]` on the table `UserParticipation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicKey` to the `UserParticipation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stakeAmountNo` to the `UserParticipation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stakeAmountYes` to the `UserParticipation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserParticipation_userAddress_eventId_key";

-- AlterTable
ALTER TABLE "UserParticipation" DROP COLUMN "stakeAmount",
DROP COLUMN "userAddress",
ADD COLUMN     "isChainSuccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicKey" TEXT NOT NULL,
ADD COLUMN     "stakeAmountNo" BIGINT NOT NULL,
ADD COLUMN     "stakeAmountYes" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserParticipation_stakeKey_key" ON "UserParticipation"("stakeKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserParticipation_publicKey_eventId_key" ON "UserParticipation"("publicKey", "eventId");
