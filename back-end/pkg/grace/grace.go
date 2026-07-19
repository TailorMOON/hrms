package grace

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Serve will run HTTP server with graceful shutdown capability
func Serve(port string, h http.Handler) error {

	// create new http server object
	server := &http.Server{
		ReadTimeout:  180 * time.Second,
		WriteTimeout: 180 * time.Second,
		Handler:      h,
	}

	lis, err := net.Listen("tcp", port)
	if err != nil {
		return err
	}

	idleConnsClosed := make(chan struct{})
	go func() {

		signals := make(chan os.Signal, 1)

		signal.Notify(signals, os.Interrupt, syscall.SIGTERM, syscall.SIGHUP)
		<-signals

		// We received an os signal, shut down.
		if err := server.Shutdown(context.Background()); err != nil {
			// Error from closing listeners, or context timeout:
			log.Printf("HTTP server shutdown error: %v", err)
		}

		close(idleConnsClosed)
	}()

	// Serve our metrics.
	metricsAddr := ":9090"
	go func() {
		log.Println("HTTP metric running on port", metricsAddr)
		if err := http.ListenAndServe(metricsAddr, promhttp.Handler()); err != nil {
			log.Printf("Metrics listener shutdown error: %v", err)
		}
	}()

	log.Println("HTTP server running on port", port)
	if err := server.Serve(lis); err != http.ErrServerClosed {
		// Error starting or closing listener:
		return err
	}

	<-idleConnsClosed
	log.Println("HTTP server shutdown gracefully")
	log.Println("HTTP metric shutdown gracefully")

	return nil
}
