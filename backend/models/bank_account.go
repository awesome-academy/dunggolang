package models

import (
	"time"

	"gorm.io/gorm"
)

type BankAccount struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        uint           `json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	BankName      string         `gorm:"not null" json:"bank_name"`
	AccountNumber string         `gorm:"not null" json:"account_number"`
	AccountName   string         `gorm:"not null" json:"account_name"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
