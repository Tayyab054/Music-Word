import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

export default function Users() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.users.getAll();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (userId === user?.user_id) {
      alert("You cannot change your own role");
      return;
    }

    try {
      await adminAPI.users.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId) => {
    if (userId === user?.user_id) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminAPI.users.delete(userId);
      loadUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (
      !adminFormData.email ||
      !adminFormData.password ||
      !adminFormData.name
    ) {
      setError("All fields are required");
      return;
    }

    try {
      await adminAPI.users.createAdmin(adminFormData);
      setShowCreateAdmin(false);
      setAdminFormData({ email: "", password: "", name: "" });
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to create admin");
    }
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
          <Link to="/admin" className="nav-item">
            📊 Dashboard
          </Link>
          <Link to="/admin/songs" className="nav-item">
            🎵 Songs
          </Link>
          <Link to="/admin/artists" className="nav-item">
            🎤 Artists
          </Link>
          <Link to="/admin/users" className="nav-item active">
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
          <h1>Users Management</h1>
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="add-button"
          >
            + Create Admin
          </button>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.user_id}
                      className={
                        u.user_id === user?.user_id ? "current-user" : ""
                      }
                    >
                      <td>{u.name || "-"}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleUpdateRole(u.user_id, e.target.value)
                          }
                          disabled={u.user_id === user?.user_id}
                          className={`role-select role-${u.role}`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="actions-cell">
                        {u.user_id !== user?.user_id ? (
                          <button
                            onClick={() => handleDelete(u.user_id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="you-badge">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="no-data">No users found</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateAdmin(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Admin</h2>

            {error && <div className="modal-error">{error}</div>}

            <form onSubmit={handleCreateAdmin}>
              <div className="form-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={adminFormData.name}
                  onChange={(e) =>
                    setAdminFormData({ ...adminFormData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Password *</label>
                <input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      password: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
