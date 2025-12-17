-- Add published_sites table for subdomain publishing

CREATE TABLE IF NOT EXISTS published_sites (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  current_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_published_sites_invitation
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
  CONSTRAINT fk_published_sites_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_published_sites_subdomain ON published_sites(subdomain);
CREATE INDEX IF NOT EXISTS idx_published_sites_invitation_id ON published_sites(invitation_id);
CREATE INDEX IF NOT EXISTS idx_published_sites_owner_user_id ON published_sites(owner_user_id);


