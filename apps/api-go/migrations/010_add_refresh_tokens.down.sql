-- Drop foreign key constraint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "idx_refresh_tokens_revoked";
DROP INDEX IF EXISTS "idx_refresh_tokens_expires_at";
DROP INDEX IF EXISTS "idx_refresh_tokens_user_id";
DROP INDEX IF EXISTS "refresh_tokens_token_hash_key";

-- Drop table
DROP TABLE IF EXISTS "refresh_tokens";

