import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/apiClient";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) {
          return "Please enter your email address";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        return "";
      case "password":
        if (!value) {
          return "Please enter your password";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous general error
    setErrors((prev) => ({ ...prev, general: "" }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setErrors({ general: result.message || "Invalid email or password" });
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${apiClient.defaults.baseURL}/api/auth/google`;
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
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.general && <div className="auth-error">{errors.general}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email"
            className={touched.email && errors.email ? "input-error" : ""}
          />
          {touched.email && errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Password"
            className={touched.password && errors.password ? "input-error" : ""}
          />
          {touched.password && errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Signing in..." : "Log In"}
        </button>

        <Link to="/auth/forgot-password" className="auth-link">
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
          <Link to="/auth/signup" className="auth-link">
            Sign up for Spotify
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
