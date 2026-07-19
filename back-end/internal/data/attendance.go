package data

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

func (d Data) GetAllAttendances(ctx context.Context) ([]entity.Attendance, error) {
	var (
		attendances []entity.Attendance
		err         error
	)

	rows, err := (*d.stmt)[getAllAttendances].QueryxContext(ctx)
	if err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAllAttendances] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		attendance := entity.Attendance{}
		if err = rows.StructScan(&attendance); err != nil {
			return attendances, errors.Wrap(err, "[DATA][GetAllAttendances] Failed to scan attendance data")
		}
		attendances = append(attendances, attendance)
	}

	if err = rows.Err(); err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAllAttendances] Iteration error")
	}

	return attendances, nil
}

func (d Data) GetAttendanceByID(ctx context.Context, id int) (entity.Attendance, error) {
	var (
		attendance entity.Attendance
		err        error
	)

	rows, err := (*d.stmt)[getAttendanceByID].QueryxContext(ctx, id)
	if err != nil {
		return attendance, errors.Wrap(err, "[DATA][GetAttendanceByID1] Failed to execute query")
	}
	defer rows.Close()

	if rows.Next() {
		if err = rows.StructScan(&attendance); err != nil {
			return attendance, errors.Wrap(err, "[DATA][GetAttendanceByID2] Failed to scan attendance data")
		}
	} else {
		return attendance, errors.New("[DATA][GetAttendanceByID3] No attendance found with the given ID")
	}

	if err = rows.Err(); err != nil {
		return attendance, errors.Wrap(err, "[DATA][GetAttendanceByID4] Iteration error")
	}

	return attendance, nil
}

func (d Data) GetAttendanceByDate(ctx context.Context, employeeID string, startDate string, endDate string, limit int, offset int) ([]entity.Attendance, error) {
	var (
		attendances []entity.Attendance
		err         error
	)

	rows, err := (*d.stmt)[getAttendanceByDate].QueryxContext(ctx, employeeID, startDate, endDate, limit, offset)
	if err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAttendanceByDate1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		attendance := entity.Attendance{}
		if err = rows.StructScan(&attendance); err != nil {
			return attendances, errors.Wrap(err, "[DATA][GetAttendanceByDate2] Failed to scan attendance data")
		}
		attendances = append(attendances, attendance)
	}

	if err = rows.Err(); err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAttendanceByDate3] Iteration error")
	}

	return attendances, nil
}

func (d Data) GetAllReqAttendance(ctx context.Context) ([]entity.AttendanceRequest, error) {
	var (
		attendances []entity.AttendanceRequest
		err         error
	)

	rows, err := (*d.stmt)[getAllReqAttendance].QueryxContext(ctx)
	if err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAllReqAttendance1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		attendance := entity.AttendanceRequest{}
		if err = rows.StructScan(&attendance); err != nil {
			return attendances, errors.Wrap(err, "[DATA][GetAllReqAttendance2] Failed to scan attendance request data")
		}
		attendances = append(attendances, attendance)
	}

	if err = rows.Err(); err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetAllReqAttendance3] Iteration error")
	}

	return attendances, nil
}

func (d Data) GetReqAttendanceByNIP(ctx context.Context, employeeID string) ([]entity.AttendanceRequest, error) {
	var (
		attendances []entity.AttendanceRequest
		err         error
	)

	rows, err := (*d.stmt)[getReqAttendanceByNIP].QueryxContext(ctx, employeeID)
	if err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetReqAttendanceByNIP] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		attendance := entity.AttendanceRequest{}
		if err = rows.StructScan(&attendance); err != nil {
			return attendances, errors.Wrap(err, "[DATA][GetReqAttendanceByNIP] Failed to scan attendance request data")
		}
		attendances = append(attendances, attendance)
	}

	if err = rows.Err(); err != nil {
		return attendances, errors.Wrap(err, "[DATA][GetReqAttendanceByNIP] Iteration error")
	}

	return attendances, nil
}

func (d Data) CreateAttendance(ctx context.Context, data entity.Attendance, tx *sqlx.Tx) error {
	createAttendanceStmt := tx.Stmtx((*d.stmt)[createAttendance])

	log.Printf("Creating attendance with: employee_id=%s, date=%s, check_in_time=%s, is_late=%v, check_out_time=%s",
    data.EmployeeID, data.Date, data.CheckInTime, data.IsLate, data.CheckOutTime)

	_, err := createAttendanceStmt.ExecContext(ctx,
		data.EmployeeID,
		data.Date,
		data.CheckInTime,
		data.IsLate,
		data.CheckOutTime,
	)
	if err != nil {
		return errors.Wrap(err, "[DATA][CreateAttendance] Failed to insert attendance")
	}

	return nil
}

func (d Data) CreateReqAttendance(ctx context.Context, data entity.AttendanceRequest, tx *sqlx.Tx) error {
	createReqAttendanceStmt := tx.Stmtx((*d.stmt)[createReqAttendance])

	_, err := createReqAttendanceStmt.ExecContext(ctx,
		data.ID,
		data.EmployeeID,
		data.RequestDate,
		data.CheckInTime,
		data.CheckOutTime,
		data.Reason,
		"Pending",
		data.RejectionReason,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		return errors.Wrap(err, "[DATA][CreateReqAttendance] Failed to insert attendance request")
	}

	return nil
}

func (d Data) UpdateAttendance(ctx context.Context, data entity.Attendance, tx *sqlx.Tx) error {
	updateAttendanceStmt := tx.Stmtx((*d.stmt)[updateAttendance])

	_, err := updateAttendanceStmt.ExecContext(ctx,
		data.EmployeeID,
		data.Date,
		data.CheckInTime,
		data.IsLate,
		data.CheckOutTime,
		data.ID,
	)
	if err != nil {
		return errors.Wrap(err, "[DATA][UpdateAttendance] Failed to update attendance")
	}

	return nil
}

func (d Data) UpdateReqAttendanceStatus(ctx context.Context, id int, status string, rejectionReason *string, tx *sqlx.Tx) error {
    updateReqAttendanceStatusStmt := tx.Stmtx((*d.stmt)[updateReqAttendanceStatus])
    log.Printf("Updating attendance status with: id=%d, status=%s, rejectionReason=%v", id, status, rejectionReason)

    var err error
    if rejectionReason == nil {
        _, err = updateReqAttendanceStatusStmt.ExecContext(ctx, status, status, "", id)
    } else {
        _, err = updateReqAttendanceStatusStmt.ExecContext(ctx, status, status, *rejectionReason, id)
    }

    if err != nil {
        return errors.Wrap(err, "[DATA][UpdateReqAttendanceStatus] Failed to update attendance request status")
    }

    return nil
}

func (d Data) DeleteAttendance(ctx context.Context, id int, tx *sqlx.Tx) error {
	deleteAttendanceStmt := tx.Stmtx((*d.stmt)[deleteAttendance])

	_, err := deleteAttendanceStmt.ExecContext(ctx, id)
	if err != nil {
		return errors.Wrap(err, "[DATA][DeleteAttendance] Failed to delete attendance")
	}

	return nil
}
