-- CreateEnum
CREATE TYPE "MaintenanceMethod" AS ENUM ('HOTLINE', 'PORTAL');

-- AlterTable
ALTER TABLE "property_content" ADD COLUMN     "maintenanceMethod" "MaintenanceMethod";

-- CreateTable
CREATE TABLE "site_setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_setting_pkey" PRIMARY KEY ("key")
);
