package models

import (
	"time"

	"gorm.io/gorm"
)

type Tour struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CategoryID  uint           `json:"category_id"`
	Category    Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	Price       float64        `gorm:"not null" json:"price"`
	Duration    int            `json:"duration"` // Duration in days
	Location    string         `json:"location"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
