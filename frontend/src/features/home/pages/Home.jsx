import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AudioPlayer from "../../player/components/AudioPlayer";
import HeroSlider from "../components/HeroSlider";
import PlaylistCardCircular from "../components/PlaylistCardCircular";
import { artistApi } from "../../artist/api/artistApi";
import { usePlayer } from "../../../context/PlayerContext";
import { useAuth } from "../../../context/AuthContext";
import "../styles/home.css";

const Home = () => {
  const { playSong } = usePlayer();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const response = await artistApi.getAll();
      setArtists(response.data?.artists || []);
    } catch (err) {
      console.error("Error loading home data:", err);
    }
    setLoading(false);
  };

  const handlePlaylistClick = (artist) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    navigate(`/artist/${artist.artist_id}`, { state: { artist } });
  };

  const handleSlideChange = (index) => {
    setCurrentSlideIndex(index);
  };

  return (
    <>
      <Navbar />
      <main className="home-container">
        {/* Hero Slider Section */}
        <section className="hero-section">
          <HeroSlider
            artists={artists.slice(0, 5)}
            onSlideChange={handleSlideChange}
          />
        </section>

        {/* Featured Playlists Section */}
        <section className="featured-section">
          <div className="featured-content">
            <h1>
              {isAuthenticated
                ? `Welcome back, ${user?.name || "User"}! 🎵`
                : "Welcome to Spotify Clone 🎶"}
            </h1>
            <p>Discover music that moves you</p>
          </div>
        </section>

        {/* Artists as Circular Playlist Cards */}
        {!loading && artists.length > 0 && (
          <section className="playlists-section">
            <h2>Featured Artists & Playlists</h2>
            <div className="circular-cards-grid">
              {artists.slice(0, 12).map((artist) => (
                <PlaylistCardCircular
                  key={artist.artist_id}
                  artist={artist}
                  onClick={() => handlePlaylistClick(artist)}
                />
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your music...</p>
          </div>
        ) : null}
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
