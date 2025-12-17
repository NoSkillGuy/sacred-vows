package domain

import "errors"

// Domain errors
var (
	ErrInvalidEmail         = errors.New("invalid email")
	ErrInvalidPassword      = errors.New("invalid password")
	ErrInvalidLayoutID      = errors.New("invalid layout ID")
	ErrInvalidUserID        = errors.New("invalid user ID")
	ErrInvalidLayoutName    = errors.New("invalid layout name")
	ErrInvalidAssetURL      = errors.New("invalid asset URL")
	ErrInvalidFilename      = errors.New("invalid filename")
	ErrInvalidInvitationID  = errors.New("invalid invitation ID")
	ErrInvalidSubdomain     = errors.New("invalid subdomain")
	ErrSubdomainTaken       = errors.New("subdomain already taken")
	ErrInvalidName          = errors.New("invalid name")
	ErrInvalidDate          = errors.New("invalid date")
	ErrInvalidAnalyticsType = errors.New("invalid analytics type")
	ErrUserNotFound         = errors.New("user not found")
	ErrUserAlreadyExists    = errors.New("user already exists")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrInvalidTokenID       = errors.New("invalid token ID")
	ErrInvalidTokenHash     = errors.New("invalid token hash")
	ErrInvalidExpiration    = errors.New("invalid expiration")
	ErrRefreshTokenNotFound = errors.New("refresh token not found")
	ErrRefreshTokenExpired  = errors.New("refresh token expired")
	ErrRefreshTokenRevoked  = errors.New("refresh token revoked")
)
