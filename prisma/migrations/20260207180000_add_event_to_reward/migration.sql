-- AlterTable
ALTER TABLE "Reward" ADD COLUMN "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Reward_eventId_idx" ON "Reward"("eventId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
