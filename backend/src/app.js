import express from "express";
import cors from "cors";
import passport from "passport";

import setupPassport from "./config/passport.config.js";

import { sessionMiddleware } from "./middlewares/session.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import artistRoutes from "./routes/artist.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
  })
);

app.use(sessionMiddleware);

setupPassport();
app.use(passport.initialize());

/* ---------------- Routes ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
