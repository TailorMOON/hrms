package service

import (
	"backend/internal/entity"
	"context"
)

func (s Service) GetAllGrades(ctx context.Context) ([]entity.Grade, error) {
	grades, err := s.data.GetAllGrades(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all grades", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all grades")
	}
	s.LogInfo(ctx, "Successfully fetched all grades", nil)
	return grades, nil
}

func (s Service) GetGradeByID(ctx context.Context, id int) (entity.Grade, error) {
	grade, err := s.data.GetGradeByID(ctx, id)
	if err != nil {
		s.LogError(ctx, "Failed to get grade by ID", map[string]interface{}{"error": err.Error(), "id": id})
		return entity.Grade{}, s.WrapError(err, "Failed to get grade by ID")
	}
	s.LogInfo(ctx, "Successfully fetched grade", map[string]interface{}{"id": id})
	return grade, nil
}

func (s Service) CreateGrade(ctx context.Context, data entity.Grade) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateGrade(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to create grade", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to create grade")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully created grade", map[string]interface{}{"grade": data})
	return nil
}

func (s Service) UpdateGrade(ctx context.Context, data entity.Grade) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.UpdateGrade(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to update grade", map[string]interface{}{"error": err.Error(), "grade": data})
		return s.WrapError(err, "Failed to update grade")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully updated grade", map[string]interface{}{"grade": data})
	return nil
}

func (s Service) DeleteGrade(ctx context.Context, id int) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.DeleteGrade(ctx, id, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to delete grade", map[string]interface{}{"error": err.Error(), "id": id})
		return s.WrapError(err, "Failed to delete grade")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully deleted grade", map[string]interface{}{"id": id})
	return nil
}
