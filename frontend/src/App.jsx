import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

import Home from "./features/home/pages/Home";
import Playlist from "./features/songs/pages/Playlist";
import Library from "./features/library/pages/Library";
import History from "./features/history/pages/History";
import Search from "./features/search/pages/Search";
import Artist from "./features/artist/pages/Artist";

import LoginPage from "./features/auth/pages/LoginPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import OTPVerificationFormPage from "./features/auth/pages/OTPVerificationFormPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppLayout() {
  return (
    <PlayerProvider>
      <Outlet />
    </PlayerProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/artist/:artistId",
        element: <Artist />,
      },
      {
        path: "/playlist/:playlistId",
        element: <Playlist />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: "/auth/login",
            element: <LoginPage />,
          },
          {
            path: "/auth/signup",
            element: <SignUpPage />,
          },
          {
            path: "/auth/forgot-password",
            element: <ForgotPasswordPage />,
          },
        ],
      },
      {
        path: "/auth/verify-otp",
        element: <OTPVerificationFormPage />,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/library",
            element: <Library />,
          },
          {
            path: "/history",
            element: <History />,
          },
        ],
      },
      {
        path: "/login",
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: "/signup",
        element: <Navigate to="/auth/signup" replace />,
      },
      {
        path: "/forgot-password",
        element: <Navigate to="/auth/forgot-password" replace />,
      },
      {
        path: "/verify-otp",
        element: <Navigate to="/auth/verify-otp" replace />,
      },
      {
        path: "/reset-password",
        element: <Navigate to="/auth/reset-password" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
