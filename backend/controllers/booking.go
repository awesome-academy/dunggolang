package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/models"
)

type BookingInput struct {
	TourID        uint      `json:"tour_id" binding:"required"`
	BookingDate   time.Time `json:"booking_date" binding:"required"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
}

// POST /api/v1/bookings — User đặt tour
func CreateBooking(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input BookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra tour tồn tại
	var tour models.Tour
	if err := DB.First(&tour, input.TourID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tour not found"})
		return
	}

	booking := models.BookingRequest{
		UserID:        userID,
		TourID:        input.TourID,
		BookingDate:   input.BookingDate,
		TotalPrice:    tour.Price,
		PaymentMethod: input.PaymentMethod,
		Status:        models.BookingStatusPending,
	}

	if err := DB.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"booking": booking})
}

// GET /api/v1/bookings — User xem booking của mình
func GetMyBookings(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var bookings []models.BookingRequest
	if err := DB.Preload("Tour").Preload("Tour.Category").
		Where("user_id = ?", userID).
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}

// PUT /api/v1/bookings/:id/cancel — User huỷ tour
func CancelBooking(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var booking models.BookingRequest
	if err := DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Chỉ user sở hữu mới được hủy
	if booking.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission"})
		return
	}

	if booking.Status != models.BookingStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending bookings can be cancelled"})
		return
	}

	booking.Status = models.BookingStatusCancelled
	DB.Save(&booking)

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled", "booking": booking})
}

// --- Admin ---

// GET /api/v1/admin/bookings — Admin xem tất cả bookings
func AdminGetBookings(c *gin.Context) {
	var bookings []models.BookingRequest

	query := DB.Preload("User").Preload("Tour")

	// Filter by status
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}

// PUT /api/v1/admin/bookings/:id/status — Admin cập nhật trạng thái booking
func AdminUpdateBookingStatus(c *gin.Context) {
	id := c.Param("id")

	var booking models.BookingRequest
	if err := DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var input struct {
		Status models.BookingStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	booking.Status = input.Status
	DB.Save(&booking)

	c.JSON(http.StatusOK, gin.H{"message": "Booking status updated", "booking": booking})
}
