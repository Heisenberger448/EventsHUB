-- AlterTable: Add deviceToken to User
ALTER TABLE "User" ADD COLUMN "deviceToken" TEXT;

-- AlterTable: Add sentAt to Campaign
ALTER TABLE "Campaign" ADD COLUMN "sentAt" TIMESTAMP(3);
