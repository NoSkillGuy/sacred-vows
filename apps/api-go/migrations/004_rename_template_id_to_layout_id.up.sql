-- Rename template_id column to layout_id in invitations table
ALTER TABLE "invitations" 
RENAME COLUMN "template_id" TO "layout_id";


