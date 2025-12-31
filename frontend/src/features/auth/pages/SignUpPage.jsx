import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../api/authApi";
import { useDebounce } from "../hooks/useDebounce";
import {
  validatePassword,
  isPasswordValid,
  arePasswordsValidAndMatch,
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "../util/passwordValidation";
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
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Email checking state
  const [emailStatus, setEmailStatus] = useState("idle"); // idle, checking, available, taken
  const debouncedEmail = useDebounce(formData.email, 500);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    maxLength: true,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSymbol: false,
    match: false,
  });
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  // Check email availability when debounced email changes
  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !/\S+@\S+\.\S+/.test(debouncedEmail)) {
        setEmailStatus("idle");
        return;
      }

      setEmailStatus("checking");
      try {
        const response = await authApi.checkEmail(debouncedEmail);
        setEmailStatus(response.data?.available ? "available" : "taken");
        if (!response.data?.available) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
        } else {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      } catch (err) {
        setEmailStatus("idle");
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  // Update password validation when password or confirmPassword changes
  useEffect(() => {
    setPasswordValidation(
      validatePassword(formData.password, formData.confirmPassword)
    );
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific errors when user types
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: "" }));
      setEmailStatus("idle");
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
        if (emailStatus === "taken") {
          return "This email is already registered";
        }
        return "";
      case "name":
        if (!value.trim()) {
          return "Please enter your name";
        }
        if (value.length < 2) {
          return "Name must be at least 2 characters";
        }
        return "";
      case "password":
        if (!value) {
          return "Please create a password";
        }
        if (!isPasswordValid(passwordValidation)) {
          return "Password does not meet requirements";
        }
        return "";
      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        }
        if (formData.password !== value) {
          return "Passwords do not match";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handlePasswordFocus = () => {
    setShowPasswordReqs(true);
  };

  const validateForm = () => {
    const newErrors = {};

    // Mark all fields as touched on submit
    setTouched({
      email: true,
      name: true,
      password: true,
      confirmPassword: true,
    });

    if (!formData.email) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (emailStatus === "taken") {
      newErrors.email = "This email is already registered";
    }

    if (!formData.name) {
      newErrors.name = "Please enter your name";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.password) {
      newErrors.password = "Please create a password";
    } else if (!isPasswordValid(passwordValidation)) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (!arePasswordsValidAndMatch(passwordValidation)) {
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
      navigate("/auth/verify-otp");
    } else {
      setErrors({ general: result.message });
    }

    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = authApi.googleAuthUrl;
  };

  // Password strength calculation
  const passwordStrength = getPasswordStrength(passwordValidation);
  const strengthLabel = getPasswordStrengthLabel(passwordStrength);
  const strengthColor = getPasswordStrengthColor(passwordStrength);

  // Email status icon
  const renderEmailStatus = () => {
    if (emailStatus === "checking") {
      return <FaSpinner className="input-status checking spin" />;
    }
    if (emailStatus === "available") {
      return <FaCheck className="input-status available" />;
    }
    if (emailStatus === "taken") {
      return <FaTimes className="input-status taken" />;
    }
    return null;
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
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.general && <div className="auth-error">{errors.general}</div>}

        {/* Email Field */}
        <div className="auth-field">
          <label htmlFor="email">What's your email?</label>
          <div className="input-with-status">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={
                (touched.email && errors.email) || emailStatus === "taken"
                  ? "input-error"
                  : ""
              }
            />
            {renderEmailStatus()}
          </div>
          {touched.email && errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>

        {/* Name Field */}
        <div className="auth-field">
          <label htmlFor="name">What should we call you?</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter a profile name"
            className={touched.name && errors.name ? "input-error" : ""}
          />
          {touched.name && errors.name && (
            <span className="field-error">{errors.name}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="auth-field">
          <label htmlFor="password">Create a password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={handlePasswordFocus}
            onBlur={handleBlur}
            placeholder="Create a password"
            className={touched.password && errors.password ? "input-error" : ""}
          />
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(passwordStrength / 4) * 100}%`,
                    backgroundColor: strengthColor,
                  }}
                />
              </div>
              <span className="strength-label" style={{ color: strengthColor }}>
                {strengthLabel}
              </span>
            </div>
          )}
          {touched.password && errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        {/* Password Requirements */}
        {showPasswordReqs && (
          <div className="password-requirements">
            <p className="requirements-title">Password must have:</p>
            <ul className="requirements-list">
              <li
                className={passwordValidation.minLength ? "valid" : "invalid"}
              >
                {passwordValidation.minLength ? <FaCheck /> : <FaTimes />}
                8-64 characters
              </li>
              <li
                className={
                  passwordValidation.hasUpper && passwordValidation.hasLower
                    ? "valid"
                    : "invalid"
                }
              >
                {passwordValidation.hasUpper && passwordValidation.hasLower ? (
                  <FaCheck />
                ) : (
                  <FaTimes />
                )}
                Upper & lowercase letters
              </li>
              <li
                className={passwordValidation.hasNumber ? "valid" : "invalid"}
              >
                {passwordValidation.hasNumber ? <FaCheck /> : <FaTimes />}
                At least one number
              </li>
              <li
                className={passwordValidation.hasSymbol ? "valid" : "invalid"}
              >
                {passwordValidation.hasSymbol ? <FaCheck /> : <FaTimes />}
                At least one special character
              </li>
            </ul>
          </div>
        )}

        {/* Confirm Password Field */}
        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="input-with-status">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              className={
                touched.confirmPassword && errors.confirmPassword
                  ? "input-error"
                  : ""
              }
            />
            {formData.confirmPassword && (
              <>
                {passwordValidation.match ? (
                  <FaCheck className="input-status available" />
                ) : (
                  <FaTimes className="input-status taken" />
                )}
              </>
            )}
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={
            loading || emailStatus === "taken" || emailStatus === "checking"
          }
        >
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
          <Link to="/auth/login" className="auth-link">
            Log in here
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
