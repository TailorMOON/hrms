package entity

type JobPosition struct {
	ID      int    `db:"id" json:"id"`
	JobName string `db:"job_name" json:"job_name"`
}
