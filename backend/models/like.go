package models

import (
	"time"
)

type Like struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:idx_user_review_like" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReviewID  uint      `gorm:"not null;uniqueIndex:idx_user_review_like" json:"review_id"`
	Review    Review    `gorm:"foreignKey:ReviewID" json:"review,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
