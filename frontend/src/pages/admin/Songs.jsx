import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { songsAPI, artistsAPI, adminAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

export default function Songs() {
  const { user, logout } = useAuth();
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    song_url: "",
    artist_id: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [songsData, artistsData] = await Promise.all([
        songsAPI.getAll(),
        artistsAPI.getAll(),
      ]);
      setSongs(songsData.songs || []);
      setArtists(artistsData.artists || []);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingSong(null);
    setFormData({ title: "", image_url: "", song_url: "", artist_id: "" });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      image_url: song.image_url || "",
      song_url: song.song_url || "",
      artist_id: song.artist_id || "",
    });
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.song_url || !formData.artist_id) {
      setError("Title, song URL, and artist are required");
      return;
    }

    try {
      if (editingSong) {
        await adminAPI.songs.update(editingSong.song_id, formData);
      } else {
        await adminAPI.songs.add(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save song");
    }
  };

  const handleDelete = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    try {
      await adminAPI.songs.delete(songId);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete song");
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
          <Link to="/admin/songs" className="nav-item active">
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
          <h1>Songs Management</h1>
          <button onClick={openAddModal} className="add-button">
            + Add Song
          </button>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Loading songs...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.song_id}>
                      <td>
                        <img
                          src={song.image_url || "/default-song.png"}
                          alt={song.title}
                          className="table-thumb"
                        />
                      </td>
                      <td>{song.title}</td>
                      <td>{song.artist_name || "-"}</td>
                      <td>{song.category || "-"}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => openEditModal(song)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(song.song_id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {songs.length === 0 && (
                <div className="no-data">No songs found</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSong ? "Edit Song" : "Add New Song"}</h2>

            {error && <div className="modal-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Artist *</label>
                <select
                  value={formData.artist_id}
                  onChange={(e) =>
                    setFormData({ ...formData, artist_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select artist</option>
                  {artists.map((artist) => (
                    <option key={artist.artist_id} value={artist.artist_id}>
                      {artist.artist_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Song URL *</label>
                <input
                  type="url"
                  value={formData.song_url}
                  onChange={(e) =>
                    setFormData({ ...formData, song_url: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
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
                  {editingSong ? "Update" : "Add"} Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
