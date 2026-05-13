package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/models"
)

// GET /api/v1/user/profile
func GetProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// PUT /api/v1/user/profile
func UpdateProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var input struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Phone != "" {
		user.Phone = input.Phone
	}

	DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// GET /api/v1/user/bank-accounts
func GetBankAccounts(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var accounts []models.BankAccount
	if err := DB.Where("user_id = ?", userID).Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bank accounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"accounts": accounts})
}

type BankAccountInput struct {
	BankName      string `json:"bank_name" binding:"required"`
	AccountNumber string `json:"account_number" binding:"required"`
	AccountName   string `json:"account_name" binding:"required"`
}

// POST /api/v1/user/bank-accounts
func CreateBankAccount(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input BankAccountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account := models.BankAccount{
		UserID:        userID,
		BankName:      input.BankName,
		AccountNumber: input.AccountNumber,
		AccountName:   input.AccountName,
	}

	if err := DB.Create(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bank account"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"account": account})
}

// DELETE /api/v1/user/bank-accounts/:id
func DeleteBankAccount(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var account models.BankAccount
	if err := DB.First(&account, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bank account not found"})
		return
	}

	if account.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission"})
		return
	}

	DB.Delete(&account)
	c.JSON(http.StatusOK, gin.H{"message": "Bank account deleted"})
}
