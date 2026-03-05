-- CreateTable
CREATE TABLE "TrackerPurchase" (
    "id" TEXT NOT NULL,
    "ambassadorEventId" TEXT NOT NULL,
    "ytpPurchaseId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "ticketCount" INTEGER NOT NULL DEFAULT 0,
    "secret" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackerPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackerPurchase_ytpPurchaseId_key" ON "TrackerPurchase"("ytpPurchaseId");

-- CreateIndex
CREATE INDEX "TrackerPurchase_ambassadorEventId_idx" ON "TrackerPurchase"("ambassadorEventId");

-- CreateIndex
CREATE INDEX "TrackerPurchase_email_idx" ON "TrackerPurchase"("email");

-- AddForeignKey
ALTER TABLE "TrackerPurchase" ADD CONSTRAINT "TrackerPurchase_ambassadorEventId_fkey" FOREIGN KEY ("ambassadorEventId") REFERENCES "AmbassadorEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Make trackerCode unique on AmbassadorEvent (for lookup by tracker code)
CREATE UNIQUE INDEX "AmbassadorEvent_trackerCode_key" ON "AmbassadorEvent"("trackerCode");
