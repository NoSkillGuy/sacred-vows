-- Add manifest JSONB column to templates table
ALTER TABLE "templates" 
ADD COLUMN IF NOT EXISTS "manifest" JSONB;

-- Update config column to allow NULL (if it was NOT NULL, keep it as is)
-- The config column is already nullable, so no change needed
