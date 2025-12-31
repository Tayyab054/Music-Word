import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AudioPlayer from "../../player/components/AudioPlayer";
import { usePlayer } from "../../../context/PlayerContext";
import { useAuth } from "../../../context/AuthContext";
import { libraryApi } from "../../library/api/libraryApi";
import "../styles/library.css";

const Library = () => {
  const navigate = useNavigate();
  const { playSong, currentSong } = usePlayer();
  const { isAuthenticated } = useAuth();
  const [librarySongs, setLibrarySongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    loadLibrary();
  }, [isAuthenticated, navigate]);

  const loadLibrary = async () => {
    try {
      const response = await libraryApi.get();
      setLibrarySongs(response.data?.songs || []);
    } catch (err) {
      console.error("Error loading library:", err);
    }
    setLoading(false);
  };

  const handlePlay = (song) => {
    playSong(song, librarySongs);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRemoveFromLibrary = async (songId) => {
    try {
      await libraryApi.remove(songId);
      setLibrarySongs((prev) => prev.filter((song) => song.song_id !== songId));
    } catch (err) {
      console.error("Error removing from library:", err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="library-container">
        <div className="library-header">
          <div className="header-content">
            <h1>❤️ Your Library</h1>
            <p>{librarySongs.length} songs saved</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your library...</p>
          </div>
        ) : librarySongs.length > 0 ? (
          <div className="songs-section">
            <div className="songs-list">
              {librarySongs.map((song) => (
                <div
                  key={song.song_id}
                  className={`song-row ${
                    currentSong?.song_id === song.song_id ? "active" : ""
                  }`}
                >
                  <div className="song-main" onClick={() => handlePlay(song)}>
                    <img
                      src={song.image_url || "/default-song.png"}
                      alt={song.title}
                      className="song-thumb"
                    />
                    <div className="song-info">
                      <span className="song-title">{song.title}</span>
                      <span className="song-artist">{song.artist_name}</span>
                    </div>
                  </div>
                  <span className="song-duration">
                    {song.duration ? formatDuration(song.duration) : "3:45"}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromLibrary(song.song_id);
                    }}
                    title="Remove from library"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎶</div>
            <h2>Your library is empty</h2>
            <p>Add songs from the home page or artist pages</p>
          </div>
        )}
      </main>
      <Footer />
      <AudioPlayer />
    </>
  );
};

export default Library;
