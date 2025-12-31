import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function OTPVerificationFormPage() {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Check if there's a valid OTP session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await authApi.checkOtpSession();
        if (data.hasSession) {
          setSessionInfo(data);
        } else {
          navigate("/signup");
        }
      } catch (err) {
        navigate("/signup");
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

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    const result = await verifyOtp(otpCode);

    if (result.success) {
      if (result.flow === "signup") {
        // Account created - redirect to home
        navigate("/");
      } else if (result.flow === "reset-password") {
        navigate("/reset-password");
      }
    } else {
      setError(result.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    const result = await resendOtp();

    if (result.success) {
      setResendCooldown(60);
      setError("");
    } else {
      setError(result.message || "Failed to resend OTP");
    }

    setResendLoading(false);
  };

  return (
    <AuthLayout title="Spotify" subtitle="Verify your email">
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="auth-description">
          We've sent a verification code to{" "}
          <strong>{sessionInfo?.email || "your email"}</strong>
        </p>

        {error && <div className="auth-error">{error}</div>}

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
            />
          ))}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="auth-resend">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className="resend-button"
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
