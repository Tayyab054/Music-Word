import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db.config.js";
import memoryStore from "../store/memoryStore.js";
import { sendEmailVerificationOtp } from "../services/email.service.js";

/* ===================== CONSTANTS ===================== */
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_HASH_ROUNDS = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_RESEND_COUNT = 3;

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/* ===================== AVAILABILITY CHECK ===================== */

export async function checkEmailAvailability(req, res) {
  const { email } = req.body;

  try {
    const { rowCount } = await db.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    res.json({
      success: true,
      available: rowCount === 0,
      message:
        rowCount === 0
          ? "Email is available."
          : "This email is already registered.",
    });
  } catch (err) {
    console.error("Email availability error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to check email availability. Please try again.",
    });
  }
}

/* ===================== SIGNUP FLOW ===================== */

// Step 1: Start signup - send OTP
export async function signUp(req, res) {
  const { email, password, name } = req.body;

  try {
    // Check if email already exists
    const { rowCount } = await db.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, OTP_HASH_ROUNDS);

    req.session.otp = {
      flow: "signup",
      email,
      code: otpHash,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      resendCount: 0,
      verified: false,
      payload: {
        email,
        name,
        password: hashedPassword,
      },
    };

    await sendEmailVerificationOtp(email, otp);

    res.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
}

// Step 2: Verify OTP (and create account for signup)
export async function verifyOtp(req, res) {
  const { otp } = req.body;
  const otpSession = req.session.otp;

  if (!otpSession) {
    return res.status(401).json({
      success: false,
      message: "Verification session expired.",
    });
  }

  if (Date.now() > otpSession.expiresAt) {
    delete req.session.otp;
    return res.status(410).json({
      success: false,
      message: "OTP expired. Please request a new one.",
    });
  }

  if (otpSession.attempts >= MAX_VERIFY_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please request a new code.",
      attemptsRemaining: 0,
    });
  }

  const isValid = await bcrypt.compare(otp, otpSession.code);

  if (!isValid) {
    otpSession.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - otpSession.attempts;
    return res.status(400).json({
      success: false,
      message: `Invalid verification code. ${remaining} attempt${
        remaining !== 1 ? "s" : ""
      } remaining.`,
      attemptsRemaining: remaining,
    });
  }

  // OTP verified
  otpSession.verified = true;

  // For signup flow, create account immediately
  if (otpSession.flow === "signup") {
    try {
      const p = otpSession.payload;

      // Insert user into database
      const { rows } = await db.query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, 'user') 
         RETURNING user_id, name, email, role`,
        [p.email, p.password, p.name]
      );

      const user = rows[0];

      // Add to memory store
      memoryStore.addUser(user);

      // Clear OTP session and set user session
      delete req.session.otp;
      req.session.userId = user.user_id;
      req.session.role = user.role;

      return res.json({
        success: true,
        message: "Account created successfully.",
        flow: "signup",
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Account creation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
      });
    }
  }

  // For reset-password flow
  res.json({
    success: true,
    message: "OTP verified successfully.",
    next: "/reset-password",
    flow: otpSession.flow,
  });
}

/* ===================== RESEND OTP ===================== */

export async function resendOtp(req, res) {
  const oldOtp = req.session.otp;

  if (!oldOtp) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please start again.",
    });
  }

  const currentResendCount = oldOtp.resendCount || 0;

  if (currentResendCount >= MAX_RESEND_COUNT) {
    return res.status(429).json({
      success: false,
      message: "Maximum resend limit reached. Please start again.",
      resendsRemaining: 0,
    });
  }

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, OTP_HASH_ROUNDS);

  oldOtp.code = hashedOtp;
  oldOtp.expiresAt = Date.now() + OTP_TTL_MS;
  oldOtp.attempts = 0;
  oldOtp.resendCount = currentResendCount + 1;

  await sendEmailVerificationOtp(oldOtp.email, otp);

  res.json({
    success: true,
    message: "New verification code sent.",
    resendsRemaining: MAX_RESEND_COUNT - oldOtp.resendCount,
  });
}

/* ===================== LOGIN ===================== */

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const { rows } = await db.query(
      "SELECT user_id, name, email, password, role FROM users WHERE email = $1",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    // OAuth users don't have password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please login with Google.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    req.session.userId = user.user_id;
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}

/* ===================== LOGOUT ===================== */

export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed.",
      });
    }
    res.clearCookie("spotify.sid");
    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  });
}

/* ===================== GET CURRENT USER ===================== */

export function getCurrentUser(req, res) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  const user = memoryStore.getUser(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  res.json({
    success: true,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

/* ===================== FORGOT PASSWORD ===================== */

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const { rows, rowCount } = await db.query(
      "SELECT user_id, name FROM users WHERE email = $1",
      [email]
    );

    // Always return success to prevent email enumeration
    if (rowCount === 0) {
      return res.json({
        success: true,
        message: "If an account exists, a verification code has been sent.",
      });
    }

    const user = rows[0];
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, OTP_HASH_ROUNDS);

    req.session.otp = {
      flow: "reset-password",
      email,
      userId: user.user_id,
      code: otpHash,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      resendCount: 0,
      verified: false,
    };

    await sendEmailVerificationOtp(email, otp);

    res.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
}

/* ===================== RESET PASSWORD ===================== */

export async function resetPassword(req, res) {
  const { password } = req.body;
  const otpSession = req.session.otp;

  if (
    !otpSession ||
    !otpSession.verified ||
    otpSession.flow !== "reset-password"
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized reset attempt.",
    });
  }

  try {
    // Check if new password is same as old
    const { rows } = await db.query(
      "SELECT password FROM users WHERE email = $1",
      [otpSession.email]
    );

    if (rows.length > 0 && rows[0].password) {
      const isSamePassword = await bcrypt.compare(password, rows[0].password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as the old password.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    await db.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      otpSession.email,
    ]);

    delete req.session.otp;

    res.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
}

/* ===================== GOOGLE OAUTH ===================== */

export function googleCallback(req, res) {
  if (req.user.oauthPending) {
    // New user - create account with Google info
    req.session.oauth = {
      email: req.user.email,
      name: req.user.name,
    };
    // Redirect to create account
    res.redirect(`${process.env.CLIENT_BASE_URL}/oauth-complete`);
  } else {
    // Existing user, set session
    req.session.userId = req.user.user_id;
    req.session.role = req.user.role;
    res.redirect(process.env.CLIENT_BASE_URL);
  }
}

export async function completeOAuthProfile(req, res) {
  const oauth = req.session.oauth;

  if (!oauth) {
    return res.status(401).json({
      success: false,
      message: "OAuth session expired.",
    });
  }

  try {
    // Insert user (no password for OAuth users)
    const { rows } = await db.query(
      `INSERT INTO users (email, name, role) 
       VALUES ($1, $2, 'user') 
       RETURNING user_id, name, email, role`,
      [oauth.email, oauth.name]
    );

    const user = rows[0];

    // Add to memory store
    memoryStore.addUser(user);

    // Set session
    delete req.session.oauth;
    req.session.userId = user.user_id;
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Account created successfully.",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Complete OAuth profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
}

/* ===================== CHECK SESSION STATUS ===================== */

export function checkOtpSession(req, res) {
  const otpSession = req.session.otp;
  const oauthSession = req.session.oauth;

  if (otpSession) {
    return res.json({
      success: true,
      hasSession: true,
      flow: otpSession.flow,
      verified: otpSession.verified,
      email: otpSession.email,
    });
  }

  if (oauthSession) {
    return res.json({
      success: true,
      hasSession: true,
      flow: "oauth",
      email: oauthSession.email,
      name: oauthSession.name,
    });
  }

  res.json({
    success: true,
    hasSession: false,
  });
}
