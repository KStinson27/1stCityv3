-- CreateTable
CREATE TABLE "property_content" (
    "propertySlug" TEXT NOT NULL,
    "description" TEXT,
    "amenities" TEXT[],
    "incomeLimits" JSONB,
    "requiredDocuments" TEXT[],
    "applyUrl" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_content_pkey" PRIMARY KEY ("propertySlug")
);

-- CreateTable
CREATE TABLE "property_photo" (
    "id" TEXT NOT NULL,
    "propertySlug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_photo_propertySlug_idx" ON "property_photo"("propertySlug");
