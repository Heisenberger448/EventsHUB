-- AlterTable: Add channel toggle booleans to Campaign
ALTER TABLE "Campaign" ADD COLUMN "sendWhatsApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Campaign" ADD COLUMN "sendAppNotification" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Campaign" ADD COLUMN "sendInApp" BOOLEAN NOT NULL DEFAULT false;
