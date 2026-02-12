-- CreateTable
CREATE TABLE "CampaignMedia" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignMedia_campaignId_idx" ON "CampaignMedia"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignMedia_mediaAssetId_idx" ON "CampaignMedia"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMedia_campaignId_mediaAssetId_key" ON "CampaignMedia"("campaignId", "mediaAssetId");

-- AddForeignKey
ALTER TABLE "CampaignMedia" ADD CONSTRAINT "CampaignMedia_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMedia" ADD CONSTRAINT "CampaignMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
