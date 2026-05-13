package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/models"
)

// POST /api/v1/bookings/:id/pay — User thanh toán booking
func PayBooking(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var booking models.BookingRequest
	if err := DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	if booking.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission"})
		return
	}

	if booking.Status != models.BookingStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending bookings can be paid"})
		return
	}

	// Tạo payment record (giả lập internet banking)
	payment := models.Payment{
		BookingRequestID: booking.ID,
		Amount:           booking.TotalPrice,
		Status:           models.PaymentStatusSuccess, // Assume success for simulation
		TransactionID:    "TXN-" + id + "-" + "000001",
	}

	if err := DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	// Cập nhật trạng thái booking
	booking.Status = models.BookingStatusPaid
	DB.Save(&booking)

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment successful",
		"payment": payment,
		"booking": booking,
	})
}

// GET /api/v1/admin/revenue — Admin xem doanh thu
func AdminGetRevenue(c *gin.Context) {
	type RevenueResult struct {
		TotalRevenue  float64 `json:"total_revenue"`
		TotalBookings int64   `json:"total_bookings"`
		TotalPayments int64   `json:"total_payments"`
	}

	var result RevenueResult

	DB.Model(&models.Payment{}).
		Where("status = ?", models.PaymentStatusSuccess).
		Select("COALESCE(SUM(amount), 0) as total_revenue, COUNT(*) as total_payments").
		Scan(&result)

	DB.Model(&models.BookingRequest{}).
		Where("status = ?", models.BookingStatusPaid).
		Count(&result.TotalBookings)

	// Monthly revenue breakdown
	type MonthlyRevenue struct {
		Month  string  `json:"month"`
		Amount float64 `json:"amount"`
	}
	var monthly []MonthlyRevenue
	DB.Model(&models.Payment{}).
		Where("status = ?", models.PaymentStatusSuccess).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, SUM(amount) as amount").
		Group("month").
		Order("month desc").
		Limit(12).
		Scan(&monthly)

	c.JSON(http.StatusOK, gin.H{
		"summary": result,
		"monthly": monthly,
	})
}
