package data

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"context"

	"github.com/jmoiron/sqlx"
)

func (d Data) GetAllGrades(ctx context.Context) ([]entity.Grade, error) {
	var (
		grades []entity.Grade
		err    error
	)

	rows, err := (*d.stmt)[getAllGrades].QueryxContext(ctx)
	if err != nil {
		return grades, errors.Wrap(err, "[DATA][GetAllGrades1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		grade := entity.Grade{}
		if err = rows.StructScan(&grade); err != nil {
			return grades, errors.Wrap(err, "[DATA][GetAllGrades2] Failed to scan grade data")
		}
		grades = append(grades, grade)
	}

	if err = rows.Err(); err != nil {
		return grades, errors.Wrap(err, "[DATA][GetAllGrades3] Iteration error")
	}

	return grades, nil
}

func (d Data) GetGradeByID(ctx context.Context, id int) (entity.Grade, error) {
	var (
		grade entity.Grade
		err   error
	)

	rows, err := (*d.stmt)[getGradeByID].QueryxContext(ctx, id)
	if err != nil {
		return grade, errors.Wrap(err, "[DATA][GetGradeByID1] Failed to execute query")
	}
	defer rows.Close()

	if rows.Next() {
		if err = rows.StructScan(&grade); err != nil {
			return grade, errors.Wrap(err, "[DATA][GetGradeByID2] Failed to scan grade data")
		}
	} else {
		return grade, errors.New("[DATA][GetGradeByID3] No grade found with the given ID")
	}

	if err = rows.Err(); err != nil {
		return grade, errors.Wrap(err, "[DATA][GetGradeByID4] Iteration error")
	}

	return grade, nil
}

func (d Data) CreateGrade(ctx context.Context, data entity.Grade, tx *sqlx.Tx) error {
	createGradeStmt := tx.Stmtx((*d.stmt)[createGrade])

	_, err := createGradeStmt.ExecContext(ctx, data.GradeName)
	if err != nil {
		return errors.Wrap(err, "[DATA][CreateGrade] Failed to insert grade")
	}

	return nil
}

func (d Data) UpdateGrade(ctx context.Context, data entity.Grade, tx *sqlx.Tx) error {
	updateGradeStmt := tx.Stmtx((*d.stmt)[updateGrade])

	_, err := updateGradeStmt.ExecContext(ctx, data.GradeName, data.ID)
	if err != nil {
		return errors.Wrap(err, "[DATA][UpdateGrade] Failed to update grade")
	}

	return nil
}

func (d Data) DeleteGrade(ctx context.Context, id int, tx *sqlx.Tx) error {
	deleteGradeStmt := tx.Stmtx((*d.stmt)[deleteGrade])

	_, err := deleteGradeStmt.ExecContext(ctx, id)
	if err != nil {
		return errors.Wrap(err, "[DATA][DeleteGrade] Failed to delete grade")
	}

	return nil
}
