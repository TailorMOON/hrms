package data

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
)

func (d Data) GetAllEmployees(ctx context.Context) ([]entity.Employee, error) {
	var (
		employees []entity.Employee
		err       error
	)

	rows, err := (*d.stmt)[getAllEmployees].QueryxContext(ctx)
	if err != nil {
		return employees, errors.Wrap(err, "[DATA][GetAllEmployees1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		employee := entity.Employee{}
		if err = rows.StructScan(&employee); err != nil {
			return employees, errors.Wrap(err, "[DATA][GetAllEmployees2] Failed to scan employee data")
		}
		employees = append(employees, employee)
	}

	if err = rows.Err(); err != nil {
		return employees, errors.Wrap(err, "[DATA][GetAllEmployees3] Iteration error")
	}

	return employees, nil
}

func (d Data) GetAllReqUpdateEmployee(ctx context.Context) ([]entity.EmployeeRequest, error) {
	var (
		employeeRequests []entity.EmployeeRequest
		err              error
	)

	rows, err := (*d.stmt)[getAllReqUpdateEmployee].QueryxContext(ctx)
	if err != nil {
		return employeeRequests, errors.Wrap(err, "[DATA][GetAllReqUpdateEmployee1] Failed to execute query")
	}
	defer rows.Close()

	for rows.Next() {
		employeeRequest := entity.EmployeeRequest{}
		if err = rows.StructScan(&employeeRequest); err != nil {
			return employeeRequests, errors.Wrap(err, "[DATA][GetAllReqUpdateEmployee2] Failed to scan employee request data")
		}
		employeeRequests = append(employeeRequests, employeeRequest)
	}

	if err = rows.Err(); err != nil {
		return employeeRequests, errors.Wrap(err, "[DATA][GetAllReqUpdateEmployee3] Iteration error")
	}

	return employeeRequests, nil
}

func (d Data) GetReqUpdateEmployeeByNIP(ctx context.Context, nip string) (string, string, error) {
    var (
        status     string
        createdAt  time.Time
    )
    
    stmt := (*d.stmt)[getReqUpdateEmployeeByNIP]
    if stmt == nil {
        return "", "", errors.New("[DATA][GetReqUpdateEmployeeByNIP1] Statement is nil")
    }

    err := stmt.QueryRowxContext(ctx, nip).Scan(&status, &createdAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return "", "", errors.New("[DATA][GetReqUpdateEmployeeByNIP2] No employee request found for the given NIP")
        }
        return "", "", errors.Wrap(err, "[DATA][GetReqUpdateEmployeeByNIP3] Failed to fetch request")
    }

    createdAtStr := createdAt.Format("2006-01-02 15:04:05")
    return status, createdAtStr, nil
}

func (d Data) GetEmployeeByNIP(ctx context.Context, ptid string) (entity.Employee, error) {
    var (
        employee entity.Employee
        err      error
    )

    rows, err := (*d.stmt)[getEmployeeByNIP].QueryxContext(ctx, ptid)
    if err != nil {
        return employee, errors.Wrap(err, "[DATA][GetEmployeeByNIP1] Failed to execute query")
    }
    defer rows.Close()

    if rows.Next() {
        if err = rows.StructScan(&employee); err != nil {
            return employee, errors.Wrap(err, "[DATA][GetEmployeeByNIP2] Failed to scan employee data")
        }
    } else {
        return employee, errors.New("[DATA][GetEmployeeByNIP3] No employee found with the given NIP")
    }

    if err = rows.Err(); err != nil {
        return employee, errors.Wrap(err, "[DATA][GetEmployeeByNIP4] Iteration error")
    }

    return employee, nil
}

func (d Data) GetEmployeeByID(ctx context.Context, id int) (entity.Employee, error) {
	var (
		employee entity.Employee
		err      error
	)

	rows, err := (*d.stmt)[getEmployeeByID].QueryxContext(ctx, id)
	if err != nil {
		return employee, errors.Wrap(err, "[DATA][GetEmployeeByID1] Failed to execute query")
	}
	defer rows.Close()

	if rows.Next() {
		if err = rows.StructScan(&employee); err != nil {
			return employee, errors.Wrap(err, "[DATA][GetEmployeeByID2] Failed to scan employee data")
		}
	} else {
		return employee, errors.New("[DATA][GetEmployeeByID3] No employee found with the given ID")
	}

	if err = rows.Err(); err != nil {
		return employee, errors.Wrap(err, "[DATA][GetEmployeeByID4] Iteration error")
	}

	return employee, nil
}

func (d Data) CreateEmployee(ctx context.Context, data entity.Employee, tx *sqlx.Tx) error {
    createEmployeeStmt := tx.Stmtx((*d.stmt)[createEmployee])

    res, err := createEmployeeStmt.ExecContext(ctx,
        data.Username,
        data.Password,
        data.BirthDate,
        data.Address,
        data.LocationID,
        data.JoinDate,
        data.Phone,
        data.MaritalStatus,
        data.IsAdmin,
        data.GradeID,
        data.Name,
        data.JobPositionID,
        data.Email,
    )
    if err != nil {
        log.Printf("Error inserting employee into database: %v", err)
        return errors.Wrap(err, "[DATA][CreateEmployee] Failed to insert employee")
    }

    currentYear := time.Now().Year() % 100

    var lastPTID string
    err = tx.Stmtx((*d.stmt)[getLastPTID]).GetContext(ctx, &lastPTID)
    if err != nil && err != sql.ErrNoRows {
        log.Printf("Error fetching last PTID: %v", err)
        return errors.Wrap(err, "[DATA][CreateEmployee] Failed to fetch last PTID")
    }

    var lastNumber int
    if lastPTID != "" && lastPTID[1:3] == fmt.Sprintf("%02d", currentYear) {
        lastNumber, err = strconv.Atoi(lastPTID[3:])
        if err != nil {
            log.Printf("Error parsing last PTID number: %v", err)
            return errors.Wrap(err, "[DATA][CreateEmployee] Failed to parse last PTID number")
        }
    } else {
        lastNumber = 0
    }

    newNumber := lastNumber + 1

    nip := fmt.Sprintf("E%02d%04d", currentYear, newNumber)

    lastID, err := res.LastInsertId()
    if err != nil {
        log.Printf("Error getting last inserted ID: %v", err)
        return errors.Wrap(err, "[DATA][CreateEmployee] Failed to get last inserted ID")
    }

    updatePTIDStmt := tx.Stmtx((*d.stmt)[updateEmployeePTID])
    _, err = updatePTIDStmt.ExecContext(ctx, nip, lastID)
    if err != nil {
        log.Printf("Error updating PTID: %v", err)
        return errors.Wrap(err, "[DATA][CreateEmployee] Failed to update PTID")
    }

    return nil
}

func (d Data) CreateReqUpdateEmployee(ctx context.Context, data entity.EmployeeRequest, tx *sqlx.Tx) error {
    createReqUpdateEmployeeStmt := tx.Stmtx((*d.stmt)[createReqUpdateEmployee])

    _, err := createReqUpdateEmployeeStmt.ExecContext(ctx,
        data.EmployeeID,
        data.Name, data.OldName,
        data.Username, data.OldUsername,
        data.BirthDate, data.OldBirthDate,
        data.Email, data.OldEmail,
        data.Phone, data.OldPhone,
        data.MaritalStatus, data.OldMaritalStatus,
        data.Address, data.OldAddress,
        data.LocationID, data.OldLocationID,
        data.GradeID, data.OldGradeID,
        data.JobPositionID, data.OldJobPositionID,
        "Pending",
        data.RejectionReason,
        time.Now(),
        time.Now(),
    )
    if err != nil {
        return errors.Wrap(err, "[DATA][CreateReqUpdateEmployee] Failed to insert employee update request")
    }

    return nil
}

func (d Data) UpdateEmployee(ctx context.Context, data entity.Employee, tx *sqlx.Tx) error {
    var (
        query string
        args  []interface{}
    )

    if data.Password != "" {
        query = `UPDATE employees SET
            username = ?, 
            password = ?, 
            birth_date = ?, 
            address = ?, 
            location_id = ?, 
            join_date = ?, 
            phone = ?, 
            marital_status = ?, 
            is_admin = ?, 
            grade_id = ?, 
            name = ?, 
            job_position_id = ?, 
            email = ?
        WHERE id = ?`
        args = []interface{}{
            data.Username,
            data.Password, 
            data.BirthDate,
            data.Address,
            data.LocationID,
            data.JoinDate,
            data.Phone,
            data.MaritalStatus,
            data.IsAdmin,
            data.GradeID,
            data.Name,
            data.JobPositionID,
            data.Email,
            data.ID,
        }
    } else {
        query = `UPDATE employees SET
            username = ?, 
            birth_date = ?, 
            address = ?, 
            location_id = ?, 
            join_date = ?, 
            phone = ?, 
            marital_status = ?, 
            is_admin = ?, 
            grade_id = ?, 
            name = ?, 
            job_position_id = ?, 
            email = ?
        WHERE id = ?`
        args = []interface{}{
            data.Username,
            data.BirthDate,
            data.Address,
            data.LocationID,
            data.JoinDate,
            data.Phone,
            data.MaritalStatus,
            data.IsAdmin,
            data.GradeID,
            data.Name,
            data.JobPositionID,
            data.Email,
            data.ID,
        }
    }

    _, err := tx.ExecContext(ctx, d.db.Rebind(query), args...)
    if err != nil {
        return errors.Wrap(err, "[DATA][UpdateEmployee] Failed to update employee")
    }

    return nil
}

func (d Data) UpdateReqUpdateEmployeeStatus(ctx context.Context, ptid string, status string, rejectReason string, tx *sqlx.Tx) error {
    updateReqUpdateEmployeeStatusStmt := tx.Stmtx((*d.stmt)[updateReqUpdateEmployeeStatus])

    _, err := updateReqUpdateEmployeeStatusStmt.ExecContext(ctx, status, status, rejectReason, ptid)
    if err != nil {
        return errors.Wrap(err, "[DATA][UpdateReqUpdateEmployeeStatus] Failed to update employee request status")
    }

    return nil
}

func (d Data) DeleteEmployee(ctx context.Context, id int, tx *sqlx.Tx) error {
	deleteEmployeeStmt := tx.Stmtx((*d.stmt)[deleteEmployee])

	_, err := deleteEmployeeStmt.ExecContext(ctx, id)
	if err != nil {
		return errors.Wrap(err, "[DATA][DeleteEmployee] Failed to delete employee")
	}

	return nil
}

func (d Data) DeleteReqUpdateEmployee(ctx context.Context, nip string, tx *sqlx.Tx) error {
    deleteStmt := tx.Stmtx((*d.stmt)[deleteReqUpdateEmployee])
    _, err := deleteStmt.ExecContext(ctx, nip)
    if err != nil {
        return errors.Wrap(err, "[DATA][DeleteReqUpdateEmployee] Failed to delete request by NIP")
    }
    return nil
}

