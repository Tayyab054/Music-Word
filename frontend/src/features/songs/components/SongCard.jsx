import { Play, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

const SongCard = ({ song, onPlay, onRemove }) => {
  return (
    <div className="song-card-library">
      <div className="song-image">
        <img src={song.image_url || "/default-song.png"} alt={song.title} />
        <button
          className="play-overlay-btn"
          onClick={() => onPlay(song)}
          title="Play"
        >
          <Play size={32} fill="currentColor" />
        </button>
      </div>
      <div className="song-info">
        <h3>{song.title}</h3>
        <p>{song.artist_name || "Unknown Artist"}</p>
      </div>
      <button
        className="remove-btn"
        onClick={() => onRemove(song.song_id)}
        title="Remove from library"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

SongCard.propTypes = {
  song: PropTypes.shape({
    song_id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    artist_name: PropTypes.string,
    image_url: PropTypes.string,
  }).isRequired,
  onPlay: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SongCard;
