import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./db.config.js";
import memoryStore from "../store/memoryStore.js";

export default function setupPassport() {
  // Only setup Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (_, __, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;

            const { rows } = await db.query(
              "SELECT user_id, role, name, email FROM users WHERE email = $1",
              [email]
            );

            // Existing user → login directly
            if (rows.length > 0) {
              const user = rows[0];
              memoryStore.addUser(user);
              return done(null, { user_id: user.user_id, role: user.role });
            }

            // New user → Create account directly with Google info
            const { rows: newUserRows } = await db.query(
              `INSERT INTO users (email, name, role) 
               VALUES ($1, $2, 'user') 
               RETURNING user_id, name, email, role`,
              [email, name]
            );

            const newUser = newUserRows[0];
            memoryStore.addUser(newUser);

            return done(null, { user_id: newUser.user_id, role: newUser.role });
          } catch (err) {
            done(err);
          }
        }
      )
    );
  } else {
    console.warn("⚠️  Google OAuth credentials not found - OAuth disabled");
  }

  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "identifier",
        passwordField: "password",
      },
      async (identifier, password, cb) => {
        try {
          const isEmail = identifier.includes("@");

          const query = isEmail
            ? "SELECT * FROM users WHERE email = $1"
            : "SELECT * FROM users WHERE username = $1";

          const { rows, rowCount } = await db.query(query, [identifier]);

          if (rowCount === 0)
            return cb(null, false, {
              message: "Invalid email/username or password",
            });

          const user = rows[0];
          const match = await bcrypt.compare(password, user.password);

          if (!match)
            return cb(null, false, {
              message: "Invalid email/username or password",
            });

          cb(null, { user_id: user.user_id, role: user.role });
        } catch (err) {
          console.error("Login server error:", err);
          return cb(null, false, {
            message: "Internal server error. Please try again later.",
          });
        }
      }
    )
  );
}
