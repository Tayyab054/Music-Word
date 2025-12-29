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
  completeOAuthProfile,
  checkOtpSession,
} from "../controllers/auth.controller.js";

import { requireOtpSession } from "../middlewares/otp.middleware.js";
import { requireOAuthSession } from "../middlewares/oauth.middleware.js";
import { loginLimiter } from "../middlewares/rateLimiters.middleware.js";

const authRoutes = Router();

/* ========================= SIGNUP FLOW ========================= */

// Step 1: Register new user (send OTP)
authRoutes.post("/register", signUp);

// Step 2: Verify OTP (creates account for signup flow)
authRoutes.post("/verify-otp", requireOtpSession, verifyOtp);

// Resend OTP
authRoutes.post("/resend-otp", resendOtp);

/* ========================= LOGIN/LOGOUT ========================= */

// Login with email & password
authRoutes.post("/login", loginLimiter, login);

// Logout user
authRoutes.post("/logout", logout);

// Get current authenticated user
authRoutes.get("/me", getCurrentUser);

/* ========================= PASSWORD RESET ========================= */

// Start forgot-password flow (send OTP)
authRoutes.post("/forgot-password", forgotPassword);

// Reset password after OTP verification
authRoutes.post("/reset-password", requireOtpSession, resetPassword);

/* ========================= AVAILABILITY CHECKS ========================= */

// Check if email exists
authRoutes.post("/check-email", checkEmailAvailability);

/* ========================= GOOGLE OAUTH ========================= */

// Redirect to Google OAuth
authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_BASE_URL}/login?error=oauth_failed`,
  }),
  googleCallback
);

// Complete OAuth profile
authRoutes.post("/oauth/complete", requireOAuthSession, completeOAuthProfile);

/* ========================= SESSION CHECKS ========================= */

// Check OTP session status
authRoutes.get("/otp-session", checkOtpSession);

// OAuth session validation
authRoutes.get("/oauth-session", requireOAuthSession, (req, res) => {
  res.json({
    success: true,
    email: req.session.oauth.email,
    name: req.session.oauth.name,
  });
});

export default authRoutes;
