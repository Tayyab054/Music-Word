import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import Toast from "../components/Toast";
import { libraryAPI } from "../api";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import "../styles/playlist.css";

const Library = () => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { isAuthenticated } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      loadLibrary();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadLibrary = async () => {
    try {
      const data = await libraryAPI.getLibrary();
      setSongs(data.library || []);
    } catch (err) {
      console.error("Error loading library:", err);
    }
    setLoading(false);
  };

  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    try {
      await libraryAPI.remove(songId);
      setSongs(songs.filter((s) => s.song_id !== songId));
      setToast("Removed from Library");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setToast("Failed to remove song");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="library-empty">
          <h2>Sign in to view your library</h2>
          <p>Save songs and create playlists</p>
          <Link to="/login" className="login-btn">
            Log In
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Library Header */}
      <div
        className="playlist-header"
        style={{
          background: "linear-gradient(180deg, #535353 0%, #121212 100%)",
        }}
      >
        <div className="playlist-icon">📚</div>
        <div className="playlist-info">
          <span className="playlist-type">PLAYLIST</span>
          <h1>My Library</h1>
          <p>{songs.length} songs</p>
        </div>
      </div>

      {/* Controls */}
      <div className="playlist-controls">
        <button
          className="play-all-btn"
          onClick={handlePlayAll}
          disabled={songs.length === 0}
        >
          ▶️ Play All
        </button>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading your library...</div>
        ) : songs.length === 0 ? (
          <div className="library-empty-songs">
            <h3>Your library is empty</h3>
            <p>Add songs to your library by clicking the + button</p>
            <Link to="/search" className="browse-btn">
              Browse Music
            </Link>
          </div>
        ) : (
          <div className="songs-list">
            {songs.map((song, index) => (
              <div
                key={song.song_id}
                className={`song-row ${
                  currentSong?.song_id === song.song_id ? "playing" : ""
                }`}
                onClick={() => playSong(song, songs)}
              >
                <div className="song-number">
                  {currentSong?.song_id === song.song_id && isPlaying ? (
                    <span className="playing-icon">🎵</span>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="song-info">
                  <img
                    src={song.image_url || "/default-song.png"}
                    alt={song.song_title}
                    className="song-thumb"
                  />
                  <div className="song-text">
                    <h4>{song.song_title}</h4>
                    <Link
                      to={`/artist/${song.artist_id}`}
                      className="artist-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {song.artist_name}
                    </Link>
                  </div>
                </div>
                <div className="song-category">{song.category || "-"}</div>
                <div className="song-actions">
                  <button
                    className="remove-btn"
                    onClick={(e) => handleRemoveSong(song.song_id, e)}
                    title="Remove from Library"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Toast message={toast} />
      <Footer />
      <AudioPlayer />
    </>
  );
};

export default Library;
