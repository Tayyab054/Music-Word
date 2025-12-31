import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPVerificationFormPage() {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Track attempts and resends
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [resendsRemaining, setResendsRemaining] = useState(MAX_RESENDS);

  // Check if there's a valid OTP session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await authApi.checkOtpSession();
        if (data.hasSession) {
          setSessionInfo(data);
          // Start cooldown if session just started
          if (!data.verified) {
            setResendCooldown(RESEND_COOLDOWN);
          }
        } else {
          navigate("/auth/signup");
        }
      } catch (err) {
        navigate("/auth/signup");
      } finally {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value.slice(-1); // Only keep last digit
      return newOtp;
    });
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = Array(6).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the appropriate input
    if (pastedData.length < 6) {
      const nextInput = document.getElementById(`otp-${pastedData.length}`);
      if (nextInput) nextInput.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (attemptsRemaining <= 0) {
      setError("Too many failed attempts. Please request a new code.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyOtp(otpCode);

    if (result.success) {
      setSuccess("Verification successful!");
      if (result.flow === "signup") {
        // Account created - redirect to home
        setTimeout(() => navigate("/"), 500);
      } else if (result.flow === "reset-password") {
        setTimeout(() => navigate("/auth/reset-password"), 500);
      }
    } else {
      // Update attempts remaining from server response
      if (result.attemptsRemaining !== undefined) {
        setAttemptsRemaining(result.attemptsRemaining);
      } else {
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
      }
      setError(result.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      document.getElementById("otp-0")?.focus();
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendsRemaining <= 0) return;

    setResendLoading(true);
    setError("");

    const result = await resendOtp();

    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN);
      setAttemptsRemaining(MAX_ATTEMPTS); // Reset attempts on new OTP
      if (result.resendsRemaining !== undefined) {
        setResendsRemaining(result.resendsRemaining);
      } else {
        setResendsRemaining((prev) => Math.max(0, prev - 1));
      }
      setSuccess("New code sent to your email!");
      setTimeout(() => setSuccess(""), 3000);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } else {
      if (result.resendsRemaining !== undefined) {
        setResendsRemaining(result.resendsRemaining);
      }
      setError(result.message || "Failed to resend code");
    }

    setResendLoading(false);
  };

  const handleCancel = () => {
    if (sessionInfo?.flow === "signup") {
      navigate("/auth/signup");
    } else {
      navigate("/auth/forgot-password");
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  if (sessionLoading) {
    return (
      <AuthLayout title="Spotify" subtitle="Loading...">
        <div className="auth-loading">
          <div className="loading-spinner"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Spotify"
      subtitle={
        sessionInfo?.flow === "signup"
          ? "Verify your email"
          : "Reset your password"
      }
    >
      <button
        type="button"
        className="auth-close-btn"
        onClick={handleCancel}
        aria-label="Close"
      >
        <IoMdClose />
      </button>

      <form onSubmit={handleSubmit} className="auth-form">
        <p className="auth-description">
          We've sent a 6-digit verification code to{" "}
          <strong>{sessionInfo?.email || "your email"}</strong>
        </p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* OTP Inputs */}
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              autoFocus={index === 0}
              disabled={loading || attemptsRemaining <= 0}
            />
          ))}
        </div>

        {/* Attempts remaining warning */}
        {attemptsRemaining < MAX_ATTEMPTS && attemptsRemaining > 0 && (
          <p className="attempts-warning">
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""}{" "}
            remaining
          </p>
        )}

        {attemptsRemaining <= 0 && (
          <p className="attempts-exhausted">
            Too many failed attempts. Please request a new code.
          </p>
        )}

        <button
          type="submit"
          className="auth-button"
          disabled={loading || attemptsRemaining <= 0}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {/* Resend section */}
        <div className="otp-resend-section">
          <p className="auth-resend">
            Didn't receive the code?{" "}
            {resendsRemaining > 0 ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="resend-button"
              >
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${formatTime(resendCooldown)}`
                  : "Resend code"}
              </button>
            ) : (
              <span className="resend-exhausted">No resends remaining</span>
            )}
          </p>
          {resendsRemaining > 0 && resendsRemaining < MAX_RESENDS && (
            <p className="resends-remaining">
              {resendsRemaining} resend{resendsRemaining !== 1 ? "s" : ""} left
            </p>
          )}
        </div>

        {/* Start over link */}
        <div className="auth-switch">
          <Link
            to={
              sessionInfo?.flow === "signup"
                ? "/auth/signup"
                : "/auth/forgot-password"
            }
            className="auth-link"
          >
            ← Start over
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
