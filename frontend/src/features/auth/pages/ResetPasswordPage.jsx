import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import AuthLayout from "../components/AuthLayout";
import "../styles/auth.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if there's a valid reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await authApi.checkOtpSession();
        if (
          !data.hasSession ||
          !data.verified ||
          data.flow !== "reset-password"
        ) {
          navigate("/auth/forgot-password");
        }
      } catch (err) {
        navigate("/auth/forgot-password");
      }
    };
    checkSession();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

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

    const result = await resetPassword(formData.password);

    if (result.success) {
      navigate("/auth/login");
    } else {
      setErrors({ general: result.message });
    }

    setLoading(false);
  };

  return (
    <AuthLayout title="Spotify" subtitle="Create new password">
      <form onSubmit={handleSubmit} className="auth-form">
        {errors.general && <div className="auth-error">{errors.general}</div>}

        <p className="auth-description">
          Your new password must be different from previously used passwords.
        </p>

        <div className="auth-field">
          <label htmlFor="password">New password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
            required
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
