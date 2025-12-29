import { useRef, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import "../styles/player.css";

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
  } = usePlayer();

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    seek((current / duration) * 100);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const handleEnded = () => {
    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <div className="audio-player">
      {currentSong.audio_url && (
        <audio
          ref={audioRef}
          src={currentSong.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            if (isPlaying) audioRef.current?.play().catch(() => {});
          }}
        />
      )}

      {/* Song Info */}
      <div className="player-song-info">
        <img
          src={currentSong.image_url || "/default-song.png"}
          alt={currentSong.song_title}
          className="player-thumb"
        />
        <div className="player-text">
          <h4>{currentSong.song_title}</h4>
          <p>{currentSong.artist_name}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="control-buttons">
          <button
            className={`control-btn ${shuffle ? "active" : ""}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            🔀
          </button>
          <button
            className="control-btn"
            onClick={playPrevious}
            title="Previous"
          >
            ⏮️
          </button>
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPlaying ? "⏸️" : "▶️"}
          </button>
          <button className="control-btn" onClick={playNext} title="Next">
            ⏭️
          </button>
          <button
            className={`control-btn ${repeat !== "off" ? "active" : ""}`}
            onClick={toggleRepeat}
            title={
              repeat === "one"
                ? "Repeat One"
                : repeat === "all"
                ? "Repeat All"
                : "Repeat Off"
            }
          >
            {repeat === "one" ? "🔂" : "🔁"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <span className="time">
            {formatTime(audioRef.current?.currentTime)}
          </span>
          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleSeek}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="time">{formatTime(audioRef.current?.duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-volume">
        <button
          className="volume-btn"
          onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
        >
          {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
