package entity

type Grade struct {
	ID   int    `db:"id" json:"id"`
	GradeName string `db:"grade_name" json:"grade_name"`
}
