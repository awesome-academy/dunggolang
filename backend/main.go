package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sun-prj3/backend/controllers"
	"github.com/sun-prj3/backend/middlewares"
	"github.com/sun-prj3/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func initDB() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "host=localhost user=root password=password dbname=sun_booking port=5433 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
	}
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	// Auto Migrate all tables
	err = DB.AutoMigrate(
		&models.User{},
		&models.BankAccount{},
		&models.Category{},
		&models.Tour{},
		&models.BookingRequest{},
		&models.Payment{},
		&models.Review{},
		&models.Comment{},
		&models.Like{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Share DB instance
	controllers.DB = DB

	log.Println("Database connection established and migrated")
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	initDB()
	controllers.InitOauth()

	r := gin.Default()
	
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			
			// OAuth Routes
			auth.GET("/google", controllers.GoogleLogin)
			auth.GET("/google/callback", controllers.GoogleCallback)
		}

		// Example protected route
		user := api.Group("/user").Use(middlewares.AuthMiddleware())
		{
			user.GET("/profile", func(c *gin.Context) {
				userID := c.MustGet("user_id")
				c.JSON(200, gin.H{"message": "Welcome", "user_id": userID})
			})
		}
		
		// Public Routes (Guest)
		public := api.Group("/")
		{
			public.GET("/categories", controllers.GetCategories)
			public.GET("/categories/:id", controllers.GetCategoryByID)
			
			public.GET("/tours", controllers.GetTours)
			public.GET("/tours/:id", controllers.GetTourByID)
		}

		// Admin user management routes
		admin := api.Group("/admin").Use(middlewares.AuthMiddleware(models.RoleAdmin))
		{
			admin.GET("/dashboard", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Welcome Admin"})
			})
			
			// User management
			admin.GET("/users", controllers.GetUsers)
			admin.GET("/users/:id", controllers.GetUserByID)
			admin.PUT("/users/:id", controllers.UpdateUser)
			admin.DELETE("/users/:id", controllers.DeleteUser)

			// Category management
			admin.POST("/categories", controllers.CreateCategory)
			admin.PUT("/categories/:id", controllers.UpdateCategory)
			admin.DELETE("/categories/:id", controllers.DeleteCategory)

			// Tour management
			admin.POST("/tours", controllers.CreateTour)
			admin.PUT("/tours/:id", controllers.UpdateTour)
			admin.DELETE("/tours/:id", controllers.DeleteTour)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
