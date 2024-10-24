package models

// Point represents a point in a 2D space with X and Y coordinates.
type Point struct {
	X float64 `json:"x"` // The X coordinate of the point, represented as a float64.
	Y float64 `json:"y"` // The Y coordinate of the point, represented as a float64.
}

// Drawing represents a drawing with an ID, path, and color.
type Drawing struct {
	ID    int     `json:"id"`    // The unique identifier for the drawing.
	Path  []Point `json:"path"`  // The path of the drawing, represented as a slice of Point objects.
	Color string  `json:"color"` // The color of the drawing, represented as a string.
}
