import { useRef, useEffect } from "react";
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoPlay,
  IoPause,
  IoShuffle,
  IoRepeat,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeMute,
} from "react-icons/io5";
import { usePlayer } from "../../../context/PlayerContext";
import "../styles/player.css";

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    togglePlay,
    setVolume,
    seek,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
  } = usePlayer();

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  const handleSeek = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(percent * duration, duration));
    seek(newTime);
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

  // Check if we can navigate prev/next
  const currentIndex = queue.findIndex(
    (s) => s.song_id === currentSong.song_id
  );
  // Previous button: only enable if there's a previous song or repeat all is on
  const canGoPrev = currentIndex > 0 || repeat === "all";
  const canGoNext =
    currentIndex < queue.length - 1 || repeat === "all" || repeat === "one";

  return (
    <div className="audio-player">
      {currentSong.song_url && (
        <audio
          ref={audioRef}
          src={currentSong.song_url}
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
            <IoShuffle />
          </button>
          <button
            className={`control-btn prev-next ${!canGoPrev ? "disabled" : ""}`}
            onClick={playPrevious}
            disabled={!canGoPrev}
            title="Previous"
          >
            <IoPlaySkipBack />
          </button>
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPlaying ? <IoPause /> : <IoPlay />}
          </button>
          <button
            className={`control-btn prev-next ${!canGoNext ? "disabled" : ""}`}
            onClick={playNext}
            disabled={!canGoNext}
            title="Next"
          >
            <IoPlaySkipForward />
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
            <IoRepeat />
            {repeat === "one" && (
              <span className="repeat-one-indicator">1</span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleSeek}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-volume">
        <button
          className="volume-btn"
          onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
        >
          {volume === 0 ? (
            <IoVolumeMute />
          ) : volume < 0.5 ? (
            <IoVolumeMedium />
          ) : (
            <IoVolumeHigh />
          )}
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
