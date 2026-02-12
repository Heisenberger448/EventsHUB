-- CreateTable
CREATE TABLE "PreRegistration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "salesLiveAt" TIMESTAMP(3) NOT NULL,
    "campaignCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreRegistrationEntry" (
    "id" TEXT NOT NULL,
    "preRegistrationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '+31',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreRegistrationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreRegistration_slug_key" ON "PreRegistration"("slug");

-- CreateIndex
CREATE INDEX "PreRegistration_organizationId_idx" ON "PreRegistration"("organizationId");

-- CreateIndex
CREATE INDEX "PreRegistration_eventId_idx" ON "PreRegistration"("eventId");

-- CreateIndex
CREATE INDEX "PreRegistration_slug_idx" ON "PreRegistration"("slug");

-- CreateIndex
CREATE INDEX "PreRegistrationEntry_preRegistrationId_idx" ON "PreRegistrationEntry"("preRegistrationId");

-- CreateIndex
CREATE INDEX "PreRegistrationEntry_email_idx" ON "PreRegistrationEntry"("email");

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRegistrationEntry" ADD CONSTRAINT "PreRegistrationEntry_preRegistrationId_fkey" FOREIGN KEY ("preRegistrationId") REFERENCES "PreRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
