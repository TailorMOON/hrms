package data

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"context"

	"github.com/jmoiron/sqlx"
)

func (d Data) GetAllJobPositions(ctx context.Context) ([]entity.JobPosition, error) {
	var (
		jobPositions []entity.JobPosition
		err          error
	)

	rows, err := (*d.stmt)[getAllJobPositions].QueryxContext(ctx)
	if err != nil {
		return jobPositions, errors.Wrap(err, "[DATA][GetAllJobPositions1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		jobPosition := entity.JobPosition{}
		if err = rows.StructScan(&jobPosition); err != nil {
			return jobPositions, errors.Wrap(err, "[DATA][GetAllJobPositions2] Failed to scan job position data")
		}
		jobPositions = append(jobPositions, jobPosition)
	}

	if err = rows.Err(); err != nil {
		return jobPositions, errors.Wrap(err, "[DATA][GetAllJobPositions3] Iteration error")
	}

	return jobPositions, nil
}

func (d Data) GetJobPositionByID(ctx context.Context, id int) (entity.JobPosition, error) {
	var (
		jobPosition entity.JobPosition
		err         error
	)

	rows, err := (*d.stmt)[getJobPositionByID].QueryxContext(ctx, id)
	if err != nil {
		return jobPosition, errors.Wrap(err, "[DATA][GetJobPositionByID1] Failed to execute query")
	}
	defer rows.Close()

	if rows.Next() {
		if err = rows.StructScan(&jobPosition); err != nil {
			return jobPosition, errors.Wrap(err, "[DATA][GetJobPositionByID2] Failed to scan job position data")
		}
	} else {
		return jobPosition, errors.New("[DATA][GetJobPositionByID3] No job position found with the given ID")
	}

	if err = rows.Err(); err != nil {
		return jobPosition, errors.Wrap(err, "[DATA][GetJobPositionByID4] Iteration error")
	}

	return jobPosition, nil
}

func (d Data) CreateJobPosition(ctx context.Context, data entity.JobPosition, tx *sqlx.Tx) error {
	createJobPositionStmt := tx.Stmtx((*d.stmt)[createJobPosition])

	_, err := createJobPositionStmt.ExecContext(ctx, data.JobName)
	if err != nil {
		return errors.Wrap(err, "[DATA][CreateJobPosition] Failed to insert job position")
	}

	return nil
}

func (d Data) UpdateJobPosition(ctx context.Context, data entity.JobPosition, tx *sqlx.Tx) error {
	updateJobPositionStmt := tx.Stmtx((*d.stmt)[updateJobPosition])

	_, err := updateJobPositionStmt.ExecContext(ctx, data.JobName, data.ID)
	if err != nil {
		return errors.Wrap(err, "[DATA][UpdateJobPosition] Failed to update job position")
	}

	return nil
}

func (d Data) DeleteJobPosition(ctx context.Context, id int, tx *sqlx.Tx) error {
	deleteJobPositionStmt := tx.Stmtx((*d.stmt)[deleteJobPosition])

	_, err := deleteJobPositionStmt.ExecContext(ctx, id)
	if err != nil {
		return errors.Wrap(err, "[DATA][DeleteJobPosition] Failed to delete job position")
	}

	return nil
}
