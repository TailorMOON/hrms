package data

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"context"

	"github.com/jmoiron/sqlx"
)

func (d Data) GetAllLocations(ctx context.Context) ([]entity.Location, error) {
	var (
		locations []entity.Location
		err       error
	)

	rows, err := (*d.stmt)[getAllLocations].QueryxContext(ctx)
	if err != nil {
		return locations, errors.Wrap(err, "[DATA][GetAllLocations1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		location := entity.Location{}
		if err = rows.StructScan(&location); err != nil {
			return locations, errors.Wrap(err, "[DATA][GetAllLocations2] Failed to scan location data")
		}
		locations = append(locations, location)
	}

	if err = rows.Err(); err != nil {
		return locations, errors.Wrap(err, "[DATA][GetAllLocations3] Iteration error")
	}

	return locations, nil
}

func (d Data) GetLocationByID(ctx context.Context, id int) (entity.Location, error) {
	var (
		location entity.Location
		err      error
	)

	rows, err := (*d.stmt)[getLocationByID].QueryxContext(ctx, id)
	if err != nil {
		return location, errors.Wrap(err, "[DATA][GetLocationByID1] Failed to execute query")
	}
	defer rows.Close()

	if rows.Next() {
		if err = rows.StructScan(&location); err != nil {
			return location, errors.Wrap(err, "[DATA][GetLocationByID2] Failed to scan location data")
		}
	} else {
		return location, errors.New("[DATA][GetLocationByID3] No location found with the given ID")
	}

	if err = rows.Err(); err != nil {
		return location, errors.Wrap(err, "[DATA][GetLocationByID4] Iteration error")
	}

	return location, nil
}

func (d Data) CreateLocation(ctx context.Context, data entity.Location, tx *sqlx.Tx) error {
	createLocationStmt := tx.Stmtx((*d.stmt)[createLocation])

	_, err := createLocationStmt.ExecContext(ctx, data.LocationName, data.Status)
	if err != nil {
		return errors.Wrap(err, "[DATA][CreateLocation] Failed to insert location")
	}

	return nil
}

func (d Data) UpdateLocation(ctx context.Context, data entity.Location, tx *sqlx.Tx) error {
	updateLocationStmt := tx.Stmtx((*d.stmt)[updateLocation])

	_, err := updateLocationStmt.ExecContext(ctx, data.LocationName, data.Status, data.ID)
	if err != nil {
		return errors.Wrap(err, "[DATA][UpdateLocation] Failed to update location")
	}

	return nil
}

func (d Data) DeleteLocation(ctx context.Context, id int, tx *sqlx.Tx) error {
	deleteLocationStmt := tx.Stmtx((*d.stmt)[deleteLocation])

	_, err := deleteLocationStmt.ExecContext(ctx, id)
	if err != nil {
		return errors.Wrap(err, "[DATA][DeleteLocation] Failed to delete location")
	}

	return nil
}
