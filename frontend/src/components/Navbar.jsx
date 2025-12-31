import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMusic,
  FaHistory,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import "../styles/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const close = (e) => {
      if (
        !searchRef.current?.contains(e.target) &&
        !profileRef.current?.contains(e.target)
      ) {
        setOpen(false);
        setProfileOpen(false);
      }

      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    setProfileOpen(false);
    await logout();
    navigate("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
    }
  };

  return (
    <header className={`navbar ${open ? "search-open" : ""}`}>
      <div className="nav-left">
        <Link to="/" className="brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
            alt="Spotify"
          />
          <span>Spotify</span>
        </Link>

        {/* Desktop search */}
        <form
          ref={searchRef}
          className={`search ${open ? "show" : ""}`}
          onSubmit={handleSearch}
        >
          <FaSearch />
          <input
            placeholder="What do you want to play?"
            autoFocus={open}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="nav-right">
        {/* Mobile search */}
        <button className="icon mobile" onClick={() => setOpen(true)}>
          <FaSearch />
        </button>

        {/* Desktop Library & History */}
        <Link to="/library" className="link">
          My Library
        </Link>
        {isAuthenticated && (
          <Link to="/history" className="link">
            History
          </Link>
        )}

        {isAuthenticated ? (
          <>
            {/* Admin Link */}
            {user?.role === "admin" && (
              <Link to="/admin" className="link admin-link">
                Admin
              </Link>
            )}

            {/* Profile */}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-avatar"
                onClick={() => setProfileOpen((p) => !p)}
              >
                {userInitial}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  {/* User Info Header */}
                  <div className="profile-header">
                    <div className="profile-avatar-large">{userInitial}</div>
                    <div className="profile-details">
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>

                  <div className="profile-divider" />

                  {/* Menu Items */}
                  <div className="profile-menu-items">
                    <Link
                      to="/library"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaMusic className="menu-icon" />
                      <span>My Library</span>
                    </Link>

                    <Link
                      to="/history"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FaHistory className="menu-icon" />
                      <span>Listening History</span>
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="profile-menu-item admin-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaCog className="menu-icon" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="profile-divider" />

                  {/* Logout Button */}
                  <button
                    className="profile-menu-item logout-item"
                    onClick={handleLogoutClick}
                  >
                    <FaSignOutAlt className="menu-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
              <ConfirmModal
                title="Logout"
                message="Are you sure you want to logout?"
                confirmText="Yes, Logout"
                cancelText="Cancel"
                confirmStyle="danger"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutDialog(false)}
              />
            )}
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
            <Link to="/login" className="login-btn">
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
