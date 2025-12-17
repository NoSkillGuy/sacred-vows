DROP INDEX IF EXISTS "idx_refresh_tokens_hmac_key_id";
DROP INDEX IF EXISTS "refresh_tokens_token_fingerprint_key";

ALTER TABLE "refresh_tokens"
  DROP COLUMN IF EXISTS "hmac_key_id",
  DROP COLUMN IF EXISTS "token_fingerprint";


