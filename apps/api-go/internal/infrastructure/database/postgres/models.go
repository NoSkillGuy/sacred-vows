package postgres

import (
	"time"

	"gorm.io/datatypes"
)

// UserModel represents the users table
type UserModel struct {
	ID        string    `gorm:"primaryKey;type:text"`
	Email     string    `gorm:"uniqueIndex;type:text;not null"`
	Name      *string   `gorm:"type:text"`
	Password  string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (UserModel) TableName() string {
	return "users"
}

// InvitationModel represents the invitations table
type InvitationModel struct {
	ID         string         `gorm:"primaryKey;type:text"`
	TemplateID string         `gorm:"type:text;not null;default:'royal-elegance'"`
	Data       datatypes.JSON `gorm:"type:jsonb;not null"`
	UserID     string         `gorm:"type:text;not null;index"`
	CreatedAt  time.Time      `gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime"`
}

func (InvitationModel) TableName() string {
	return "invitations"
}

// TemplateModel represents the templates table
type TemplateModel struct {
	ID           string          `gorm:"primaryKey;type:text"`
	Name         string          `gorm:"type:text;not null"`
	Description  *string         `gorm:"type:text"`
	PreviewImage *string         `gorm:"type:text"`
	Tags         datatypes.JSON  `gorm:"type:text[]"`
	Version      string          `gorm:"type:text;not null;default:'1.0.0'"`
	Config       *datatypes.JSON `gorm:"type:jsonb"`
	Manifest     *datatypes.JSON `gorm:"type:jsonb"`
	IsActive     bool            `gorm:"column:isActive;default:true"`
	CreatedAt    time.Time       `gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `gorm:"autoUpdateTime"`
}

func (TemplateModel) TableName() string {
	return "templates"
}

// AssetModel represents the assets table
type AssetModel struct {
	ID           string    `gorm:"primaryKey;type:text"`
	URL          string    `gorm:"type:text;not null"`
	Filename     string    `gorm:"type:text;not null"`
	OriginalName string    `gorm:"type:text;not null"`
	Size         int64     `gorm:"type:integer;not null"`
	MimeType     string    `gorm:"type:text;not null"`
	UserID       string    `gorm:"type:text;not null;index"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
}

func (AssetModel) TableName() string {
	return "assets"
}

// RSVPResponseModel represents the rsvp_responses table
type RSVPResponseModel struct {
	ID           string    `gorm:"primaryKey;type:text"`
	InvitationID string    `gorm:"type:text;not null;index"`
	Name         string    `gorm:"type:text;not null"`
	Date         string    `gorm:"type:text;not null"`
	Email        *string   `gorm:"type:text"`
	Phone        *string   `gorm:"type:text"`
	Message      *string   `gorm:"type:text"`
	SubmittedAt  time.Time `gorm:"autoCreateTime"`
}

func (RSVPResponseModel) TableName() string {
	return "rsvp_responses"
}

// AnalyticsModel represents the analytics table
type AnalyticsModel struct {
	ID           string    `gorm:"primaryKey;type:text"`
	InvitationID string    `gorm:"type:text;not null;index"`
	Type         string    `gorm:"type:text;not null"`
	Referrer     *string   `gorm:"type:text"`
	UserAgent    *string   `gorm:"type:text"`
	IPAddress    *string   `gorm:"type:text"`
	Timestamp    time.Time `gorm:"autoCreateTime"`
}

func (AnalyticsModel) TableName() string {
	return "analytics"
}
