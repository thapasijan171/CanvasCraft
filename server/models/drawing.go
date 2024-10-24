package models

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Drawing struct {
	ID    int     `json:"id"`
	Path  []Point `json:"path"`
	Color string  `json:"color"`
}
