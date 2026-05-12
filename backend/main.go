package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/sun-prj3/backend/controllers"
	"github.com/sun-prj3/backend/middlewares"
	"github.com/sun-prj3/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func initDB() {
	dsn := "host=localhost user=root password=password dbname=sun_booking port=5433 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	// Auto Migrate
	err = DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Share DB instance
	controllers.DB = DB

	log.Println("Database connection established and migrated")
}

func main() {
	initDB()

	r := gin.Default()
	
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		// Example protected route
		user := api.Group("/user").Use(middlewares.AuthMiddleware())
		{
			user.GET("/profile", func(c *gin.Context) {
				userID := c.MustGet("user_id")
				c.JSON(200, gin.H{"message": "Welcome", "user_id": userID})
			})
		}
		
		// Example admin protected route
		admin := api.Group("/admin").Use(middlewares.AuthMiddleware(models.RoleAdmin))
		{
			admin.GET("/dashboard", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Welcome Admin"})
			})
		}
	}

	r.Run(":8080")
}
