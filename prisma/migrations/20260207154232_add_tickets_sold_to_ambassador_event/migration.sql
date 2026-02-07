-- AlterTable
ALTER TABLE "AmbassadorEvent" ADD COLUMN "ticketsSold" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AmbassadorEvent" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);
