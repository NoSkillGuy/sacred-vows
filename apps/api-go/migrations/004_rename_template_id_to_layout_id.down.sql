-- Revert: Rename layoutId column back to templateId in invitations table
ALTER TABLE "invitations" 
RENAME COLUMN "layoutId" TO "templateId";
