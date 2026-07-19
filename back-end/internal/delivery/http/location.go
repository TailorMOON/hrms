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

type LocationHandler struct {
	service service.Service
}

func NewLocationHandler(s service.Service) *LocationHandler {
	return &LocationHandler{service: s}
}

func (h *LocationHandler) GetAllLocations(w http.ResponseWriter, r *http.Request) {
	locations, err := h.service.GetAllLocations(r.Context())
	if err != nil {
		log.Printf("Error fetching locations: %v", err) 
		http.Error(w, "Failed to fetch locations", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

func (h *LocationHandler) GetLocationByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid location ID", http.StatusBadRequest)
		return
	}

	location, err := h.service.GetLocationByID(r.Context(), id)
	if err != nil {
		log.Printf("Error fetching location by ID: %v", err)
		http.Error(w, "Failed to fetch location", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(location)
}

func (h *LocationHandler) CreateLocation(w http.ResponseWriter, r *http.Request) {
	var location entity.Location
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateLocation(r.Context(), location); err != nil {
		log.Printf("Error creating location: %v", err) 
		http.Error(w, "Failed to create location", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *LocationHandler) UpdateLocation(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid location ID", http.StatusBadRequest)
		return
	}

	var location entity.Location
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	location.ID = id
	if err := h.service.UpdateLocation(r.Context(), location); err != nil {
		log.Printf("Error updating location: %v", err)
		http.Error(w, "Failed to update location", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *LocationHandler) DeleteLocation(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid location ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteLocation(r.Context(), id); err != nil {
		log.Printf("Error deleting location: %v", err)
		http.Error(w, "Failed to delete location", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
