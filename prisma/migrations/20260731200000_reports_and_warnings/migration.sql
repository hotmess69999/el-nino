-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('processing', 'published', 'rejected');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "publicLatitude" DOUBLE PRECISION NOT NULL,
    "publicLongitude" DOUBLE PRECISION NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialWarning" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerWarningId" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "certainty" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialWarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_contributorId_idx" ON "Report"("contributorId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "MediaAsset_reportId_idx" ON "MediaAsset"("reportId");

-- CreateIndex
CREATE INDEX "OfficialWarning_expiresAt_idx" ON "OfficialWarning"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialWarning_providerId_providerWarningId_key" ON "OfficialWarning"("providerId", "providerWarningId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
