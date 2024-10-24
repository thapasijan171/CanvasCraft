package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/db"
	"server/models"
)

func SaveDrawingHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Println("SaveDrawingHandler")
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    var drawing models.Drawing
    if err := json.NewDecoder(r.Body).Decode(&drawing); err != nil {
        http.Error(w, "Invalid drawing data", http.StatusBadRequest)
        return
    }

    stmt, err := db.DB.Prepare("INSERT INTO drawings (path, color) VALUES (?, ?)")
    if err != nil {
        log.Println("Error preparing statement:", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }
    defer stmt.Close()

    pathJSON, _ := json.Marshal(drawing.Path)
    if _, err := stmt.Exec(pathJSON, drawing.Color); err != nil {
        log.Println("Error executing statement:", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
}

// retrieves all drawings from the database
func GetDrawingsHandler(w http.ResponseWriter, r *http.Request) {
	// Query the database to select id, path, and color from the drawings table.
	rows, err := db.DB.Query("SELECT id, path, color FROM drawings")
	if err != nil {
		// If there's an error with the query, respond with an internal server error.
		http.Error(w, "Error retrieving drawings", http.StatusInternalServerError)
		return
	}
	defer rows.Close() // Ensure the rows are closed after processing.

	var drawings []models.Drawing // Slice to hold the retrieved drawing objects.
	for rows.Next() {
		var drawing models.Drawing    // Create a new Drawing object for each row.
		var pathJSON string            // Variable to hold the path JSON string from the database.

		// Scan the row into the Drawing object and pathJSON variable.
		if err := rows.Scan(&drawing.ID, &pathJSON, &drawing.Color); err != nil {
			// If there's an error scanning the row, respond with an internal server error.
			http.Error(w, "Error scanning drawing", http.StatusInternalServerError)
			return
		}

		// Unmarshal the JSON string into the Path field of the Drawing object.
		if err := json.Unmarshal([]byte(pathJSON), &drawing.Path); err != nil {
			// If there's an error unmarshalling the path, respond with an internal server error.
			http.Error(w, "Error unmarshalling drawing path", http.StatusInternalServerError)
			return
		}

		drawings = append(drawings, drawing) // Append the drawing to the slice.
	}

	// Set the response header to indicate JSON content type.
	w.Header().Set("Content-Type", "application/json")
	// Encode the drawings slice as JSON and send it in the response.
	json.NewEncoder(w).Encode(drawings)
}