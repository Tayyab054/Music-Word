import { Router } from "express";
import {
  search,
  searchSongs,
  searchArtists,
  autocomplete,
} from "../controllers/search.controller.js";

const searchRoutes = Router();

// Global search
searchRoutes.get("/", search);

// Search songs only
searchRoutes.get("/songs", searchSongs);

// Search artists only
searchRoutes.get("/artists", searchArtists);

// Autocomplete suggestions
searchRoutes.get("/autocomplete", autocomplete);

export default searchRoutes;
