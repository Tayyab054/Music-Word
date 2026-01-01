import { Router } from "express";
import passport from "passport";

import {
  signUp,
  login,
  logout,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  checkEmailAvailability,
  getCurrentUser,
  googleCallback,
  checkOtpSession,
} from "../controllers/auth.controller.js";

import { requireOtpSession } from "../middlewares/otp.middleware.js";
import { loginLimiter } from "../middlewares/rateLimiters.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", signUp);
authRoutes.post("/verify-otp", requireOtpSession, verifyOtp);
authRoutes.post("/resend-otp", resendOtp);

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", getCurrentUser);

authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", requireOtpSession, resetPassword);

authRoutes.post("/check-email", checkEmailAvailability);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_BASE_URL}/login?error=oauth_failed`,
  }),
  googleCallback
);

authRoutes.get("/otp-session", checkOtpSession);

export default authRoutes;
