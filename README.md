# CanvasCraft

A real-time drawing application built with Go for the backend and React with TypeScript and Zustand for the frontend. The app allows users to draw collaboratively, with changes saved in SQLite.

<p align="center">
 <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,go,sqlite,ts,vite&perline=5" />
  </a>
</p>

### Preview

<p align="center">
<img width="650px" src="preview.png" alt="Preview" />
</p>

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/thapasijan171/CanvasCraft.git
   cd CanvasCraft
   ```

2. Install backend dependencies and run the server:

   ```bash
   cd server
   go mod tidy
   go run main.go
   ```

> [!NOTE]  
> The server will start running on port 8080.

3. Install frontend dependencies and run the client:

   ```bash
   cd ..
   npm install
   npm run dev
   ```

> [!NOTE]  
> The client will start running on port 5173.
