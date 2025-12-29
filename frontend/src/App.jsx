import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

// Pages
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import Library from "./pages/Library";
import Search from "./pages/Search";
import Artist from "./pages/Artist";

// Auth Pages
import LoginPage from "./features/auth/pages/LoginPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import OTPVerificationFormPage from "./features/auth/pages/OTPVerificationFormPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSongs from "./pages/admin/Songs";
import AdminArtists from "./pages/admin/Artists";
import AdminUsers from "./pages/admin/Users";

import "./App.css";

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Guest route wrapper (for login/signup pages)
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/artist/:artistId" element={<Artist />} />
      <Route path="/playlist/:playlistId" element={<Playlist />} />

      {/* Auth Routes (Guest Only) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignUpPage />
          </GuestRoute>
        }
      />
      <Route path="/verify-otp" element={<OTPVerificationFormPage />} />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes (User) */}
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/songs"
        element={
          <ProtectedRoute adminOnly>
            <AdminSongs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/artists"
        element={
          <ProtectedRoute adminOnly>
            <AdminArtists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
