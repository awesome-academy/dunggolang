package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/models"
)

type TourInput struct {
	CategoryID  uint    `json:"category_id" binding:"required"`
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
	Duration    int     `json:"duration" binding:"required"`
	Location    string  `json:"location"`
}

func CreateTour(c *gin.Context) {
	var input TourInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tour := models.Tour{
		CategoryID:  input.CategoryID,
		Title:       input.Title,
		Description: input.Description,
		Price:       input.Price,
		Duration:    input.Duration,
		Location:    input.Location,
	}

	if err := DB.Create(&tour).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tour"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"tour": tour})
}

func GetTours(c *gin.Context) {
	var tours []models.Tour
	
	query := DB.Preload("Category")

	// Filter by search string
	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR location ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Filter by category
	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if err := query.Find(&tours).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tours"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tours": tours})
}

func GetTourByID(c *gin.Context) {
	id := c.Param("id")
	var tour models.Tour
	if err := DB.Preload("Category").First(&tour, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tour not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tour": tour})
}

func UpdateTour(c *gin.Context) {
	id := c.Param("id")
	var tour models.Tour
	if err := DB.First(&tour, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tour not found"})
		return
	}

	var input TourInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tour.CategoryID = input.CategoryID
	tour.Title = input.Title
	tour.Description = input.Description
	tour.Price = input.Price
	tour.Duration = input.Duration
	tour.Location = input.Location

	DB.Save(&tour)
	c.JSON(http.StatusOK, gin.H{"tour": tour})
}

func DeleteTour(c *gin.Context) {
	id := c.Param("id")
	var tour models.Tour
	if err := DB.First(&tour, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tour not found"})
		return
	}

	DB.Delete(&tour)
	c.JSON(http.StatusOK, gin.H{"message": "Tour deleted successfully"})
}
