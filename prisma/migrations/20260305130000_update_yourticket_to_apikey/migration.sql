-- AlterTable: Switch YourticketIntegration from email/password to API key auth
ALTER TABLE "YourticketIntegration" DROP COLUMN IF EXISTS "email";
ALTER TABLE "YourticketIntegration" DROP COLUMN IF EXISTS "password";
ALTER TABLE "YourticketIntegration" DROP COLUMN IF EXISTS "accessToken";
ALTER TABLE "YourticketIntegration" DROP COLUMN IF EXISTS "accessTokenExpiresAt";
ALTER TABLE "YourticketIntegration" DROP COLUMN IF EXISTS "accountName";

-- Add new columns
ALTER TABLE "YourticketIntegration" ADD COLUMN IF NOT EXISTS "apiKey" TEXT;
ALTER TABLE "YourticketIntegration" ADD COLUMN IF NOT EXISTS "organiserId" INTEGER;
ALTER TABLE "YourticketIntegration" ADD COLUMN IF NOT EXISTS "organiserName" TEXT;

-- Make apiKey required (set a placeholder first for any existing rows)
UPDATE "YourticketIntegration" SET "apiKey" = 'PLACEHOLDER' WHERE "apiKey" IS NULL;
ALTER TABLE "YourticketIntegration" ALTER COLUMN "apiKey" SET NOT NULL;
