import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlus, FaCheck } from "react-icons/fa";
import { artistApi } from "../../artist/api/artistApi";
import { libraryApi } from "../../library/api/libraryApi";
import { usePlayer } from "../../../context/PlayerContext";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AudioPlayer from "../../player/components/AudioPlayer";
import "../styles/artist.css";

export default function Artist() {
  const { artistId } = useParams();
  const { playSong, currentSong } = usePlayer();
  const { isAuthenticated } = useAuth();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [librarySongs, setLibrarySongs] = useState({});

  const loadArtist = useCallback(async () => {
    setLoading(true);
    try {
      const [artistResponse, relatedResponse] = await Promise.all([
        artistApi.getById(artistId),
        artistApi.getRelated(artistId),
      ]);

      setArtist(artistResponse.data?.artist);
      setSongs(artistResponse.data?.songs || []);
      setRelatedArtists(relatedResponse.data?.artists || []);

      // Check library status for each song if authenticated
      if (isAuthenticated && artistResponse.data?.songs?.length > 0) {
        const statusMap = {};
        for (const song of artistResponse.data.songs) {
          try {
            const res = await libraryApi.check(song.song_id);
            statusMap[song.song_id] = res.data?.inLibrary || false;
          } catch {
            statusMap[song.song_id] = false;
          }
        }
        setLibrarySongs(statusMap);
      }
    } catch (err) {
      console.error("Error loading artist:", err);
    }
    setLoading(false);
  }, [artistId, isAuthenticated]);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleLibrary = async (songId) => {
    if (!isAuthenticated) return;

    const inLibrary = librarySongs[songId];

    try {
      if (inLibrary) {
        await libraryApi.remove(songId);
      } else {
        await libraryApi.add(songId);
      }
      setLibrarySongs({ ...librarySongs, [songId]: !inLibrary });
    } catch (err) {
      console.error("Library error:", err);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-page">Loading...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="error-page">Artist not found</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="artist-page">
        <header
          className="artist-header"
          style={{
            backgroundImage: artist.image_url
              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${artist.image_url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "340px",
          }}
        >
          <div className="artist-info">
            <span className="verified">✓ Verified Artist</span>
            <h1>{artist.artist_name}</h1>
            <p className="category">{artist.category}</p>
          </div>
        </header>

        <section className="artist-content">
          <div className="actions">
            <button className="play-button" onClick={handlePlayAll}>
              ▶
            </button>
          </div>

          <div className="songs-section">
            <h2>Popular</h2>
            <div className="songs-list">
              {songs.map((song) => (
                <div
                  key={song.song_id}
                  className={`song-row ${
                    currentSong?.song_id === song.song_id ? "active" : ""
                  }`}
                >
                  <div
                    className="song-main"
                    onClick={() => handlePlaySong(song)}
                  >
                    <img
                      src={song.image_url || "/default-song.png"}
                      alt={song.title}
                      className="song-thumb"
                    />
                    <div className="song-info">
                      <span className="song-title">{song.title}</span>
                    </div>
                  </div>
                  <span className="song-duration">
                    {song.duration ? formatDuration(song.duration) : "3:45"}
                  </span>
                  {isAuthenticated && (
                    <button
                      className={`add-to-library-btn ${
                        librarySongs[song.song_id] ? "in-library" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLibrary(song.song_id);
                      }}
                      title={
                        librarySongs[song.song_id]
                          ? "Remove from library"
                          : "Add to library"
                      }
                    >
                      {librarySongs[song.song_id] ? <FaCheck /> : <FaPlus />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {relatedArtists.length > 0 && (
            <div className="related-section">
              <h2>Fans also like</h2>
              <div className="related-grid">
                {relatedArtists.map((related) => (
                  <Link
                    to={`/artist/${related.artist_id}`}
                    key={related.artist_id}
                    className="related-card"
                  >
                    <img
                      src={related.image_url || "/default-artist.png"}
                      alt={related.artist_name}
                    />
                    <h4>{related.artist_name}</h4>
                    <span>{related.category}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  );
}
