-- AlterTable: Add Twilio fields to WhatsAppIntegration
ALTER TABLE "WhatsAppIntegration" ADD COLUMN "twilioPhoneNumberSid" TEXT;
ALTER TABLE "WhatsAppIntegration" ADD COLUMN "twilioProvisioned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TwilioConfig" (
    "id" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwilioConfig_pkey" PRIMARY KEY ("id")
);
