package data

import (
	"backend/pkg/errors"
	"context"
	"log"

	"github.com/jmoiron/sqlx"
)

// Employee
const (
	getAllEmployees  = "GetAllEmployees"
	qGetAllEmployees = `SELECT
		id,
		ptid,
		username,
		birth_date,
		address,
		location_id,
		join_date,
		phone,
		marital_status,
		is_admin,
		grade_id,
		name,
		job_position_id,
		email
	FROM employees`

	getEmployeeByID  = "GetEmployeeByID"
	qGetEmployeeByID = `SELECT
		id,
		ptid,
		username,
		birth_date,
		address,
		location_id,
		join_date,
		phone,
		marital_status,
		is_admin,
		grade_id,
		name,
		job_position_id,
		email
	FROM employees
	WHERE id = ?`

	getEmployeeByNIP  = "GetEmployeeByNIP"
	qGetEmployeeByNIP = `SELECT
		id,
		ptid,
		password,
		username,
		birth_date,
		address,
		location_id,
		join_date,
		phone,
		marital_status,
		is_admin,
		grade_id,
		name,
		job_position_id,
		email
	FROM employees
	WHERE ptid = ?`

	getLastPTID  = "GetLastPTID"
	qGetLastPTID = `SELECT 
		ptid 
	FROM employees ORDER BY ptid DESC LIMIT 1`

	getAllReqUpdateEmployee  = "GetAllReqUpdateEmployee" 
	qGetAllReqUpdateEmployee = `SELECT 
		id,
		employee_id,
		name, old_name,
		username, old_username,
		birth_date, old_birth_date,
		email, old_email,
		phone, old_phone,
		marital_status, old_marital_status,
		address, old_address,
		location_id, old_location_id,
		grade_id, old_grade_id,
		job_position_id, old_job_position_id,
		status,
		rejection_reason,
		created_at,
		updated_at
	FROM req_personal_info`

	getReqUpdateEmployeeByNIP  = "GetReqUpdateEmployeeByNIP"
	qGetReqUpdateEmployeeByNIP = `SELECT
		status,
		created_at
	FROM req_personal_info
	WHERE employee_id = ?
	ORDER BY created_at DESC
	LIMIT 1`

	createEmployee  = "CreateEmployee"
	qCreateEmployee = `INSERT INTO employees 
	(
		username, 
		password, 
		birth_date, 
		address, 
		location_id, 
		join_date, 
		phone, 
		marital_status, 
		is_admin, 
		grade_id, 
		name, 
		job_position_id, 
		email
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	createReqUpdateEmployee = "CreateReqUpdateEmployee"
	qCreateReqUpdateEmployee = `INSERT INTO req_personal_info
	(
		employee_id,
		name, old_name,
		username, old_username,
		birth_date, old_birth_date,
		email, old_email,
		phone, old_phone,
		marital_status, old_marital_status,
		address, old_address,
		location_id, old_location_id,
		grade_id, old_grade_id,
		job_position_id, old_job_position_id,
		status,
		rejection_reason,
		created_at,
		updated_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	updateEmployee  = "UpdateEmployee"
	qUpdateEmployee = `UPDATE employees SET
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
	
	updateEmployeePTID = "UpdateEmployeeID"
    qUpdateEmployeePTID = `UPDATE employees SET ptid = ? WHERE id = ?`

	updateReqUpdateEmployeeStatus  = "UpdateReqUpdateEmployeeStatus"
	qUpdateReqUpdateEmployeeStatus = `UPDATE req_personal_info SET status = ?, 
        rejection_reason = CASE WHEN ? = 'Rejected' THEN ? ELSE rejection_reason END
    WHERE employee_id = ?`

	deleteEmployee  = "DeleteEmployee"
	qDeleteEmployee = `DELETE FROM employees WHERE id = ?`

	deleteReqUpdateEmployee = "DeleteReqUpdateEmployee"
	qDeleteReqUpdateEmployee = `DELETE FROM req_personal_info WHERE employee_id = ?`
)

// Grade
const (
	getAllGrades  = "GetAllGrades"
	qGetAllGrades = `SELECT id, grade_name FROM grades`

	getGradeByID  = "GetGradeByID"
	qGetGradeByID = `SELECT id, grade_name FROM grades WHERE id = ?`

	createGrade  = "CreateGrade"
	qCreateGrade = `INSERT INTO grades (grade_name) VALUES (?)`

	updateGrade  = "UpdateGrade"
	qUpdateGrade = `UPDATE grades SET grade_name = ? WHERE id = ?`

	deleteGrade  = "DeleteGrade"
	qDeleteGrade = `DELETE FROM grades WHERE id = ?`
)

// Job Position
const (
	getAllJobPositions  = "GetAllJobPositions"
	qGetAllJobPositions = `SELECT id, job_name FROM job_positions`

	getJobPositionByID  = "GetJobPositionByID"
	qGetJobPositionByID = `SELECT id, job_name FROM job_positions WHERE id = ?`

	createJobPosition  = "CreateJobPosition"
	qCreateJobPosition = `INSERT INTO job_positions (job_name) VALUES (?)`

	updateJobPosition  = "UpdateJobPosition"
	qUpdateJobPosition = `UPDATE job_positions SET job_name = ? WHERE id = ?`

	deleteJobPosition  = "DeleteJobPosition"
	qDeleteJobPosition = `DELETE FROM job_positions WHERE id = ?`
)

// Location
const (
	getAllLocations  = "GetAllLocations"
	qGetAllLocations = `SELECT id, location_name, status FROM locations`

	getLocationByID  = "GetLocationByID"
	qGetLocationByID = `SELECT id, location_name, status FROM locations WHERE id = ?`

	createLocation  = "CreateLocation"
	qCreateLocation = `INSERT INTO locations (location_name, status) VALUES (?, ?)`

	updateLocation  = "UpdateLocation"
	qUpdateLocation = `UPDATE locations SET location_name = ?, status = ? WHERE id = ?`

	deleteLocation  = "DeleteLocation"
	qDeleteLocation = `DELETE FROM locations WHERE id = ?`
)

// Attendance
const (
	getAllAttendances  = "GetAllAttendances"
	qGetAllAttendances = `SELECT 
        id, 
        employee_id, 
        date, 
        CAST(check_in_time AS CHAR) AS check_in_time, 
        is_late, 
        CAST(check_out_time AS CHAR) AS check_out_time
    FROM attendance`

	getAttendanceByID  = "GetAttendanceByID"
	qGetAttendanceByID = `SELECT 
        id, 
        employee_id, 
        date, 
        CAST(check_in_time AS CHAR) AS check_in_time, 
        is_late, 
        CAST(check_out_time AS CHAR) AS check_out_time
    FROM attendance 
    WHERE id = ?`

	getAttendanceByDate  = "GetAttendanceByDate"
	qGetAttendanceByDate = `SELECT
		id,
		employee_id,
		date,
		CAST(check_in_time AS CHAR) AS check_in_time,
		is_late,
		CAST(check_out_time AS CHAR) AS check_out_time
	FROM attendance
	WHERE employee_id = ?
	AND date BETWEEN ? AND ?
	ORDER BY date DESC
	LIMIT ? OFFSET ?`

	getAllReqAttendance  = "GetAllReqAttendance"
	qGetAllReqAttendance = `SELECT
		id,
		employee_id,
		request_date,	
		check_in_time,	
		check_out_time,	
		reason,
		status,	
		rejection_reason,	
		created_at,
		updated_at
	FROM req_attendance`

	getReqAttendanceByNIP  = "GetReqAttendanceByNIP"
	qGetReqAttendanceByNIP = `SELECT 
		id,
		employee_id,
		request_date,	
		check_in_time,	
		check_out_time,	
		reason,
		status,	
		rejection_reason,	
		created_at,
		updated_at
	FROM req_attendance
	WHERE employee_id = ?
	ORDER BY created_at DESC`

	createAttendance  = "CreateAttendance"
	qCreateAttendance = `INSERT INTO attendance 
	(
		employee_id, 
		date, 
		check_in_time, 
		is_late, 
		check_out_time
	) VALUES (?, ?, ?, ?, ?)`

	createReqAttendance  = "CreateReqAttendance"
	qCreateReqAttendance = `INSERT INTO req_attendance
	(
		id,
		employee_id,
		request_date,	
		check_in_time,	
		check_out_time,	
		reason,
		status,	
		rejection_reason,	
		created_at,
		updated_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	updateAttendance  = "UpdateAttendance"
	qUpdateAttendance = `UPDATE attendance SET 
		employee_id = ?, 
		date = ?, 
		check_in_time = ?, 
		is_late = ?, 
		check_out_time = ?
	WHERE id = ?`

	updateReqAttendanceStatus = "UpdateReqAttendanceStatus"
	qUpdateReqAttendanceStatus = `UPDATE req_attendance SET 
		status = ?, 
		rejection_reason = CASE WHEN ? = 'Rejected' THEN ? ELSE rejection_reason END
	WHERE id = ?`	

	deleteAttendance  = "DeleteAttendance"
	qDeleteAttendance = `DELETE FROM attendance WHERE id = ?`
)

type (
	Data struct {
		db   *sqlx.DB
		stmt *map[string]*sqlx.Stmt
	}

	statement struct {
		key   string
		query string
	}
)

var (
	readStmt = []statement{
		// Employee
		{getAllEmployees, qGetAllEmployees},
		{getEmployeeByID, qGetEmployeeByID},
		{getEmployeeByNIP, qGetEmployeeByNIP},
		{getLastPTID, qGetLastPTID},
		{getAllReqUpdateEmployee, qGetAllReqUpdateEmployee},
		{getReqUpdateEmployeeByNIP, qGetReqUpdateEmployeeByNIP},

		// Grade
		{getAllGrades, qGetAllGrades},
		{getGradeByID, qGetGradeByID},

		// Job Position
		{getAllJobPositions, qGetAllJobPositions},
		{getJobPositionByID, qGetJobPositionByID},

		// Location
		{getAllLocations, qGetAllLocations},
		{getLocationByID, qGetLocationByID},

		// Attendance
		{getAllAttendances, qGetAllAttendances},
		{getAttendanceByID, qGetAttendanceByID},
		{getAttendanceByDate, qGetAttendanceByDate},
		{getAllReqAttendance, qGetAllReqAttendance},
		{getReqAttendanceByNIP, qGetReqAttendanceByNIP},
	}

	insertStmt = []statement{
		// Employee
		{createEmployee, qCreateEmployee},
		{createReqUpdateEmployee, qCreateReqUpdateEmployee},

		// Grade
		{createGrade, qCreateGrade},

		// Job Position
		{createJobPosition, qCreateJobPosition},

		// Location
		{createLocation, qCreateLocation},

		// Attendance
		{createAttendance, qCreateAttendance},
		{createReqAttendance, qCreateReqAttendance},
	}

	updateStmt = []statement{
		// Employee
		{updateEmployee, qUpdateEmployee},
		{updateEmployeePTID, qUpdateEmployeePTID},
		{updateReqUpdateEmployeeStatus, qUpdateReqUpdateEmployeeStatus},

		// Grade
		{updateGrade, qUpdateGrade},

		// Job Position
		{updateJobPosition, qUpdateJobPosition},

		// Location
		{updateLocation, qUpdateLocation},

		// Attendance
		{updateAttendance, qUpdateAttendance},
		{updateReqAttendanceStatus, qUpdateReqAttendanceStatus},
	}

	deleteStmt = []statement{
		// Employee
		{deleteEmployee, qDeleteEmployee},
		{deleteReqUpdateEmployee, qDeleteReqUpdateEmployee},

		// Grade
		{deleteGrade, qDeleteGrade},

		// Job Position
		{deleteJobPosition, qDeleteJobPosition},

		// Location
		{deleteLocation, qDeleteLocation},

		// Attendance
		{deleteAttendance, qDeleteAttendance},
	}
)

func New(db *sqlx.DB) *Data {
	var (
		stmts = make(map[string]*sqlx.Stmt)
	)

	d := &Data{
		db:   db,
		stmt: &stmts,
	}

	d.InitStmt()

	return d
}

func (d *Data) InitStmt() {
	var (
		err   error
		stmts = make(map[string]*sqlx.Stmt)
	)

	for _, v := range readStmt {
		stmts[v.key], err = d.db.PreparexContext(context.Background(), v.query)
		if err != nil {
			log.Fatalf("[DB] Failed to initialize select statement key %v, err : %v", v.key, err)
		}
	}

	for _, v := range insertStmt {
		stmts[v.key], err = d.db.PreparexContext(context.Background(), v.query)
		if err != nil {
			log.Fatalf("[DB] Failed to initialize insert statement key %v, err : %v", v.key, err)
		}
	}

	for _, v := range updateStmt {
		stmts[v.key], err = d.db.PreparexContext(context.Background(), v.query)
		if err != nil {
			log.Fatalf("[DB] Failed to initialize update statement key %v, err : %v", v.key, err)
		}
	}

	for _, v := range deleteStmt {
		stmts[v.key], err = d.db.PreparexContext(context.Background(), v.query)
		if err != nil {
			log.Fatalf("[DB] Failed to initialize delete statement key %v, err : %v", v.key, err)
		}
	}

	*d.stmt = stmts
}

func (d Data) BeginTx(ctx context.Context) (*sqlx.Tx, error) {

	tx, err := d.db.Beginx()
	if err != nil {
		return tx, errors.Wrap(err, "[DATA][BeginTx]")
	}

	return tx, nil
}
