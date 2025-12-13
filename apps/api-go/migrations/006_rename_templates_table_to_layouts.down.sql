-- Revert: Rename layouts table back to templates
-- This migration reverts the table rename from "layouts" back to "templates"

ALTER TABLE "layouts" RENAME TO "templates";
