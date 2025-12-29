import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await forgotPassword(email);

    if (result.success) {
      navigate("/verify-otp");
    } else {
      setError(result.message || "Failed to send reset code");
    }

    setLoading(false);
  };

  return (
    <AuthLayout title="Spotify" subtitle="Reset your password">
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="auth-description">
          Enter your email address and we'll send you a code to reset your
          password.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Code"}
        </button>

        <div className="auth-switch">
          Remember your password?{" "}
          <Link to="/login" className="auth-link">
            Log in here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
