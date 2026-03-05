-- CreateTable
CREATE TABLE "YourticketIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "organiserId" INTEGER,
    "organiserName" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YourticketIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YourticketIntegration_organizationId_key" ON "YourticketIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "YourticketIntegration_organizationId_idx" ON "YourticketIntegration"("organizationId");

-- AddForeignKey
ALTER TABLE "YourticketIntegration" ADD CONSTRAINT "YourticketIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
