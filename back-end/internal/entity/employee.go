package entity

import "time"

type Employee struct {
    ID            int       `db:"id" json:"id"`
    PTID          string    `db:"ptid" json:"ptid"`
    Username      string    `db:"username" json:"username"`
    Password      string    `db:"password" json:"password"`
    BirthDate     time.Time `db:"birth_date"`
    BirthDateStr  string    `json:"birth_date"`
    Address       string    `db:"address" json:"address"`
    LocationID    int       `db:"location_id" json:"location_id"`
    JoinDate      time.Time `db:"join_date"`
    JoinDateStr   string    `json:"join_date"`
    Phone         string    `db:"phone" json:"phone"`
    MaritalStatus string    `db:"marital_status" json:"marital_status"`
    IsAdmin       bool      `db:"is_admin" json:"is_admin"`
    GradeID       int       `db:"grade_id" json:"grade_id"`
    Name          string    `db:"name" json:"name"`
    JobPositionID int       `db:"job_position_id" json:"job_position_id"`
    Email         string    `db:"email" json:"email"`
}

type EmployeeRequest struct {
    ID                  int       `db:"id" json:"id"`              
    EmployeeID          string    `db:"employee_id" json:"employee_id"`
    Username            string    `db:"username" json:"username"`
    OldUsername         string    `db:"old_username" json:"old_username"`
    BirthDate           time.Time `db:"birth_date" json:"birth_date"`
    OldBirthDate        time.Time `db:"old_birth_date" json:"old_birth_date"`
    Address             string    `db:"address" json:"address"`
    OldAddress          string    `db:"old_address" json:"old_address"`
    LocationID          int       `db:"location_id" json:"location_id"`
    OldLocationID       int       `db:"old_location_id" json:"old_location_id"`
    Phone               string    `db:"phone" json:"phone"`
    OldPhone            string    `db:"old_phone" json:"old_phone"`
    MaritalStatus       string    `db:"marital_status" json:"marital_status"`
    OldMaritalStatus    string    `db:"old_marital_status" json:"old_marital_status"`
    GradeID             int       `db:"grade_id" json:"grade_id"`
    OldGradeID          int       `db:"old_grade_id" json:"old_grade_id"`
    Name                string    `db:"name" json:"name"`       
    OldName             string    `db:"old_name" json:"old_name"`            
    JobPositionID       int       `db:"job_position_id" json:"job_position_id"` 
    OldJobPositionID    int       `db:"old_job_position_id" json:"old_job_position_id"` 
    Email               string    `db:"email" json:"email"`          
    OldEmail            string    `db:"old_email" json:"old_email"`          
    Status              string    `db:"status" json:"status"`
    RejectionReason     string    `db:"rejection_reason" json:"rejection_reason"`
    CreatedAt           time.Time `db:"created_at" json:"created_at"`
    UpdatedAt           time.Time `db:"updated_at" json:"updated_at"`
}
