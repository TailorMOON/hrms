package entity

type Location struct {
	ID           int    `db:"id" json:"id"`
	LocationName string `db:"location_name" json:"location_name"`
	Status       string `db:"status" json:"status"`
}
