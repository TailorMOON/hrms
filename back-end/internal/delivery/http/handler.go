package http

import (
	"backend/internal/middleware"
	"backend/internal/service"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	EmployeeHandler    *EmployeeHandler
	GradeHandler       *GradeHandler
	JobPositionHandler *JobPositionHandler
	LocationHandler    *LocationHandler
	AttendanceHandler  *AttendanceHandler
	AuthHandler        *AuthHandler
	QRCodeHandler      *QRCodeHandler
}

func NewHandler(s service.Service, secretKey, smtpHost, smtpPort, smtpUser, smtpPass, fromEmail string) *Handler {
	return &Handler{
		EmployeeHandler:    NewEmployeeHandler(s),
		GradeHandler:       NewGradeHandler(s),
		JobPositionHandler: NewJobPositionHandler(s),
		LocationHandler:    NewLocationHandler(s),
		AttendanceHandler:  NewAttendanceHandler(s),
		AuthHandler:        NewAuthHandler(s),
		QRCodeHandler:      NewQRCodeHandler(secretKey, smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, s),
	}
}

func (h *Handler) RegisterRoutes(r *chi.Mux) {
	r.Use(middleware.CORS)

	r.Post("/login", h.AuthHandler.Login)

	r.Route("/qrcode", func(r chi.Router) {
		r.Post("/generate", h.QRCodeHandler.GenerateAndSendQRCode)
		r.Post("/handle", h.QRCodeHandler.HandleQRCode)
	})

	r.Group(func(r chi.Router) {
		r.Use(middleware.JWTMiddleware)

		r.Route("/employees", func(r chi.Router) {
			r.Get("/", h.EmployeeHandler.GetAllEmployees)
			r.Get("/nip/{nip}", h.EmployeeHandler.GetEmployeeByNIP)
			r.Get("/{id}", h.EmployeeHandler.GetEmployeeByID)
			r.Get("/request", h.EmployeeHandler.GetAllReqUpdateEmployee)
			r.Get("/request/{nip}", h.EmployeeHandler.GetReqUpdateEmployeeByNIP)
			r.Post("/", h.EmployeeHandler.CreateEmployee)
			r.Post("/request", h.EmployeeHandler.CreateReqUpdateEmployee)
			r.Put("/{id}", h.EmployeeHandler.UpdateEmployee)
			r.Put("/request/{ptid}/status", h.EmployeeHandler.UpdateReqUpdateEmployeeStatus)
			r.Delete("/{id}", h.EmployeeHandler.DeleteEmployee)
			r.Delete("/request/{nip}", h.EmployeeHandler.DeleteReqUpdateEmployee)
		})

		r.Route("/grades", func(r chi.Router) {
			r.Get("/", h.GradeHandler.GetAllGrades)
			r.Get("/{id}", h.GradeHandler.GetGradeByID)
			r.Post("/", h.GradeHandler.CreateGrade)
			r.Put("/{id}", h.GradeHandler.UpdateGrade)
			r.Delete("/{id}", h.GradeHandler.DeleteGrade)
		})

		r.Route("/jobpositions", func(r chi.Router) {
			r.Get("/", h.JobPositionHandler.GetAllJobPositions)
			r.Get("/{id}", h.JobPositionHandler.GetJobPositionByID)
			r.Post("/", h.JobPositionHandler.CreateJobPosition)
			r.Put("/{id}", h.JobPositionHandler.UpdateJobPosition)
			r.Delete("/{id}", h.JobPositionHandler.DeleteJobPosition)
		})

		r.Route("/locations", func(r chi.Router) {
			r.Get("/", h.LocationHandler.GetAllLocations)
			r.Get("/{id}", h.LocationHandler.GetLocationByID)
			r.Post("/", h.LocationHandler.CreateLocation)
			r.Put("/{id}", h.LocationHandler.UpdateLocation)
			r.Delete("/{id}", h.LocationHandler.DeleteLocation)
		})

		r.Route("/attendance", func(r chi.Router) {
			r.Get("/", h.AttendanceHandler.GetAllAttendances)
			r.Get("/{id}", h.AttendanceHandler.GetAttendanceByID)
			r.Get("/employee/{employee_id}", h.AttendanceHandler.GetAttendanceByDate)
			r.Get("/request", h.AttendanceHandler.GetAllReqAttendance)
			r.Get("/request/{employee_id}", h.AttendanceHandler.GetReqAttendanceByNIP)
			r.Post("/", h.AttendanceHandler.CreateAttendance)
			r.Post("/request", h.AttendanceHandler.CreateReqAttendance)
			r.Put("/{id}", h.AttendanceHandler.UpdateAttendance)
			r.Put("/request/{id}/status", h.AttendanceHandler.UpdateReqAttendanceStatus)
			r.Delete("/{id}", h.AttendanceHandler.DeleteAttendance)
		})
	})
}