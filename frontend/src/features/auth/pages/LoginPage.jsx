import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <AuthLayout title="Spotify" subtitle="Log in to continue">
      <button
        type="button"
        className="auth-close-btn"
        onClick={() => navigate("/")}
        aria-label="Close"
      >
        <IoMdClose />
      </button>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Signing in..." : "Log In"}
        </button>

        <Link to="/forgot-password" className="auth-link">
          Forgot your password?
        </Link>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="auth-button google-button"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            width="20"
            height="20"
          />
          Continue with Google
        </button>

        <div className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up for Spotify
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
