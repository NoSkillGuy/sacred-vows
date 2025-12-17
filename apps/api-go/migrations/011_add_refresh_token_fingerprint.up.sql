-- Add deterministic refresh token fingerprint for indexed lookup (pre-prod)
-- We truncate existing tokens since plaintext tokens are not stored and cannot be backfilled.

TRUNCATE TABLE "refresh_tokens";

ALTER TABLE "refresh_tokens"
  ADD COLUMN "token_fingerprint" BYTEA NOT NULL,
  ADD COLUMN "hmac_key_id" SMALLINT NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_fingerprint_key"
  ON "refresh_tokens"("token_fingerprint");

CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_hmac_key_id"
  ON "refresh_tokens"("hmac_key_id");


