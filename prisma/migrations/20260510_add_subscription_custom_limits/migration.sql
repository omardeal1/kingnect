-- AlterTable: Add customLimits to Subscription model
ALTER TABLE "Subscription" ADD COLUMN "customLimits" TEXT NOT NULL DEFAULT '{}';
