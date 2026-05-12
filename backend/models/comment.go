package models

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UserID          uint           `gorm:"not null" json:"user_id"`
	User            User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewID        uint           `gorm:"not null" json:"review_id"`
	ParentCommentID *uint          `json:"parent_comment_id"` // Nullable for top-level comments
	ParentComment   *Comment       `gorm:"foreignKey:ParentCommentID" json:"parent_comment,omitempty"`
	Replies         []Comment      `gorm:"foreignKey:ParentCommentID" json:"replies,omitempty"`
	Content         string         `gorm:"not null" json:"content"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
