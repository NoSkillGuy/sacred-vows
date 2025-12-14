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
	ID        string         `gorm:"primaryKey;type:text"`
	LayoutID  string         `gorm:"type:text;not null;default:'classic-scroll'"`
	Data      datatypes.JSON `gorm:"type:jsonb;not null"`
	UserID    string         `gorm:"type:text;not null;index"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
}

func (InvitationModel) TableName() string {
	return "invitations"
}

// LayoutModel represents the layouts table (stores layout data)
// Note: Table was renamed from "templates" to "layouts" in migration 006
type LayoutModel struct {
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

func (LayoutModel) TableName() string {
	return "layouts"
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
