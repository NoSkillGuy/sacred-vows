package domain

import "time"

// PublishedSite maps a subdomain (and later custom domains) to an invitation and a published snapshot version.
type PublishedSite struct {
	ID             string
	InvitationID   string
	OwnerUserID    string
	Subdomain      string
	Published      bool
	CurrentVersion int
	CreatedAt      time.Time
	UpdatedAt      time.Time
	PublishedAt    *time.Time
}

func (p *PublishedSite) Validate() error {
	if p.InvitationID == "" {
		return ErrInvalidInvitationID
	}
	if p.OwnerUserID == "" {
		return ErrInvalidUserID
	}
	if p.Subdomain == "" {
		return ErrInvalidSubdomain
	}
	return nil
}
