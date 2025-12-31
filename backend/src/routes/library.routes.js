import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getLibrary,
  addToLibrary,
  removeFromLibrary,
  checkInLibrary,
  getHistory,
  clearHistory,
} from "../controllers/library.controller.js";

const libraryRoutes = Router();

// All library routes require authentication
libraryRoutes.use(requireAuth);

// Get user's library
libraryRoutes.get("/", getLibrary);

// Get play history
libraryRoutes.get("/history", getHistory);

// Clear play history
libraryRoutes.delete("/history", clearHistory);

// Check if song is in library
libraryRoutes.get("/check/:songId", checkInLibrary);

// Add song to library
libraryRoutes.post("/:songId", addToLibrary);

// Remove song from library
libraryRoutes.delete("/:songId", removeFromLibrary);

export default libraryRoutes;
