import { Router } from "express";
import {
  getAllArtists,
  getArtistById,
  getArtistsByCategory,
  getRelatedArtists,
  getAllCategories,
  getArtistPlaylist,
} from "../controllers/artist.controller.js";

const artistRoutes = Router();

// Get all categories
artistRoutes.get("/categories", getAllCategories);

// Get all artists
artistRoutes.get("/", getAllArtists);

// Get artists by category
artistRoutes.get("/category/:category", getArtistsByCategory);

// Get artist by ID (includes songs)
artistRoutes.get("/:id", getArtistById);

// Get artist's playlist (songs only) - uses in-memory cache
artistRoutes.get("/:id/playlist", getArtistPlaylist);

// Get related artists
artistRoutes.get("/:id/related", getRelatedArtists);

export default artistRoutes;
