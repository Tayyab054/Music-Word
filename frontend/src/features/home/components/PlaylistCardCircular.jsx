import { useState } from "react";
import { Play, Plus } from "lucide-react";
import "../styles/playlistCardCircular.css";

const PlaylistCardCircular = ({ artist, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="circular-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="circular-card-image">
        <img
          src={artist.image_url || "/default-artist.png"}
          alt={artist.artist_name}
        />
        {isHovered && (
          <div className="overlay">
            <button className="play-button" onClick={onClick} title="Play">
              <Play size={24} fill="currentColor" />
            </button>
          </div>
        )}
      </div>
      <div className="card-info">
        <h3>{artist.artist_name}</h3>
        {artist.category && <p>{artist.category}</p>}
      </div>
    </div>
  );
};

export default PlaylistCardCircular;
