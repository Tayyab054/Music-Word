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

songRoutes.get("/", getAllSongs);
songRoutes.get("/popular", getPopularSongs);
songRoutes.get("/category/:category", getSongsByCategory);
songRoutes.get("/artist/:artistId", getSongsByArtist);
songRoutes.get("/:id", getSongById);
songRoutes.post("/:id/play", playSong);

export default songRoutes;
