-- Drop foreign keys
ALTER TABLE "analytics" DROP CONSTRAINT IF EXISTS "analytics_invitationId_fkey";
ALTER TABLE "rsvp_responses" DROP CONSTRAINT IF EXISTS "rsvp_responses_invitationId_fkey";
ALTER TABLE "assets" DROP CONSTRAINT IF EXISTS "assets_userId_fkey";
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_userId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "users_email_key";

-- Drop tables
DROP TABLE IF EXISTS "analytics";
DROP TABLE IF EXISTS "rsvp_responses";
DROP TABLE IF EXISTS "assets";
DROP TABLE IF EXISTS "templates";
DROP TABLE IF EXISTS "invitations";
DROP TABLE IF EXISTS "users";
