-- CreateTable
CREATE TABLE "WeeztixIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "companyGuid" TEXT,
    "companyName" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeztixIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeztixIntegration_organizationId_key" ON "WeeztixIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "WeeztixIntegration_organizationId_idx" ON "WeeztixIntegration"("organizationId");

-- AddForeignKey
ALTER TABLE "WeeztixIntegration" ADD CONSTRAINT "WeeztixIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
