import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { artistsAPI, adminAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

export default function Artists() {
  const { user, logout } = useAuth();
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [formData, setFormData] = useState({
    artist_name: "",
    category: "",
    image_url: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [artistsData, categoriesData] = await Promise.all([
        artistsAPI.getAll(),
        artistsAPI.getCategories(),
      ]);
      setArtists(artistsData.artists || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingArtist(null);
    setFormData({ artist_name: "", category: "", image_url: "" });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (artist) => {
    setEditingArtist(artist);
    setFormData({
      artist_name: artist.artist_name,
      category: artist.category || "",
      image_url: artist.image_url || "",
    });
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.artist_name) {
      setError("Artist name is required");
      return;
    }

    try {
      if (editingArtist) {
        await adminAPI.artists.update(editingArtist.artist_id, formData);
      } else {
        await adminAPI.artists.add(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save artist");
    }
  };

  const handleDelete = async (artistId) => {
    if (
      !window.confirm(
        "Are you sure? This will also delete all songs by this artist."
      )
    )
      return;

    try {
      await adminAPI.artists.delete(artistId);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete artist");
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
          <Link to="/admin/artists" className="nav-item active">
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
          <h1>Artists Management</h1>
          <button onClick={openAddModal} className="add-button">
            + Add Artist
          </button>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Loading artists...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((artist) => (
                    <tr key={artist.artist_id}>
                      <td>
                        <img
                          src={artist.image_url || "/default-artist.png"}
                          alt={artist.artist_name}
                          className="table-thumb"
                        />
                      </td>
                      <td>{artist.artist_name}</td>
                      <td>{artist.category || "-"}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => openEditModal(artist)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(artist.artist_id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {artists.length === 0 && (
                <div className="no-data">No artists found</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingArtist ? "Edit Artist" : "Add New Artist"}</h2>

            {error && <div className="modal-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Artist Name *</label>
                <input
                  type="text"
                  value={formData.artist_name}
                  onChange={(e) =>
                    setFormData({ ...formData, artist_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Pop, Rock, Hip-Hop"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="form-field">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingArtist ? "Update" : "Add"} Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
