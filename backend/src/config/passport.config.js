import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "./db.config.js";
import memoryStore from "../store/memoryStore.js";

export default function setupPassport() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = `${process.env.SERVER_BASE_URL}/api/auth/google/callback`;

    console.log(`📍 Google OAuth callback URL: ${callbackURL}`);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL,
        },
        async (_, __, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;

            const { rows } = await db.query(
              "SELECT user_id, role, name, email FROM users WHERE email = $1",
              [email]
            );

            if (rows.length > 0) {
              const user = rows[0];
              memoryStore.addUser(user);
              return done(null, { user_id: user.user_id, role: user.role });
            }

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
}
