import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    await logout();
    navigate("/");
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

        {/* Desktop Library */}
        <Link to="/library" className="link">
          My Library
        </Link>

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
                  <div className="profile-info">
                    <strong>{user?.name}</strong>
                    <small>{user?.email}</small>
                  </div>

                  {/* Mobile Library */}
                  <Link
                    to="/library"
                    className="profile-library"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Library
                  </Link>

                  {user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setProfileOpen(false)}>
                      Admin Panel
                    </Link>
                  )}

                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
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
