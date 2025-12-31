import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchApi } from "../../search/api/searchApi";
import { usePlayer } from "../../../context/PlayerContext";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AudioPlayer from "../../player/components/AudioPlayer";
import "../styles/search.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { playSong } = usePlayer();

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState({ songs: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("songs");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q) => {
    if (!q.trim()) return;

    setLoading(true);
    try {
      const response = await searchApi.search(q);
      setResults(response.data);
    } catch (err) {
      console.error("Search error:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handlePlaySong = (song) => {
    playSong(song, results.songs);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="search-page">
        {!query && (
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        )}

        {query && (
          <>
            <div className="search-tabs">
              <button
                className={`tab ${activeTab === "songs" ? "active" : ""}`}
                onClick={() => setActiveTab("songs")}
              >
                Songs
              </button>
              <button
                className={`tab ${activeTab === "artists" ? "active" : ""}`}
                onClick={() => setActiveTab("artists")}
              >
                Artists
              </button>
            </div>

            {loading ? (
              <div className="loading">Searching...</div>
            ) : (
              <div className="search-results">
                {activeTab === "songs" && results.songs.length > 0 && (
                  <section className="results-section">
                    <h2>Songs</h2>
                    <div className="songs-list">
                      {results.songs.map((song, index) => (
                        <div
                          key={song.song_id}
                          className="song-item"
                          onClick={() => handlePlaySong(song)}
                        >
                          <span className="song-number">{index + 1}</span>
                          <div className="song-image">
                            <img
                              src={song.image_url || "/default-song.png"}
                              alt={song.title}
                            />
                            <div className="play-overlay">▶</div>
                          </div>
                          <div className="song-info">
                            <h4>{song.title}</h4>
                            <span>{song.artist_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "artists" && results.artists.length > 0 && (
                  <section className="results-section">
                    <h2>Artists</h2>
                    <div className="artists-grid">
                      {results.artists.map((artist) => (
                        <Link
                          to={`/artist/${artist.artist_id}`}
                          key={artist.artist_id}
                          className="artist-card"
                        >
                          <div className="artist-image">
                            <img
                              src={artist.image_url || "/default-artist.png"}
                              alt={artist.artist_name}
                            />
                          </div>
                          <h3>{artist.artist_name}</h3>
                          <span className="category">{artist.category}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {((activeTab === "songs" && results.songs.length === 0) ||
                  (activeTab === "artists" &&
                    results.artists.length === 0)) && (
                  <div className="no-results">
                    No {activeTab} found for "{query}"
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!query && (
          <div className="search-placeholder">
            <h2>Search Spotify</h2>
            <p>Find your favorite songs, artists, and more.</p>
          </div>
        )}
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  );
}
