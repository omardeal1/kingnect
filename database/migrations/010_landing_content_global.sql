-- Migration: Allow LandingContent.siteId to be nullable for global landing page content
-- This allows creating landing content sections that aren't tied to a specific MiniSite

-- Make siteId nullable
ALTER TABLE "LandingContent" ALTER COLUMN "siteId" DROP NOT NULL;

-- Drop the old unique constraint on siteId (each sectionKey is already unique)
-- Note: PostgreSQL may auto-create an index for the FK, so we handle both cases
DROP INDEX IF EXISTS "LandingContent_siteId_key";

-- Add index on siteId for querying by site
CREATE INDEX IF NOT EXISTS "LandingContent_siteId_idx" ON "LandingContent"("siteId");
