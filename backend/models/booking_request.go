package models

import (
	"time"

	"gorm.io/gorm"
)

type BookingStatus string

const (
	BookingStatusPending   BookingStatus = "pending"
	BookingStatusPaid      BookingStatus = "paid"
	BookingStatusCancelled BookingStatus = "cancelled"
	BookingStatusCompleted BookingStatus = "completed"
)

type BookingRequest struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        uint           `gorm:"not null" json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TourID        uint           `gorm:"not null" json:"tour_id"`
	Tour          Tour           `gorm:"foreignKey:TourID" json:"tour,omitempty"`
	Status        BookingStatus  `gorm:"type:varchar(20);default:'pending'" json:"status"`
	BookingDate   time.Time      `json:"booking_date"`
	TotalPrice    float64        `gorm:"not null" json:"total_price"`
	PaymentMethod string         `json:"payment_method"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
