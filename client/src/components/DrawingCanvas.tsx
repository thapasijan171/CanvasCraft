/*
 **ToDo**
   - Importing necessary hooks from React: `useEffect`, `useRef`, `useState`.
   - Importing functions and types from custom store (`useDrawingStore`) and types (`Drawing`, `Point`).
   - `canvasRef`: Stores reference to the canvas DOM element.
   - `isDrawing`: Tracks if the user is currently drawing on the canvas.
   - `currentPath`: Stores the current path (array of points) being drawn.
   - `currentColor`: Stores the currently selected color for drawing.
   - `socketRef`: Stores reference to a WebSocket for real-time drawing sync.
   - Initializes WebSocket connection to a local server.
   - Handles incoming WebSocket messages for either adding new drawings or clearing them.
   - Fetches initial drawing data from an API and updates the state.
   - Ensures the WebSocket connection is closed when the component unmounts.
   - Clears the canvas and redraws all stored drawings every time `drawings` state changes.
   - Loops over each drawing and renders the path using its stored color.
   - Called when the user starts drawing on the canvas (mouse down event).
   - Initializes a new drawing path and sets up the drawing context on the canvas.
   - Called while the user is dragging the mouse (mouse move event) to draw lines.
   - Updates the canvas by extending the current path and rendering it.
   - Called when the user stops drawing (mouse up or mouse leave event).
   - Finalizes the current drawing, adds it to the drawing state, and sends it via WebSocket to other connected clients.
   - Clears all drawings locally and sends a WebSocket message to other clients to clear their canvases as well.
   - Includes a color picker to allow the user to select the drawing color.
   - A "Clear" button to clear the canvas.
   - The canvas itself, which listens for mouse events to handle drawing.
*/

import React, { useEffect, useRef, useState } from "react";
import { useDrawingStore } from "../store/store";
import { Drawing, Point } from "../types/types";

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#ffffff");
  const { drawings, setDrawings, addDrawing, clearDrawings } =
    useDrawingStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initSocket = () => {
      socketRef.current = new WebSocket("ws://localhost:8080/ws");
      socketRef.current.onmessage = (event) => {
        const newDrawing = JSON.parse(event.data);
        if (newDrawing.type === "clear") {
          clearDrawings(); // clear drawings when event is received
        } else {
          addDrawing(newDrawing);
        }
      };
    };

    const fetchDrawings = async () => {
      try {
        const response = await fetch("/api/drawings");
        const data: Drawing[] = await response.json();
        setDrawings(data);
      } catch (error) {
        console.error("Error fetching drawings:", error);
      }
    };

    initSocket();
    fetchDrawings();

    return () => socketRef.current?.close();
  }, [addDrawing, clearDrawings, setDrawings]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawings.forEach(({ path, color }) => {
        if (path.length) {
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          path.forEach(({ x, y }) => ctx.lineTo(x, y));
          ctx.stroke();
        }
      });
    }
  }, [drawings]);

  const startDrawing = ({
    clientX,
    clientY,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      setIsDrawing(true);
      const { left, top } = canvas.getBoundingClientRect();
      ctx.strokeStyle = currentColor;
      ctx.beginPath();
      ctx.moveTo(clientX - left, clientY - top);
      setCurrentPath([{ x: clientX - left, y: clientY - top }]);
    }
  };

  const draw = ({ clientX, clientY }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const { left, top } = canvas.getBoundingClientRect();
      ctx.lineTo(clientX - left, clientY - top);
      ctx.stroke();
      setCurrentPath((prev) => [
        ...prev,
        { x: clientX - left, y: clientY - top },
      ]);
    }
  };

  const stopDrawing = () => {
    if (currentPath.length) {
      const newDrawing = { path: currentPath, color: currentColor };
      addDrawing(newDrawing);
      socketRef.current?.send(JSON.stringify(newDrawing));
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    clearDrawings();
    socketRef.current?.send(JSON.stringify({ type: "clear" })); // Send clear event to all clients
  };

  return (
    <div>
      <div className="color-picker-container">
        <label className="color-label">
          Color:
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="color-input"
          />
        </label>
      </div>
      <button onClick={clearCanvas}>Clear</button>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
