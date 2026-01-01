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

libraryRoutes.use(requireAuth);

libraryRoutes.get("/", getLibrary);
libraryRoutes.get("/history", getHistory);
libraryRoutes.delete("/history", clearHistory);
libraryRoutes.get("/check/:songId", checkInLibrary);
libraryRoutes.post("/:songId", addToLibrary);
libraryRoutes.delete("/:songId", removeFromLibrary);

export default libraryRoutes;
