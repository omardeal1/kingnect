-- Admin Panel Overhaul: Schema changes
-- mustChangePassword on User, extraFeatures on Subscription, isActive on Role, sectionOrder on MiniSite

-- 1. Add mustChangePassword to User (may already exist from previous migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'mustChangePassword') THEN
    ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Add extraFeatures to Subscription
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Subscription' AND column_name = 'extraFeatures') THEN
    ALTER TABLE "Subscription" ADD COLUMN "extraFeatures" TEXT NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- 3. Add isActive to Role
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Role' AND column_name = 'isActive') THEN
    ALTER TABLE "Role" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- 4. Add sectionOrder to MiniSite (may already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'MiniSite' AND column_name = 'sectionOrder') THEN
    ALTER TABLE "MiniSite" ADD COLUMN "sectionOrder" TEXT NOT NULL DEFAULT '[]';
  END IF;
END $$;
