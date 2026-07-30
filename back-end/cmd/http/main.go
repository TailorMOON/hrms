package main

import (
	"backend/internal/config"
	"backend/internal/data"
	"backend/internal/delivery/http"
	"backend/internal/service"
	"backend/internal/database"
	authmw "backend/internal/middleware"
	"backend/pkg/log"
	"context"
	"fmt"
	nethttp "net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	if err := authmw.SetJWTKey(cfg.SecretKey); err != nil {
		fmt.Println("FATAL:", err)
		os.Exit(1)
	}

	// Initialize logger
	logger := log.NewLogrusLogger()
	ctx := context.Background()

	logger.Info(ctx, "Starting application...")

	// Initialize database connection
	db := database.NewDBConnection(cfg.DBDSN)
	defer db.Close()

	logger.Info(ctx, "Database connection established")

	// Initialize data layer
	dataLayer := data.New(db)

	// Initialize service layer
	svc := service.New(dataLayer, logger)

	// Initialize HTTP handler
	handler := http.NewHandler(
		svc,
		cfg.SecretKey,
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUser,
		cfg.SMTPPass,
		cfg.FromEmail,
	)

	// Initialize router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Register routes
	handler.RegisterRoutes(r)

	// Create HTTP server
	server := &nethttp.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info(ctx, fmt.Sprintf("Server starting on port %s", cfg.Port))
		if err := server.ListenAndServe(); err != nil && err != nethttp.ErrServerClosed {
			logger.Error(ctx, fmt.Sprintf("Server failed to start: %v", err))
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info(ctx, "Server is shutting down...")

	// Graceful shutdown with timeout
	ctxShutdown, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctxShutdown); err != nil {
		logger.Error(ctx, fmt.Sprintf("Server forced to shutdown: %v", err))
		os.Exit(1)
	}

	logger.Info(ctx, "Server stopped gracefully")
}