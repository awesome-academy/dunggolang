package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/models"
)

type ReviewInput struct {
	TargetType models.ReviewTargetType `json:"target_type" binding:"required"`
	TargetID   uint                    `json:"target_id" binding:"required"`
	Content    string                  `json:"content" binding:"required"`
	Rating     int                     `json:"rating" binding:"required,min=1,max=5"`
}

// POST /api/v1/reviews — User tạo review
func CreateReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input ReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review := models.Review{
		UserID:     userID,
		TargetType: input.TargetType,
		TargetID:   input.TargetID,
		Content:    input.Content,
		Rating:     input.Rating,
	}

	if err := DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"review": review})
}

// GET /api/v1/reviews — Xem review (Guest/User)
func GetReviews(c *gin.Context) {
	var reviews []models.Review

	query := DB.Preload("User")

	targetType := c.Query("target_type")
	targetID := c.Query("target_id")

	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}

	if err := query.Order("created_at desc").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// PUT /api/v1/reviews/:id — User sửa review của mình
func UpdateReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var review models.Review
	if err := DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission"})
		return
	}

	var input struct {
		Content string `json:"content"`
		Rating  int    `json:"rating" binding:"min=1,max=5"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Content != "" {
		review.Content = input.Content
	}
	if input.Rating > 0 {
		review.Rating = input.Rating
	}

	DB.Save(&review)
	c.JSON(http.StatusOK, gin.H{"review": review})
}

// DELETE /api/v1/reviews/:id — User xoá review của mình
func DeleteReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var review models.Review
	if err := DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission"})
		return
	}

	DB.Delete(&review)
	c.JSON(http.StatusOK, gin.H{"message": "Review deleted"})
}

// POST /api/v1/reviews/:id/like — User like review
func LikeReview(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	reviewID := c.Param("id")

	// Kiểm tra đã like chưa
	var existing models.Like
	if err := DB.Where("user_id = ? AND review_id = ?", userID, reviewID).First(&existing).Error; err == nil {
		// Đã like rồi -> unlike
		DB.Delete(&existing)
		DB.Model(&models.Review{}).Where("id = ?", reviewID).UpdateColumn("likes_count", DB.Raw("likes_count - 1"))
		c.JSON(http.StatusOK, gin.H{"message": "Unliked"})
		return
	}

	like := models.Like{
		UserID:   userID,
		ReviewID: func() uint { var id uint; DB.Raw("SELECT id FROM reviews WHERE id = ?", reviewID).Scan(&id); return id }(),
	}
	DB.Create(&like)
	DB.Model(&models.Review{}).Where("id = ?", reviewID).UpdateColumn("likes_count", DB.Raw("likes_count + 1"))

	c.JSON(http.StatusOK, gin.H{"message": "Liked"})
}

// POST /api/v1/reviews/:id/comments — Tạo comment
func CreateComment(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	reviewID := c.Param("id")

	var input struct {
		Content         string `json:"content" binding:"required"`
		ParentCommentID *uint  `json:"parent_comment_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var rID uint
	DB.Raw("SELECT id FROM reviews WHERE id = ?", reviewID).Scan(&rID)
	if rID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	comment := models.Comment{
		UserID:          userID,
		ReviewID:        rID,
		ParentCommentID: input.ParentCommentID,
		Content:         input.Content,
	}

	if err := DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"comment": comment})
}

// GET /api/v1/reviews/:id/comments — Lấy comments của review
func GetComments(c *gin.Context) {
	reviewID := c.Param("id")

	var comments []models.Comment
	if err := DB.Preload("User").
		Where("review_id = ? AND parent_comment_id IS NULL", reviewID).
		Preload("Replies.User").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

// --- Admin ---

// GET /api/v1/admin/reviews — Admin xem và quản lý review
func AdminGetReviews(c *gin.Context) {
	var reviews []models.Review
	if err := DB.Preload("User").Order("created_at desc").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// DELETE /api/v1/admin/reviews/:id — Admin xoá review
func AdminDeleteReview(c *gin.Context) {
	id := c.Param("id")
	var review models.Review
	if err := DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}
	DB.Delete(&review)
	c.JSON(http.StatusOK, gin.H{"message": "Review deleted by admin"})
}
