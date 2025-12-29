import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { artistsAPI, songsAPI, libraryAPI } from "../api";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import "../styles/artist.css";

export default function Artist() {
  const { artistId } = useParams();
  const { playSong } = usePlayer();
  const { isAuthenticated } = useAuth();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraryStatus, setLibraryStatus] = useState({});

  useEffect(() => {
    loadArtist();
  }, [artistId]);

  const loadArtist = async () => {
    setLoading(true);
    try {
      const [artistData, relatedData] = await Promise.all([
        artistsAPI.getById(artistId),
        artistsAPI.getRelated(artistId),
      ]);

      setArtist(artistData.artist);
      setSongs(artistData.songs || []);
      setRelatedArtists(relatedData.artists || []);

      // Check library status for each song
      if (isAuthenticated && artistData.songs?.length > 0) {
        const statusPromises = artistData.songs.map((song) =>
          libraryAPI.check(song.song_id).then((res) => ({
            id: song.song_id,
            inLibrary: res.inLibrary,
          }))
        );
        const statuses = await Promise.all(statusPromises);
        const statusMap = {};
        statuses.forEach((s) => (statusMap[s.id] = s.inLibrary));
        setLibraryStatus(statusMap);
      }
    } catch (err) {
      console.error("Error loading artist:", err);
    }
    setLoading(false);
  };

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const toggleLibrary = async (songId) => {
    if (!isAuthenticated) return;

    const inLibrary = libraryStatus[songId];

    try {
      if (inLibrary) {
        await libraryAPI.remove(songId);
      } else {
        await libraryAPI.add(songId);
      }
      setLibraryStatus({ ...libraryStatus, [songId]: !inLibrary });
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
              ? `linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), url(${artist.image_url})`
              : undefined,
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
              {songs.map((song, index) => (
                <div key={song.song_id} className="song-row">
                  <span className="song-number">{index + 1}</span>
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
                  {isAuthenticated && (
                    <button
                      className={`like-button ${
                        libraryStatus[song.song_id] ? "liked" : ""
                      }`}
                      onClick={() => toggleLibrary(song.song_id)}
                    >
                      {libraryStatus[song.song_id] ? "♥" : "♡"}
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
