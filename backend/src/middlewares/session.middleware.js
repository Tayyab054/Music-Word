import session from "express-session";
import pgSession from "connect-pg-simple";
import db from "../config/db.config.js";

const PgStore = pgSession(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool: db,
    tableName: "user_sessions",
  }),
  name: "spotify.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
