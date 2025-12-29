import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const data = await authAPI.me();
      setUser(data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      // Don't set error for 401 (not authenticated)
      if (err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const data = await authAPI.login(identifier, password);
      setUser(data.user);
      setError(null);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = await authAPI.register({ email, password, name });
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const data = await authAPI.verifyOtp(otp);
      // If signup flow, user is created and returned
      if (data.user) {
        setUser(data.user);
      }
      return { success: true, ...data };
    } catch (err) {
      return { success: false, message: err.message, ...err };
    }
  };

  const resendOtp = async () => {
    try {
      const data = await authAPI.resendOtp();
      return { success: true, ...data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const data = await authAPI.forgotPassword(email);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const resetPassword = async (password) => {
    try {
      const data = await authAPI.resetPassword(password);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
