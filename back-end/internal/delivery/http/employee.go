package http

import (
	"backend/internal/entity"
	"backend/internal/service"
	"backend/utils"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

type EmployeeHandler struct {
	service service.Service
}

func NewEmployeeHandler(s service.Service) *EmployeeHandler {
	return &EmployeeHandler{service: s}
}

func (h *EmployeeHandler) GetAllEmployees(w http.ResponseWriter, r *http.Request) {
	employees, err := h.service.GetAllEmployees(r.Context())
	if err != nil {
		log.Printf("Error fetching employees: %v", err)
		http.Error(w, "Failed to fetch employees", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(employees)
}

func (h *EmployeeHandler) GetEmployeeByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid employee ID", http.StatusBadRequest)
		return
	}

	employee, err := h.service.GetEmployeeByID(r.Context(), id)
	if err != nil {
		log.Printf("Error fetching employee by ID: %v", err)
		http.Error(w, "Failed to fetch employee", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(employee)
}

func (h *EmployeeHandler) GetEmployeeByNIP(w http.ResponseWriter, r *http.Request) {
	nip := chi.URLParam(r, "nip")
	if nip == "" {
		http.Error(w, "Invalid employee NIP", http.StatusBadRequest)
		return
	}

	employee, err := h.service.GetEmployeeByNIP(r.Context(), nip)
	if err != nil {
		log.Printf("Error fetching employee by NIP: %v", err)
		http.Error(w, "Failed to fetch employee by NIP", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(employee); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *EmployeeHandler) GetAllReqUpdateEmployee(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	employeeRequests, err := h.service.GetAllReqUpdateEmployee(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch employee update requests", http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, req := range employeeRequests {
		response = append(response, map[string]interface{}{
			"id":                 req.ID,
			"ptid":               req.EmployeeID,
			"username":           req.Username,
			"old_username":       req.OldUsername,
			"birth_date":         req.BirthDate.Format("2006-01-02"),
			"old_birth_date":     req.OldBirthDate.Format("2006-01-02"),
			"address":            req.Address,
			"old_address":        req.OldAddress,
			"location_id":        req.LocationID,
			"old_location_id":    req.OldLocationID,
			"phone":              req.Phone,
			"old_phone":          req.OldPhone,
			"marital_status":     req.MaritalStatus,
			"old_marital_status": req.OldMaritalStatus,
			"grade_id":           req.GradeID,
			"old_grade_id":       req.OldGradeID,
			"name":               req.Name,
			"old_name":           req.OldName,
			"job_position_id":    req.JobPositionID,
			"old_job_position_id": req.OldJobPositionID,
			"email":              req.Email,
			"old_email":          req.OldEmail,
			"status":             req.Status,
			"rejection_reason":   req.RejectionReason,
			"created_at":         req.CreatedAt.Format("2006-01-02 15:04:05"),
			"updated_at":         req.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *EmployeeHandler) GetReqUpdateEmployeeByNIP(w http.ResponseWriter, r *http.Request) {
    nip := chi.URLParam(r, "nip")
    if nip == "" {
        http.Error(w, "Invalid employee NIP", http.StatusBadRequest)
        return
    }

    status, createdAt, err := h.service.GetReqUpdateEmployeeByNIP(r.Context(), nip)
    if err != nil {
        log.Printf("Error fetching request update by NIP: %v", err)
        http.Error(w, "Failed to fetch request update", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status":     status,
        "created_at": createdAt,
    })
}

func (h *EmployeeHandler) CreateEmployee(w http.ResponseWriter, r *http.Request) {
	var emp entity.Employee
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &emp); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	hashedPassword, err := utils.HashPassword(emp.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	emp.Password = hashedPassword

	emp.BirthDate, err = time.Parse("2006-01-02", emp.BirthDateStr)
	if err != nil {
		log.Printf("Error parsing birth_date: %v", err)
		http.Error(w, "Invalid birth_date format", http.StatusBadRequest)
		return
	}

	emp.JoinDate, err = time.Parse("2006-01-02", emp.JoinDateStr)
	if err != nil {
		log.Printf("Error parsing join_date: %v", err)
		http.Error(w, "Invalid join_date format", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateEmployee(r.Context(), emp); err != nil {
		log.Printf("Error creating employee: %v", err)
		http.Error(w, "Failed to create employee", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *EmployeeHandler) CreateReqUpdateEmployee(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var payload struct {
		PTID            string `json:"ptid"`
		Username        string `json:"username"`
		OldUsername     string `json:"old_username"`
		BirthDateStr    string `json:"birth_date"`
		OldBirthDateStr string `json:"old_birth_date"`
		Address         string `json:"address"`
		OldAddress      string `json:"old_address"`
		LocationID      int    `json:"location_id"`
		OldLocationID   int    `json:"old_location_id"`
		Phone           string `json:"phone"`
		OldPhone        string `json:"old_phone"`
		MaritalStatus   string `json:"marital_status"`
		OldMaritalStatus string `json:"old_marital_status"`
		GradeID         int    `json:"grade_id"`
		OldGradeID      int    `json:"old_grade_id"`
		Name            string `json:"name"`
		OldName         string `json:"old_name"`
		JobPositionID   int    `json:"job_position_id"`
		OldJobPositionID int   `json:"old_job_position_id"`
		Email           string `json:"email"`
		OldEmail        string `json:"old_email"`
	}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	birthDate, err := time.Parse("2006-01-02", payload.BirthDateStr)
	if err != nil {
		http.Error(w, "Invalid birth date format", http.StatusBadRequest)
		return
	}

	oldBirthDate, err := time.Parse("2006-01-02", payload.OldBirthDateStr)
	if err != nil {
		http.Error(w, "Invalid old birth date format", http.StatusBadRequest)
		return
	}

	employeeRequest := entity.EmployeeRequest{
		EmployeeID:      payload.PTID,
		Username:        payload.Username,
		OldUsername:     payload.OldUsername,
		BirthDate:       birthDate,
		OldBirthDate:    oldBirthDate,
		Address:         payload.Address,
		OldAddress:      payload.OldAddress,
		LocationID:      payload.LocationID,
		OldLocationID:   payload.OldLocationID,
		Phone:           payload.Phone,
		OldPhone:        payload.OldPhone,
		MaritalStatus:   payload.MaritalStatus,
		OldMaritalStatus: payload.OldMaritalStatus,
		GradeID:         payload.GradeID,
		OldGradeID:      payload.OldGradeID,
		Name:            payload.Name,
		OldName:         payload.OldName,
		JobPositionID:   payload.JobPositionID,
		OldJobPositionID: payload.OldJobPositionID,
		Email:           payload.Email,
		OldEmail:        payload.OldEmail,
	}

	err = h.service.CreateReqUpdateEmployee(ctx, employeeRequest)
	if err != nil {
		http.Error(w, "Failed to create employee update request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *EmployeeHandler) UpdateEmployee(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid employee ID", http.StatusBadRequest)
		return
	}

	var emp entity.Employee
	if err := json.NewDecoder(r.Body).Decode(&emp); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	emp.ID = id

	if emp.Password != "" {
		hashedPassword, err := utils.HashPassword(emp.Password)
		if err != nil {
			log.Printf("Error hashing password: %v", err)
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}
		emp.Password = hashedPassword
	}

	if emp.BirthDateStr != "" {
		emp.BirthDate, err = time.Parse("2006-01-02", emp.BirthDateStr)
		if err != nil {
			log.Printf("Error parsing birth_date: %v", err)
			http.Error(w, "Invalid birth_date format", http.StatusBadRequest)
			return
		}
	}

	if emp.JoinDateStr != "" {
		emp.JoinDate, err = time.Parse("2006-01-02", emp.JoinDateStr)
		if err != nil {
			log.Printf("Error parsing join_date: %v", err)
			http.Error(w, "Invalid join_date format", http.StatusBadRequest)
			return
		}
	}

	if err := h.service.UpdateEmployee(r.Context(), emp); err != nil {
		log.Printf("Error updating employee: %v", err)
		http.Error(w, "Failed to update employee", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EmployeeHandler) UpdateReqUpdateEmployeeStatus(w http.ResponseWriter, r *http.Request) {
    ptid := chi.URLParam(r, "ptid")
    if ptid == "" {
        http.Error(w, "Invalid PTID", http.StatusBadRequest)
        return
    }

    var body struct {
        Status        string `json:"status"`
        RejectReason  string `json:"rejection_reason"`
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

    rejectReason := ""
    if status == "Rejected" {
        rejectReason = body.RejectReason
        if rejectReason == "" {
            http.Error(w, "Reject reason is required for rejected status", http.StatusBadRequest)
            return
        }
    }

    if err := h.service.UpdateReqUpdateEmployeeStatus(r.Context(), ptid, status, rejectReason); err != nil {
        log.Printf("Error updating request update employee status: %v", err)
        http.Error(w, "Failed to update request update employee status", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func (h *EmployeeHandler) DeleteEmployee(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid employee ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteEmployee(r.Context(), id); err != nil {
		log.Printf("Error deleting employee: %v", err)
		http.Error(w, "Failed to delete employee", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *EmployeeHandler) DeleteReqUpdateEmployee(w http.ResponseWriter, r *http.Request) {
    nip := chi.URLParam(r, "nip")
    if nip == "" {
        http.Error(w, "Invalid NIP", http.StatusBadRequest)
        return
    }

    err := h.service.DeleteReqUpdateEmployee(r.Context(), nip)
    if err != nil {
        log.Printf("Error deleting employee update request by NIP: %v", err)
        http.Error(w, "Failed to delete employee update request", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}