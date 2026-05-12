package models

import (
	"time"

	"gorm.io/gorm"
)

type ReviewTargetType string

const (
	ReviewTargetTour  ReviewTargetType = "tour"
	ReviewTargetPlace ReviewTargetType = "place"
	ReviewTargetFood  ReviewTargetType = "food"
	ReviewTargetNews  ReviewTargetType = "news"
)

type Review struct {
	ID         uint             `gorm:"primaryKey" json:"id"`
	UserID     uint             `gorm:"not null" json:"user_id"`
	User       User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TargetType ReviewTargetType `gorm:"type:varchar(20);not null" json:"target_type"`
	TargetID   uint             `gorm:"not null" json:"target_id"`
	Content    string           `gorm:"not null" json:"content"`
	Rating     int              `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"` // 1-5 stars
	LikesCount int              `gorm:"default:0" json:"likes_count"`
	Comments   []Comment        `gorm:"foreignKey:ReviewID" json:"comments,omitempty"`
	CreatedAt  time.Time        `json:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at"`
	DeletedAt  gorm.DeletedAt   `gorm:"index" json:"-"`
}
