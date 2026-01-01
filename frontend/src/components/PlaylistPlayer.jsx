import { useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import "../styles/player.css";

const PlaylistPlayer = ({ song, isPlaying, onToggle }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || !song) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [song, isPlaying]);

  if (!song) return null;

  return (
    <div className="player">
      <audio ref={audioRef} src={song.audio} />

      <div className="player-info">
        <img src={song.image} alt={song.title} />
        <div>
          <strong>{song.title}</strong>
          <small>{song.artist}</small>
        </div>
      </div>

      <button className="player-play" onClick={onToggle}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </div>
  );
};

export default PlaylistPlayer;
