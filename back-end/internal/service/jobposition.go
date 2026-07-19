package service

import (
	"backend/internal/entity"
	"context"
)

func (s Service) GetAllJobPositions(ctx context.Context) ([]entity.JobPosition, error) {
	jobPositions, err := s.data.GetAllJobPositions(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all job positions", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all job positions")
	}
	s.LogInfo(ctx, "Successfully fetched all job positions", nil)
	return jobPositions, nil
}

func (s Service) GetJobPositionByID(ctx context.Context, id int) (entity.JobPosition, error) {
	jobPosition, err := s.data.GetJobPositionByID(ctx, id)
	if err != nil {
		s.LogError(ctx, "Failed to get job position by ID", map[string]interface{}{"error": err.Error(), "id": id})
		return entity.JobPosition{}, s.WrapError(err, "Failed to get job position by ID")
	}
	s.LogInfo(ctx, "Successfully fetched job position", map[string]interface{}{"id": id})
	return jobPosition, nil
}

func (s Service) CreateJobPosition(ctx context.Context, data entity.JobPosition) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateJobPosition(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to create job position", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to create job position")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully created job position", map[string]interface{}{"jobPosition": data})
	return nil
}

func (s Service) UpdateJobPosition(ctx context.Context, data entity.JobPosition) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.UpdateJobPosition(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to update job position", map[string]interface{}{"error": err.Error(), "jobPosition": data})
		return s.WrapError(err, "Failed to update job position")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully updated job position", map[string]interface{}{"jobPosition": data})
	return nil
}

func (s Service) DeleteJobPosition(ctx context.Context, id int) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.DeleteJobPosition(ctx, id, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to delete job position", map[string]interface{}{"error": err.Error(), "id": id})
		return s.WrapError(err, "Failed to delete job position")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully deleted job position", map[string]interface{}{"id": id})
	return nil
}
