-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient lookups
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_revoked" ON "refresh_tokens"("revoked");

-- Add foreign key constraint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey";
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

