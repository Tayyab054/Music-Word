import { useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import "../styles/playlistGrid.css";

const PlaylistGrid = ({
  songs,
  currentSong,
  isPlaying,
  onPlay,
  onTogglePlay,
  onAdd,
  onRemove,
}) => {
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div className="playlist-grid">
      {songs.map((song) => {
        const isActive = currentSong?.id === song.id;

        return (
          <div
            key={song.id}
            className={`song-row ${isActive && isPlaying ? "active" : ""}`}
            onClick={() => (isActive ? onTogglePlay?.() : onPlay?.(song))}
          >
            {/* LEFT */}
            <div className="song-left">
              <div className="song-image-wrapper">
                <img src={song.image} alt={song.title} />

                {/* Overlay button */}
                {isActive && isPlaying && (
                  <button
                    className="play-btn visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlay?.();
                    }}
                  >
                    <FaPause />
                  </button>
                )}

                {(!isActive || !isPlaying) && (
                  <button
                    className="play-btn hover-only"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay?.(song);
                    }}
                  >
                    <FaPlay />
                  </button>
                )}
              </div>

              <div className="song-info">
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="song-actions">
              {(onAdd || onRemove) && (
                <>
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === song.id ? null : song.id);
                    }}
                  >
                    ⋮
                  </button>

                  {menuOpen === song.id && (
                    <div className="song-menu">
                      {onAdd && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(song);
                            setMenuOpen(null);
                          }}
                        >
                          Add to My Library
                        </button>
                      )}

                      {onRemove && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(song.id);
                            setMenuOpen(null);
                          }}
                        >
                          Remove from My Library
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlaylistGrid;
