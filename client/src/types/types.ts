export interface Point {
  x: number; // The x-coordinate of the point.
  y: number; // The y-coordinate of the point.
}

// Define the 'Drawing' interface representing a drawing with a path and color.
export interface Drawing {
  path: Point[]; // An array of Points that defines the path of the drawing.
  color: string; // The color of the drawing, represented as a string (e.g., HEX, RGB).
}