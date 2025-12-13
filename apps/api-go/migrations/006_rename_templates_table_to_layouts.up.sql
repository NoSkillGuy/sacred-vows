-- Rename templates table to layouts
-- This migration renames the table from "templates" to "layouts" to align with the refactoring
-- This migration must run AFTER migration 005_update_image_paths_to_layouts
-- since migration 005 references the "templates" table name

ALTER TABLE "templates" RENAME TO "layouts";
