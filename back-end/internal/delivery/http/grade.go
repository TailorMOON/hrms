package http

import (
	"backend/internal/service"
	"backend/internal/entity"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type GradeHandler struct {
	service service.Service
}

func NewGradeHandler(s service.Service) *GradeHandler {
	return &GradeHandler{service: s}
}

func (h *GradeHandler) GetAllGrades(w http.ResponseWriter, r *http.Request) {
	grades, err := h.service.GetAllGrades(r.Context())
	if err != nil {
		log.Printf("Error fetching grades: %v", err) 
		http.Error(w, "Failed to fetch grades", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(grades)
}

func (h *GradeHandler) GetGradeByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid grade ID", http.StatusBadRequest)
		return
	}

	grade, err := h.service.GetGradeByID(r.Context(), id)
	if err != nil {
		log.Printf("Error fetching grade by ID: %v", err)
		http.Error(w, "Failed to fetch grade", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(grade)
}

func (h *GradeHandler) CreateGrade(w http.ResponseWriter, r *http.Request) {
	var grade entity.Grade
	if err := json.NewDecoder(r.Body).Decode(&grade); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateGrade(r.Context(), grade); err != nil {
		log.Printf("Error creating grade: %v", err)
		http.Error(w, "Failed to create grade", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *GradeHandler) UpdateGrade(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid grade ID", http.StatusBadRequest)
		return
	}

	var grade entity.Grade
	if err := json.NewDecoder(r.Body).Decode(&grade); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	grade.ID = id
	if err := h.service.UpdateGrade(r.Context(), grade); err != nil {
		log.Printf("Error updating grade: %v", err)
		http.Error(w, "Failed to update grade", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *GradeHandler) DeleteGrade(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid grade ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteGrade(r.Context(), id); err != nil {
		log.Printf("Error deleting grade: %v", err)
		http.Error(w, "Failed to delete grade", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
