package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusSuccess  PaymentStatus = "success"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

type Payment struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	BookingRequestID uint           `gorm:"not null" json:"booking_request_id"`
	BookingRequest   BookingRequest `gorm:"foreignKey:BookingRequestID" json:"booking_request,omitempty"`
	Amount           float64        `gorm:"not null" json:"amount"`
	Status           PaymentStatus  `gorm:"type:varchar(20);default:'pending'" json:"status"`
	TransactionID    string         `json:"transaction_id"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
