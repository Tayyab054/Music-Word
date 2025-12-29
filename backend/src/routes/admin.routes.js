import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  getDashboardStats,
  addSong,
  updateSong,
  deleteSong,
  addArtist,
  updateArtist,
  deleteArtist,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  createAdmin,
} from "../controllers/admin.controller.js";

const adminRoutes = Router();

// All admin routes require authentication and admin role
adminRoutes.use(requireAuth);
adminRoutes.use(requireAdmin);

/* ========================= DASHBOARD ========================= */

adminRoutes.get("/stats", getDashboardStats);

/* ========================= SONG MANAGEMENT ========================= */

adminRoutes.post("/songs", addSong);
adminRoutes.put("/songs/:id", updateSong);
adminRoutes.delete("/songs/:id", deleteSong);

/* ========================= ARTIST MANAGEMENT ========================= */

adminRoutes.post("/artists", addArtist);
adminRoutes.put("/artists/:id", updateArtist);
adminRoutes.delete("/artists/:id", deleteArtist);

/* ========================= USER MANAGEMENT ========================= */

adminRoutes.get("/users", getAllUsers);
adminRoutes.get("/users/:id", getUserById);
adminRoutes.put("/users/:id/role", updateUserRole);
adminRoutes.delete("/users/:id", deleteUser);
adminRoutes.post("/users/admin", createAdmin);

export default adminRoutes;
