package http

import (
	"backend/internal/service"
	"backend/pkg/qrcode"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type QRCodeHandler struct {
	SecretKey string
	SMTPHost  string
	SMTPPort  string
	SMTPUser  string
	SMTPPass  string
	FromEmail string
	Service   service.Service
}

func NewQRCodeHandler(secretKey, smtpHost, smtpPort, smtpUser, smtpPass, fromEmail string, svc service.Service) *QRCodeHandler {
	return &QRCodeHandler{
		SecretKey: secretKey,
		SMTPHost:  smtpHost,
		SMTPPort:  smtpPort,
		SMTPUser:  smtpUser,
		SMTPPass:  smtpPass,
		FromEmail: fromEmail,
		Service:   svc,
	}
}

func (h *QRCodeHandler) GenerateAndSendQRCode(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		NIP string `json:"nip"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println("Error decoding request:", err)
		return
	}
	if requestData.NIP == "" {
		http.Error(w, "NIP is required", http.StatusBadRequest)
		return
	}

	employee, err := h.Service.GetEmployeeByNIP(r.Context(), requestData.NIP)
	if err != nil || employee.Email == "" {
		http.Error(w, "Employee not found or email not available", http.StatusNotFound)
		log.Println("Error fetching employee data:", err)
		return
	}

	payload := jwt.MapClaims{
		"user": requestData.NIP,
		"exp":  time.Now().Add(time.Minute * 5).Unix(),
	}

	tokenString, err := qrcode.GenerateJWT(payload, h.SecretKey)
	if err != nil {
		http.Error(w, "Failed to generate JWT", http.StatusInternalServerError)
		log.Println("Error generating JWT:", err)
		return
	}

	qrCode, err := qrcode.CreateQRCode(tokenString)
	if err != nil {
		http.Error(w, "Failed to create QR code", http.StatusInternalServerError)
		log.Println("Error creating QR code:", err)
		return
	}

	err = qrcode.SendQRCodeByEmail(qrCode, employee.Email, h.SMTPHost, h.SMTPPort, h.FromEmail, h.SMTPPass)
	if err != nil {
		http.Error(w, "Failed to send QR code via email", http.StatusInternalServerError)
		log.Println("Error sending QR code via email:", err)
		return
	}

	encodedQRCode := base64.StdEncoding.EncodeToString(qrCode)

	response := map[string]string{
		"message":      "QR code generated and sent successfully via email",
		"token":        tokenString,
		"qrCodeBase64": encodedQRCode,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
