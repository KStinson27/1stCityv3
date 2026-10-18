-- AlterTable
ALTER TABLE "contact_submission" ADD COLUMN     "isWaitlistSignup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "property_content" ADD COLUMN     "waitlistSignupEnabled" BOOLEAN NOT NULL DEFAULT false;
