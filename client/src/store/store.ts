/* 
   - Importing the `create` function from Zustand for state management.
   - Importing the `Drawing` type for type safety.
   - Defining the structure of the drawing store:
     - `drawings`: An array of `Drawing` objects.
     - `addDrawing`: A function to add a new drawing to the store.
     - `setDrawings`: A function to set the entire list of drawings in the store.
     - `clearDrawings`: A function to clear all drawings in the store.
   - Using `create` from Zustand to instantiate the drawing store with initial state and actions.
   - Initial state sets `drawings` to an empty array.
   - Updates the state to add a new drawing to the existing array of drawings.
   - Uses a functional update to ensure the previous state is considered.
   - Resets the `drawings` state to an empty array, effectively clearing all drawings.
   - Accepts an array of drawings and updates the store with this array.
   - Includes a check to ensure the provided `drawings` argument is an array; logs an error if not.
 
*/


import { create } from "zustand";
import { Drawing } from "../types/types";

interface DrawingStore {
  drawings: Drawing[];
  addDrawing: (drawing: Drawing) => void;
  setDrawings: (drawings: Drawing[]) => void;
  clearDrawings: () => void;
}

export const useDrawingStore = create<DrawingStore>((set) => ({
  drawings: [], // Initialize the drawings array as empty.

  // Define the 'addDrawing' function to update the state with a new drawing.
  addDrawing: (drawing) =>
    set((state) => ({
      drawings: [...state.drawings, drawing], // Spread the existing drawings and add the new one.
    })),

  // Define the 'clearDrawings' function to reset the drawings array to empty.
  clearDrawings: () =>
    set(() => ({
      drawings: [], // Reset drawings to an empty array.
    })),

  // Define the 'setDrawings' function to replace the entire drawings array.
  setDrawings: (drawings) => {
    if (Array.isArray(drawings)) { // Check if the provided argument is an array.
      set({ drawings }); // Update the state with the new array of drawings.
    } else {
      // Log an error if the provided argument is not an array.
      console.error("setDrawings: expected an array, received:", drawings);
    }
  },
}));
