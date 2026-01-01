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

artistRoutes.get("/categories", getAllCategories);
artistRoutes.get("/", getAllArtists);
artistRoutes.get("/category/:category", getArtistsByCategory);
artistRoutes.get("/:id", getArtistById);
artistRoutes.get("/:id/playlist", getArtistPlaylist);
artistRoutes.get("/:id/related", getRelatedArtists);

export default artistRoutes;
