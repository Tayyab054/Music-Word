import { Router } from "express";
import {
  search,
  searchSongs,
  searchArtists,
  autocomplete,
} from "../controllers/search.controller.js";

const searchRoutes = Router();

searchRoutes.get("/", search);
searchRoutes.get("/songs", searchSongs);
searchRoutes.get("/artists", searchArtists);
searchRoutes.get("/autocomplete", autocomplete);

export default searchRoutes;
