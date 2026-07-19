package entity

import (
	"time"
)

type Attendance struct {
	ID             		int       `db:"id" json:"id"`
	EmployeeID     		string     `db:"employee_id" json:"employee_id"`
	Date           		time.Time `db:"date" json:"date"`
	CheckInTime    		string	  `db:"check_in_time" json:"check_in_time"`
	IsLate         		bool      `db:"is_late" json:"is_late"`
	CheckOutTime   		string	  `db:"check_out_time" json:"check_out_time"`
}

type AttendanceRequest struct {
    ID              int       `db:"id"`               
    EmployeeID      string    `db:"employee_id"`
    RequestDate     time.Time `db:"request_date"`
    CheckInTime     string    `db:"check_in_time"`
    CheckOutTime    string    `db:"check_out_time"`
    Reason          string    `db:"reason"`
    Status          string    `db:"status"`
    RejectionReason string    `db:"rejection_reason"` 
    CreatedAt       time.Time `db:"created_at"`
    UpdatedAt       time.Time `db:"updated_at"`
}