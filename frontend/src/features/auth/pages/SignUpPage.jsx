import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.name
    );

    if (result.success) {
      navigate("/verify-otp");
    } else {
      setErrors({ general: result.message });
    }

    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = authApi.googleAuthUrl;
  };

  return (
    <AuthLayout title="Spotify" subtitle="Sign up for free">
      <button
        type="button"
        className="auth-close-btn"
        onClick={() => navigate("/")}
        aria-label="Close"
      >
        <IoMdClose />
      </button>
      <form onSubmit={handleSubmit} className="auth-form">
        {errors.general && <div className="auth-error">{errors.general}</div>}

        <div className="auth-field">
          <label htmlFor="email">What's your email?</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="name">What should we call you?</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter a profile name"
            required
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Create a password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="auth-button google-button"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            width="20"
            height="20"
          />
          Sign up with Google
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
