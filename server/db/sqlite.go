package db

import (
	"database/sql" // Import the database/sql package for database operations.
	"log"          // Import the log package for logging messages.

	_ "github.com/mattn/go-sqlite3" // Import the SQLite driver for database connection.
)

// Global variable to hold the database connection.
var DB *sql.DB

// InitDB initializes the database connection and creates the drawings table if it doesn't exist.
func InitDB() {
	var err error
	// Open a connection to the SQLite database file.
	DB, err = sql.Open("sqlite3", "./drawings.db")
	if err != nil {
		panic(err) // Panic if there is an error opening the database.
	}

	// SQL statement to create the 'drawings' table if it doesn't already exist.
	createTable := `
	CREATE TABLE IF NOT EXISTS drawings (
		id INTEGER PRIMARY KEY AUTOINCREMENT, // Unique identifier for each drawing.
		path TEXT,                             // Column to store the drawing path (as a string).
		color TEXT                             // Column to store the color of the drawing (as a string).
	);`
	// Execute the SQL statement to create the table.
	_, err = DB.Exec(createTable)
	if err != nil {
		panic(err) // Panic if there is an error executing the SQL statement.
	}
	
	// Log a message indicating that the database connection was successful.
	log.Println("Database connected successfully.")
}
