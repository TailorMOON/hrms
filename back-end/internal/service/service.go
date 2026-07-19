package service

import (
	"backend/internal/entity"
	"backend/pkg/errors"
	"backend/pkg/log"
	"context"
	"encoding/json"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Auth interface {
	BeginTx(ctx context.Context) (*sqlx.Tx, error)

	AuthenticateEmployee(ctx context.Context, nip string, password string) (string, error)
}

type Data interface {
	BeginTx(ctx context.Context) (*sqlx.Tx, error)

	GetAllEmployees(ctx context.Context) ([]entity.Employee, error)
	GetAllReqUpdateEmployee(ctx context.Context) ([]entity.EmployeeRequest, error)
	GetEmployeeByID(ctx context.Context, id int) (entity.Employee, error)
	GetEmployeeByNIP(ctx context.Context, ptid string) (entity.Employee, error)
	GetReqUpdateEmployeeByNIP(ctx context.Context, nip string) (string, string, error)
	CreateEmployee(ctx context.Context, data entity.Employee, tx *sqlx.Tx) error
	CreateReqUpdateEmployee(ctx context.Context, data entity.EmployeeRequest, tx *sqlx.Tx) error
	UpdateEmployee(ctx context.Context, data entity.Employee, tx *sqlx.Tx) error
	UpdateReqUpdateEmployeeStatus(ctx context.Context, ptid string, status string, rejectReason string, tx *sqlx.Tx) error 
	DeleteEmployee(ctx context.Context, id int, tx *sqlx.Tx) error
	DeleteReqUpdateEmployee(ctx context.Context, nip string, tx *sqlx.Tx) error 

	GetAllGrades(ctx context.Context) ([]entity.Grade, error)
	GetGradeByID(ctx context.Context, id int) (entity.Grade, error)
	CreateGrade(ctx context.Context, data entity.Grade, tx *sqlx.Tx) error
	UpdateGrade(ctx context.Context, data entity.Grade, tx *sqlx.Tx) error
	DeleteGrade(ctx context.Context, id int, tx *sqlx.Tx) error

	GetAllJobPositions(ctx context.Context) ([]entity.JobPosition, error)
	GetJobPositionByID(ctx context.Context, id int) (entity.JobPosition, error)
	CreateJobPosition(ctx context.Context, data entity.JobPosition, tx *sqlx.Tx) error
	UpdateJobPosition(ctx context.Context, data entity.JobPosition, tx *sqlx.Tx) error
	DeleteJobPosition(ctx context.Context, id int, tx *sqlx.Tx) error

	GetAllLocations(ctx context.Context) ([]entity.Location, error)
	GetLocationByID(ctx context.Context, id int) (entity.Location, error)
	CreateLocation(ctx context.Context, data entity.Location, tx *sqlx.Tx) error
	UpdateLocation(ctx context.Context, data entity.Location, tx *sqlx.Tx) error
	DeleteLocation(ctx context.Context, id int, tx *sqlx.Tx) error

	GetAllAttendances(ctx context.Context) ([]entity.Attendance, error)
	GetAttendanceByID(ctx context.Context, id int) (entity.Attendance, error)
	GetAttendanceByDate(ctx context.Context, employee_id string, startDate string, endDate string, limit int, offset int) ([]entity.Attendance, error)
	GetAllReqAttendance(ctx context.Context) ([]entity.AttendanceRequest, error)
	GetReqAttendanceByNIP(ctx context.Context, employeeID string) ([]entity.AttendanceRequest, error)
	CreateReqAttendance(ctx context.Context, data entity.AttendanceRequest, tx *sqlx.Tx) error 
	CreateAttendance(ctx context.Context, data entity.Attendance, tx *sqlx.Tx) error
	UpdateAttendance(ctx context.Context, data entity.Attendance, tx *sqlx.Tx) error
	UpdateReqAttendanceStatus(ctx context.Context, id int, status string, rejectionReason *string, tx *sqlx.Tx) error 
	DeleteAttendance(ctx context.Context, id int, tx *sqlx.Tx) error
}

type Service struct {
	data Data
	log  log.Logger
}

func New(data Data, log log.Logger) Service {
	return Service{
		data: data,
		log:  log,
	}
}

func (s Service) LogInfo(ctx context.Context, message string, fields map[string]interface{}) {
	if fields == nil {
		fields = map[string]interface{}{}
	}

	fieldsJSON, err := json.Marshal(fields)
	if err != nil {
		s.log.Error(ctx, fmt.Sprintf("Failed to marshal fields: %v", fields))
		fieldsJSON = []byte("{}")
	}

	formattedMessage := fmt.Sprintf("%s | Fields: %s", message, string(fieldsJSON))
	s.log.Info(ctx, formattedMessage)
}

func (s Service) LogError(ctx context.Context, message string, fields map[string]interface{}) {
	if fields == nil {
		fields = map[string]interface{}{}
	}

	fieldsJSON, err := json.Marshal(fields)
	if err != nil {
		s.log.Error(ctx, fmt.Sprintf("Failed to marshal fields: %v", fields))
		fieldsJSON = []byte("{}")
	}

	formattedMessage := fmt.Sprintf("%s | Fields: %s", message, string(fieldsJSON))
	s.log.Error(ctx, formattedMessage)
}

func (s Service) WrapError(err error, message string) error {
	return errors.Wrap(err, message)
}
