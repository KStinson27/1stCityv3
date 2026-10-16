-- CreateEnum
CREATE TYPE "UnitAvailabilityStatus" AS ENUM ('AVAILABLE', 'WAITLIST', 'FULL', 'CONTACT');

-- CreateTable
CREATE TABLE "unit_availability" (
    "id" TEXT NOT NULL,
    "propertySlug" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "status" "UnitAvailabilityStatus" NOT NULL DEFAULT 'CONTACT',
    "rent" TEXT,
    "availability" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "unit_availability_propertySlug_idx" ON "unit_availability"("propertySlug");

-- CreateIndex
CREATE UNIQUE INDEX "unit_availability_propertySlug_unitType_key" ON "unit_availability"("propertySlug", "unitType");
