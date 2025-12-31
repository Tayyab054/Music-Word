import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/heroSlider.css";

const HeroSlider = ({ artists = [], onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    console.log("HeroSlider artists:", artists);
  }, [artists]);

  useEffect(() => {
    if (!autoPlay || artists.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % artists.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, artists.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    onSlideChange?.(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % artists.length;
    setCurrentSlide(next);
    onSlideChange?.(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + artists.length) % artists.length;
    setCurrentSlide(prev);
    onSlideChange?.(prev);
  };

  if (artists.length === 0) {
    return (
      <div className="hero-slider-loading">Loading featured artists...</div>
    );
  }

  const currentArtist = artists[currentSlide];

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Slides */}
      <div className="slider-container">
        {artists.map((artist, index) => (
          <div
            key={artist.artist_id}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{
              backgroundImage: artist.image_url
                ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${artist.image_url}')`
                : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h2>{artist.artist_name}</h2>
              {artist.category && <p>{artist.category}</p>}
              <button className="cta-button">Explore</button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="slider-button prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        className="slider-button next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="slider-dots">
        {artists.map((artist, index) => (
          <button
            key={artist.artist_id}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
