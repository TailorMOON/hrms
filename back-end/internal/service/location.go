package service

import (
	"backend/internal/entity"
	"context"
)

func (s Service) GetAllLocations(ctx context.Context) ([]entity.Location, error) {
	locations, err := s.data.GetAllLocations(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all locations", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all locations")
	}
	s.LogInfo(ctx, "Successfully fetched all locations", nil)
	return locations, nil
}

func (s Service) GetLocationByID(ctx context.Context, id int) (entity.Location, error) {
	location, err := s.data.GetLocationByID(ctx, id)
	if err != nil {
		s.LogError(ctx, "Failed to get location by ID", map[string]interface{}{"error": err.Error(), "id": id})
		return entity.Location{}, s.WrapError(err, "Failed to get location by ID")
	}
	s.LogInfo(ctx, "Successfully fetched location", map[string]interface{}{"id": id})
	return location, nil
}

func (s Service) CreateLocation(ctx context.Context, data entity.Location) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateLocation(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to create location", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to create location")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully created location", map[string]interface{}{"location": data})
	return nil
}

func (s Service) UpdateLocation(ctx context.Context, data entity.Location) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.UpdateLocation(ctx, data, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to update location", map[string]interface{}{"error": err.Error(), "location": data})
		return s.WrapError(err, "Failed to update location")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully updated location", map[string]interface{}{"location": data})
	return nil
}

func (s Service) DeleteLocation(ctx context.Context, id int) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.DeleteLocation(ctx, id, tx)
	if err != nil {
		tx.Rollback()
		s.LogError(ctx, "Failed to delete location", map[string]interface{}{"error": err.Error(), "id": id})
		return s.WrapError(err, "Failed to delete location")
	}

	tx.Commit()
	s.LogInfo(ctx, "Successfully deleted location", map[string]interface{}{"id": id})
	return nil
}
