package service

import (
	"backend/internal/entity"
	"context"
)

func (s Service) GetAllAttendances(ctx context.Context) ([]entity.Attendance, error) {
	attendances, err := s.data.GetAllAttendances(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all attendances", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all attendances")
	}
	s.LogInfo(ctx, "Successfully fetched all attendances", nil)
	return attendances, nil
}

func (s Service) GetAttendanceByID(ctx context.Context, id int) (entity.Attendance, error) {
	attendance, err := s.data.GetAttendanceByID(ctx, id)
	if err != nil {
		s.LogError(ctx, "Failed to get attendance by ID", map[string]interface{}{"error": err.Error(), "id": id})
		return entity.Attendance{}, s.WrapError(err, "Failed to get attendance by ID")
	}
	s.LogInfo(ctx, "Successfully fetched attendance", map[string]interface{}{"id": id})
	return attendance, nil
}

func (s Service) GetAttendanceByDate(ctx context.Context, employee_id string, startDate string, endDate string, limit, offset int) ([]entity.Attendance, error) {
	attendances, err := s.data.GetAttendanceByDate(ctx, employee_id, startDate, endDate, limit, offset)
	if err != nil {
		s.LogError(ctx, "Failed to get attendance by employee_id and date range", map[string]interface{}{"error": err.Error(), "employee_id": employee_id, "startDate": startDate, "endDate": endDate})
		return nil, s.WrapError(err, "Failed to get attendance by employee_id and date range")
	}
	s.LogInfo(ctx, "Successfully fetched attendance by employee_id and date range", map[string]interface{}{"employee_id": employee_id, "startDate": startDate, "endDate": endDate})
	return attendances, nil
}

func (s Service) GetAllReqAttendance(ctx context.Context) ([]entity.AttendanceRequest, error) {
	attendances, err := s.data.GetAllReqAttendance(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all attendance requests", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all attendance requests")
	}
	s.LogInfo(ctx, "Successfully fetched all attendance requests", nil)
	return attendances, nil
}

func (s Service) GetReqAttendanceByNIP(ctx context.Context, employeeID string) ([]entity.AttendanceRequest, error) {
	attendances, err := s.data.GetReqAttendanceByNIP(ctx, employeeID)
	if err != nil {
		s.LogError(ctx, "Failed to get attendance requests by employee_id", map[string]interface{}{
			"error":       err.Error(),
			"employee_id": employeeID,
		})
		return nil, s.WrapError(err, "Failed to get attendance requests by employee_id")
	}

	s.LogInfo(ctx, "Successfully fetched attendance requests by employee_id", map[string]interface{}{
		"employee_id": employeeID,
	})
	return attendances, nil
}

func (s Service) CreateAttendance(ctx context.Context, data entity.Attendance) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	err = s.data.CreateAttendance(ctx, data, tx)
	if err != nil {
		s.LogError(ctx, "Failed to create attendance", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to create attendance")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully created attendance", map[string]interface{}{"attendance": data})
	return nil
}

func (s Service) CreateReqAttendance(ctx context.Context, data entity.AttendanceRequest) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateReqAttendance(ctx, data, tx)
	if err != nil {
		s.LogError(ctx, "Failed to create attendance request", map[string]interface{}{"error": err.Error(), "attendance_request": data})
		_ = tx.Rollback()
		return s.WrapError(err, "Failed to create attendance request")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully created attendance request", map[string]interface{}{"attendance_request": data})
	return nil
}

func (s Service) UpdateAttendance(ctx context.Context, data entity.Attendance) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.UpdateAttendance(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to update attendance", map[string]interface{}{"error": err.Error(), "attendance": data})
		return s.WrapError(err, "Failed to update attendance")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully updated attendance", map[string]interface{}{"attendance": data})
	return nil
}

func (s Service) UpdateReqAttendanceStatus(ctx context.Context, id int, status string, rejectionReason *string) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	err = s.data.UpdateReqAttendanceStatus(ctx, id, status, rejectionReason, tx)
	if err != nil {
		s.LogError(ctx, "Failed to update attendance request status", map[string]interface{}{
			"error":            err.Error(),
			"id":               id,
			"status":           status,
			"rejection_reason": rejectionReason,
		})
		return s.WrapError(err, "Failed to update attendance request status")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully updated attendance request status", map[string]interface{}{
		"id":               id,
		"status":           status,
		"rejection_reason": rejectionReason,
	})
	return nil
}

func (s Service) DeleteAttendance(ctx context.Context, id int) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.DeleteAttendance(ctx, id, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to delete attendance", map[string]interface{}{"error": err.Error(), "id": id})
		return s.WrapError(err, "Failed to delete attendance")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully deleted attendance", map[string]interface{}{"id": id})
	return nil
}
