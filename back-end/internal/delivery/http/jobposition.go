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

type JobPositionHandler struct {
	service service.Service
}

func NewJobPositionHandler(s service.Service) *JobPositionHandler {
	return &JobPositionHandler{service: s}
}

func (h *JobPositionHandler) GetAllJobPositions(w http.ResponseWriter, r *http.Request) {
	jobPositions, err := h.service.GetAllJobPositions(r.Context())
	if err != nil {
		log.Printf("Error fetching job positions: %v", err) 
		http.Error(w, "Failed to fetch job positions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobPositions)
}

func (h *JobPositionHandler) GetJobPositionByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid job position ID", http.StatusBadRequest)
		return
	}

	jobPosition, err := h.service.GetJobPositionByID(r.Context(), id)
	if err != nil {
		log.Printf("Error fetching job position by ID: %v", err) 
		http.Error(w, "Failed to fetch job position", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobPosition)
}

func (h *JobPositionHandler) CreateJobPosition(w http.ResponseWriter, r *http.Request) {
	var jobPosition entity.JobPosition
	if err := json.NewDecoder(r.Body).Decode(&jobPosition); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateJobPosition(r.Context(), jobPosition); err != nil {
		log.Printf("Error creating job position: %v", err)
		http.Error(w, "Failed to create job position", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *JobPositionHandler) UpdateJobPosition(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid job position ID", http.StatusBadRequest)
		return
	}

	var jobPosition entity.JobPosition
	if err := json.NewDecoder(r.Body).Decode(&jobPosition); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	jobPosition.ID = id
	if err := h.service.UpdateJobPosition(r.Context(), jobPosition); err != nil {
		log.Printf("Error updating job position: %v", err) 
		http.Error(w, "Failed to update job position", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *JobPositionHandler) DeleteJobPosition(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid job position ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteJobPosition(r.Context(), id); err != nil {
		log.Printf("Error deleting job position: %v", err) 
		http.Error(w, "Failed to delete job position", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
