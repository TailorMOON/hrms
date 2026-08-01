package http

import (
	"backend/internal/entity"
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
		NIP            string `json:"nip"`
		AttendanceDate string `json:"attendanceDate"`
		Action         string `json:"action"`
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

	attendances, err := h.Service.GetAttendanceByDate(r.Context(), requestData.NIP, requestData.AttendanceDate, requestData.AttendanceDate, 1, 0)
	if err != nil {
		http.Error(w, "Error fetching attendance data", http.StatusInternalServerError)
		log.Println("Error fetching attendance data:", err)
		return
	}

	if requestData.Action == "check-in" && len(attendances) > 0 {
		http.Error(w, "Attendance already exists for this date", http.StatusConflict)
		log.Println("Attendance already exists for NIP:", requestData.NIP)
		return
	}

	if requestData.Action == "checkout" && len(attendances) == 0 {
		http.Error(w, "No check-in record found for this date", http.StatusBadRequest)
		log.Println("No check-in found for NIP:", requestData.NIP)
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

func (h *QRCodeHandler) HandleQRCode(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Attendance     entity.Attendance `json:"attendance"`
		AttendanceType string            `json:"attendanceType"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Println("Error decoding request body:", err)
		return
	}

	if requestData.AttendanceType == "check-in" {
		log.Println("Processing check-in for employee:", requestData.Attendance.EmployeeID)

		err := h.Service.CreateAttendance(r.Context(), requestData.Attendance)
		if err != nil {
			http.Error(w, "Failed to create attendance", http.StatusInternalServerError)
			log.Println("Error creating attendance:", err)
			return
		}
	} else {
		log.Println("Processing check-out for attendance:", requestData.Attendance.ID)
		date := requestData.Attendance.Date.Format("2006-01-02")
		attendances, err := h.Service.GetAttendanceByDate(r.Context(), requestData.Attendance.EmployeeID, date, date, 1, 0)
		if err != nil {
			http.Error(w, "Failed to get attendance", http.StatusInternalServerError)
			log.Println("Error getting attendance:", err)
			return
		}
		if len(attendances) == 0 {
			http.Error(w, "Attendance not found", http.StatusNotFound)
			log.Println("Attendance not found")
			return
		}
		attendance := attendances[0]
		attendance.CheckOutTime = requestData.Attendance.CheckOutTime
		err = h.Service.UpdateAttendance(r.Context(), attendance)
		if err != nil {
			http.Error(w, "Failed to update attendance", http.StatusInternalServerError)
			log.Println("Error updating attendance:", err)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Attendance processed successfully",
		"attendanceType": requestData.AttendanceType,
	})
}
