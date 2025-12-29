import { Router } from "express";
import {
  getAllSongs,
  getSongById,
  getSongsByArtist,
  getSongsByCategory,
  getPopularSongs,
  playSong,
} from "../controllers/song.controller.js";

const songRoutes = Router();

// Get all songs
songRoutes.get("/", getAllSongs);

// Get popular songs
songRoutes.get("/popular", getPopularSongs);

// Get songs by category
songRoutes.get("/category/:category", getSongsByCategory);

// Get songs by artist
songRoutes.get("/artist/:artistId", getSongsByArtist);

// Get song by ID
songRoutes.get("/:id", getSongById);

// Play song (records play history if authenticated)
songRoutes.post("/:id/play", playSong);

export default songRoutes;
