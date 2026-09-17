-- Le nombre de postes d'une demande, et la trace des placements.
--
-- Une maison ecrit « il me faut 6 stylistes pour 6 mois » : `headcount` porte
-- le premier chiffre, `durationMonths` existait deja pour le second.
-- `filledCount` evite d'agreger les placements a chaque ligne du board.

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'ACTIVE', 'ENDED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PROFILE_TRANSMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'PLACEMENT_CREATED';

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "filledCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "headcount" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PROPOSED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "monthlyFeeXof" INTEGER,
    "monthlyPayXof" INTEGER,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "placements_applicationId_key" ON "placements"("applicationId");

-- CreateIndex
CREATE INDEX "placements_jobId_idx" ON "placements"("jobId");

-- CreateIndex
CREATE INDEX "placements_userId_status_idx" ON "placements"("userId", "status");

-- CreateIndex
CREATE INDEX "placements_status_startsAt_idx" ON "placements"("status", "startsAt");

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
