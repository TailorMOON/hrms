package http

import (
	"backend/internal/entity"
	"backend/internal/service"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type AttendanceHandler struct {
	service service.Service
}

func NewAttendanceHandler(s service.Service) *AttendanceHandler {
	return &AttendanceHandler{service: s}
}

func (h *AttendanceHandler) GetAllAttendances(w http.ResponseWriter, r *http.Request) {
	attendances, err := h.service.GetAllAttendances(r.Context())
	if err != nil {
		log.Printf("Error fetching attendances: %v", err)
		http.Error(w, "Failed to fetch attendances", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(attendances)
}

func (h *AttendanceHandler) GetAttendanceByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid attendance ID", http.StatusBadRequest)
		return
	}

	attendance, err := h.service.GetAttendanceByID(r.Context(), id)
	if err != nil {
		log.Printf("Error fetching attendance by ID: %v", err)
		http.Error(w, "Failed to fetch attendance", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(attendance)
}

func (h *AttendanceHandler) GetAttendanceByDate(w http.ResponseWriter, r *http.Request) {
	employeeID := chi.URLParam(r, "employee_id")

	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	if startDateStr == "" || endDateStr == "" {
		http.Error(w, "Start date and end date are required", http.StatusBadRequest)
		return
	}

	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 30
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	attendances, err := h.service.GetAttendanceByDate(r.Context(), employeeID, startDateStr, endDateStr, limit, offset)
	if err != nil {
		log.Printf("Error fetching attendance by date: %v", err)
		http.Error(w, "Failed to fetch attendance by date", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(attendances)
}

func (h *AttendanceHandler) GetAllReqAttendance(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	attendanceRequests, err := h.service.GetAllReqAttendance(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch attendance requests", http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, req := range attendanceRequests {
		response = append(response, map[string]interface{}{
			"id":               req.ID,
			"employee_id":      req.EmployeeID,
			"request_date":     req.RequestDate.Format("2006-01-02"),
			"check_in_time":    req.CheckInTime,
			"check_out_time":   req.CheckOutTime,
			"reason":           req.Reason,
			"status":           req.Status,
			"rejection_reason": req.RejectionReason,
			"created_at":       req.CreatedAt.Format("2006-01-02 15:04:05"),
			"updated_at":       req.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AttendanceHandler) GetReqAttendanceByNIP(w http.ResponseWriter, r *http.Request) {
	employeeID := chi.URLParam(r, "employee_id")
	if employeeID == "" {
		http.Error(w, "Employee ID is required", http.StatusBadRequest)
		return
	}

	attendanceRequests, err := h.service.GetReqAttendanceByNIP(r.Context(), employeeID)
	if err != nil {
		log.Printf("Error fetching attendance requests by employee_id: %v", err)
		http.Error(w, "Failed to fetch attendance requests", http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, req := range attendanceRequests {
		response = append(response, map[string]interface{}{
			"id":               req.ID,
			"employee_id":      req.EmployeeID,
			"request_date":     req.RequestDate.Format("2006-01-02"),
			"check_in_time":    req.CheckInTime,
			"check_out_time":   req.CheckOutTime,
			"reason":           req.Reason,
			"status":           req.Status,
			"rejection_reason": req.RejectionReason,
			"created_at":       req.CreatedAt.Format("2006-01-02 15:04:05"),
			"updated_at":       req.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AttendanceHandler) CreateAttendance(w http.ResponseWriter, r *http.Request) {
    var rawAttendance struct {
        EmployeeID   string `json:"employee_id"`
        Date         string `json:"date"`
        CheckInTime  string `json:"check_in_time"`
        CheckOutTime string `json:"check_out_time"`
        IsLate       bool   `json:"is_late"`
    }

    if err := json.NewDecoder(r.Body).Decode(&rawAttendance); err != nil {
        log.Printf("Handler: Failed to decode request body: %v", err)
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    parsedDate, err := time.Parse("2006-01-02", rawAttendance.Date)
    if err != nil {
        log.Printf("Handler: Failed to parse date: %v", err)
        http.Error(w, "Invalid date format", http.StatusBadRequest)
        return
    }

    attendance := entity.Attendance{
        EmployeeID:   rawAttendance.EmployeeID,
        Date:         parsedDate,
        CheckInTime:  rawAttendance.CheckInTime,
        CheckOutTime: rawAttendance.CheckOutTime,
        IsLate:       rawAttendance.IsLate,
    }

    if err := h.service.CreateAttendance(r.Context(), attendance); err != nil {
        log.Printf("Handler: Error creating attendance: %v", err)
        http.Error(w, "Failed to create attendance", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
}

func (h *AttendanceHandler) CreateReqAttendance(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var payload struct {
		EmployeeID      string `json:"employee_id"`
		RequestDateStr  string `json:"request_date"`
		CheckInTime     string `json:"check_in_time"`
		CheckOutTime    string `json:"check_out_time"`
		Reason          string `json:"reason"`
		Status          string `json:"status"`
		RejectionReason string `json:"rejection_reason"`
	}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	requestDate, err := time.Parse("2006-01-02", payload.RequestDateStr)
	if err != nil {
		http.Error(w, "Invalid request date format", http.StatusBadRequest)
		return
	}

	attendanceRequest := entity.AttendanceRequest{
		EmployeeID:      payload.EmployeeID,
		RequestDate:     requestDate,
		CheckInTime:     payload.CheckInTime,
		CheckOutTime:    payload.CheckOutTime,
		Reason:          payload.Reason,
		Status:          payload.Status,
		RejectionReason: payload.RejectionReason,
	}

	err = h.service.CreateReqAttendance(ctx, attendanceRequest)
	if err != nil {
		http.Error(w, "Failed to create attendance request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *AttendanceHandler) UpdateAttendance(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid attendance ID", http.StatusBadRequest)
		return
	}

	var attendance entity.Attendance
	if err := json.NewDecoder(r.Body).Decode(&attendance); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	attendance.ID = id
	if err := h.service.UpdateAttendance(r.Context(), attendance); err != nil {
		log.Printf("Error updating attendance: %v", err)
		http.Error(w, "Failed to update attendance", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *AttendanceHandler) UpdateReqAttendanceStatus(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(chi.URLParam(r, "id"))
    if err != nil {
        http.Error(w, "Invalid attendance request ID", http.StatusBadRequest)
        return
    }

    var body struct {
        Status       string  `json:"status"`
        RejectReason *string `json:"rejection_reason,omitempty"`
    }

    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        log.Printf("Error decoding body: %v", err)
        http.Error(w, "Invalid body", http.StatusBadRequest)
        return
    }

    status := body.Status
    if status == "" {
        http.Error(w, "Status is required", http.StatusBadRequest)
        return
    }

    if status == "Rejected" && (body.RejectReason == nil || *body.RejectReason == "") {
        http.Error(w, "Reject reason is required for rejected status", http.StatusBadRequest)
        return
    }

    if err := h.service.UpdateReqAttendanceStatus(r.Context(), id, status, body.RejectReason); err != nil {
        log.Printf("Error updating attendance request status: %v", err)
        http.Error(w, "Failed to update attendance request status", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func (h *AttendanceHandler) DeleteAttendance(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid attendance ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteAttendance(r.Context(), id); err != nil {
		log.Printf("Error deleting attendance: %v", err)
		http.Error(w, "Failed to delete attendance", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
