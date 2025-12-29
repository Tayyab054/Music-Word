import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Spotify Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item active">
            📊 Dashboard
          </Link>
          <Link to="/admin/songs" className="nav-item">
            🎵 Songs
          </Link>
          <Link to="/admin/artists" className="nav-item">
            🎤 Artists
          </Link>
          <Link to="/admin/users" className="nav-item">
            👥 Users
          </Link>
          <Link to="/" className="nav-item">
            🏠 Back to App
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.name}</span>
            <small>{user?.email}</small>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard</h1>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Loading stats...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎵</div>
                <div className="stat-info">
                  <h3>{stats?.totalSongs || 0}</h3>
                  <p>Total Songs</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎤</div>
                <div className="stat-info">
                  <h3>{stats?.totalArtists || 0}</h3>
                  <p>Total Artists</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats?.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-info">
                  <h3>{stats?.totalCategories || 0}</h3>
                  <p>Categories</p>
                </div>
              </div>
            </div>
          )}

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/admin/songs" className="action-card">
                <span className="action-icon">➕</span>
                <span>Add New Song</span>
              </Link>
              <Link to="/admin/artists" className="action-card">
                <span className="action-icon">➕</span>
                <span>Add New Artist</span>
              </Link>
              <Link to="/admin/users" className="action-card">
                <span className="action-icon">👤</span>
                <span>Manage Users</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
