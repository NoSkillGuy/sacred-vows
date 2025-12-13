package domain

import "errors"

// Domain errors
var (
	ErrInvalidEmail         = errors.New("invalid email")
	ErrInvalidPassword      = errors.New("invalid password")
	ErrInvalidTemplateID    = errors.New("invalid template ID")
	ErrInvalidUserID        = errors.New("invalid user ID")
	ErrInvalidTemplateName  = errors.New("invalid template name")
	ErrInvalidAssetURL      = errors.New("invalid asset URL")
	ErrInvalidFilename      = errors.New("invalid filename")
	ErrInvalidInvitationID  = errors.New("invalid invitation ID")
	ErrInvalidName          = errors.New("invalid name")
	ErrInvalidDate          = errors.New("invalid date")
	ErrInvalidAnalyticsType = errors.New("invalid analytics type")
	ErrUserNotFound         = errors.New("user not found")
	ErrUserAlreadyExists    = errors.New("user already exists")
	ErrInvalidCredentials   = errors.New("invalid credentials")
)
