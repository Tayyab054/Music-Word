import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import { songsAPI, artistsAPI } from "../api";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import "../styles/cards.css";

const Home = () => {
  const { playSong } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const [popularSongs, setPopularSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [songsData, artistsData, categoriesData] = await Promise.all([
        songsAPI.getPopular(10),
        artistsAPI.getAll(),
        artistsAPI.getCategories(),
      ]);
      setPopularSongs(songsData.songs || []);
      setArtists(artistsData.artists || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error("Error loading home data:", err);
    }
    setLoading(false);
  };

  // Group artists by category
  const artistsByCategory = categories.reduce((acc, category) => {
    acc[category] = artists.filter((a) => a.category === category);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>
            {isAuthenticated
              ? `Welcome back, ${user?.name || "User"}!`
              : "Welcome to Spotify Clone"}
          </h1>
          <p>Listen to your favorite music</p>
        </section>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Popular Songs */}
            {popularSongs.length > 0 && (
              <section className="section">
                <div className="section-header">
                  <h2>Popular Songs</h2>
                  <Link to="/search" className="see-all">
                    See all
                  </Link>
                </div>
                <div className="songs-grid horizontal">
                  {popularSongs.slice(0, 6).map((song) => (
                    <div
                      key={song.song_id}
                      className="song-card"
                      onClick={() => playSong(song)}
                    >
                      <div className="song-card-image">
                        <img
                          src={song.image_url || "/default-song.png"}
                          alt={song.song_title}
                        />
                        <div className="play-overlay">
                          <span>▶️</span>
                        </div>
                      </div>
                      <h4>{song.song_title}</h4>
                      <p>{song.artist_name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Browse by Category */}
            {categories.length > 0 && (
              <section className="section">
                <h2>Browse by Category</h2>
                <div className="categories-grid">
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category}
                      to={`/search?q=${encodeURIComponent(category)}`}
                      className="category-card"
                      style={{
                        background: `linear-gradient(135deg, ${getRandomColor()} 0%, ${getRandomColor()} 100%)`,
                      }}
                    >
                      <span>{category}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Artists by Category */}
            {Object.entries(artistsByCategory).map(
              ([category, categoryArtists]) =>
                categoryArtists.length > 0 && (
                  <section key={category} className="section">
                    <div className="section-header">
                      <h2>{category}</h2>
                      <Link
                        to={`/search?q=${encodeURIComponent(category)}`}
                        className="see-all"
                      >
                        See all
                      </Link>
                    </div>
                    <div className="artists-row">
                      {categoryArtists.slice(0, 6).map((artist) => (
                        <Link
                          key={artist.artist_id}
                          to={`/artist/${artist.artist_id}`}
                          className="artist-card"
                        >
                          <img
                            src={artist.image_url || "/default-artist.png"}
                            alt={artist.artist_name}
                          />
                          <h4>{artist.artist_name}</h4>
                          <p>Artist</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )
            )}
          </>
        )}
      </main>
      <Footer />
      <AudioPlayer />
    </>
  );
};

// Helper function for category colors
const getRandomColor = () => {
  const colors = [
    "#1db954",
    "#e91429",
    "#1e3264",
    "#8d67ab",
    "#ba5d07",
    "#148a08",
    "#509bf5",
    "#e13300",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default Home;
