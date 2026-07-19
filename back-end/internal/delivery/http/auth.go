package http

import (
	"backend/internal/service"
	hash "backend/utils"
	"backend/internal/middleware"
	"encoding/json"
	"log"
	"net/http"
)

type AuthHandler struct {
	service service.Service
}

func NewAuthHandler(s service.Service) *AuthHandler {
	return &AuthHandler{service: s}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var loginData struct {
		NIP      string `json:"nip"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		log.Printf("Error decoding login request: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	employee, err := h.service.GetEmployeeByNIP(r.Context(), loginData.NIP)
	if err != nil {
		log.Printf("Error fetching employee by NIP: %v", err)
		http.Error(w, "Invalid NIP or password", http.StatusUnauthorized)
		return
	}

	if !hash.CheckPasswordHash(loginData.Password, employee.Password) {
		log.Printf("Invalid password for NIP: %s", loginData.NIP)
		http.Error(w, "Invalid NIP or password", http.StatusUnauthorized)
		return
	}

	token, err := middleware.GenerateJWT(employee.Username)
	if err != nil {
		log.Printf("Error generating JWT: %v", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"id":employee.ID,
		"username": employee.Username,
		"is_admin": employee.IsAdmin,
	})
}
