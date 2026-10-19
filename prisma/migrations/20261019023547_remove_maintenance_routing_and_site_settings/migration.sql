-- AlterTable
ALTER TABLE "property_content" DROP COLUMN "maintenanceMethod";

-- DropTable
DROP TABLE "site_setting";

-- DropEnum
DROP TYPE "MaintenanceMethod";
