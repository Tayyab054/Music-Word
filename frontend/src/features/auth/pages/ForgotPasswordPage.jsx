import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import { useDebounce } from "../hooks/useDebounce";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email availability checking
  const [emailStatus, setEmailStatus] = useState("idle"); // idle, checking, exists, not-found
  const debouncedEmail = useDebounce(email, 500);

  // Check if email exists when debounced email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (
        !debouncedEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)
      ) {
        setEmailStatus("idle");
        return;
      }

      setEmailStatus("checking");
      try {
        const response = await authApi.checkEmail(debouncedEmail);
        // For forgot password, we want the email to exist (not available)
        setEmailStatus(response.data?.available ? "not-found" : "exists");
      } catch (err) {
        setEmailStatus("idle");
      }
    };

    checkEmailExists();
  }, [debouncedEmail]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setEmailStatus("idle");
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (emailStatus === "not-found") {
      setError("No account found with this email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Wait for email check to complete if still checking
    if (emailStatus === "checking") {
      return;
    }

    setLoading(true);
    setError("");

    const result = await forgotPassword(email);

    if (result.success) {
      navigate("/auth/verify-otp");
    } else {
      setError(result.message || "Failed to send reset code");
    }

    setLoading(false);
  };

  // Email status icon
  const renderEmailStatus = () => {
    if (emailStatus === "checking") {
      return <FaSpinner className="input-status checking spin" />;
    }
    if (emailStatus === "exists") {
      return <FaCheck className="input-status available" />;
    }
    if (emailStatus === "not-found") {
      return <FaTimes className="input-status taken" />;
    }
    return null;
  };

  return (
    <AuthLayout title="Spotify" subtitle="Reset your password">
      <button
        type="button"
        className="auth-close-btn"
        onClick={() => navigate("/auth/login")}
        aria-label="Close"
      >
        <IoMdClose />
      </button>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <p className="auth-description">
          Enter your email address and we'll send you a code to reset your
          password.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <div className="input-with-status">
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={
                error || emailStatus === "not-found" ? "input-error" : ""
              }
            />
            {renderEmailStatus()}
          </div>
          {emailStatus === "not-found" && !error && (
            <span className="field-error">
              No account found with this email
            </span>
          )}
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={
            loading || emailStatus === "checking" || emailStatus === "not-found"
          }
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>

        <div className="auth-switch">
          Remember your password?{" "}
          <Link to="/auth/login" className="auth-link">
            Log in here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
