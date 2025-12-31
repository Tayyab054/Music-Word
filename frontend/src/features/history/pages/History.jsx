/**
 * History Page
 * ============
 * Displays user's recently played songs.
 *
 * DATA STRUCTURE: Stack (LIFO)
 * ----------------------------
 * - Most recently played song appears at the top
 * - Stack is maintained in PlayerContext
 * - history array is derived from Stack.toArray()
 *
 * WHY STACK?
 * ----------
 * LIFO (Last In, First Out) is the natural order for "recently played"
 * - Push when song plays: O(1)
 * - View history: O(n) to convert to array
 * - Duplicates automatically moved to top when replayed
 */

import { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AudioPlayer from "../../player/components/AudioPlayer";
import ConfirmModal from "../../../components/ConfirmModal";
import { usePlayer } from "../../../context/PlayerContext";
import { useAuth } from "../../../context/AuthContext";
import "../styles/history.css";

const History = () => {
  const { playSong, currentSong, isPlaying, history, clearHistory } =
    usePlayer();
  const { isAuthenticated } = useAuth();
  const [showClearDialog, setShowClearDialog] = useState(false);

  /**
   * Play song from history
   * Uses the full history array as playlist for navigation
   */
  const handlePlay = (song) => {
    playSong(song, history);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPlayedAt = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearDialog(false);
  };

  return (
    <>
      <Navbar />
      <main className="history-container">
        <div className="history-header">
          <div className="header-content">
            <h1>🎵 Your Listening History</h1>
            <p>Songs you've played recently</p>
          </div>
          {history.length > 0 && (
            <button
              className="clear-btn"
              onClick={() => setShowClearDialog(true)}
            >
              Clear History
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="songs-section">
            <div className="songs-list">
              {/* History is ordered by Stack (most recent first) */}
              {history.map((item) => {
                const isActive = currentSong?.song_id === item.song_id;
                return (
                  <div
                    key={`${item.song_id}-${item.played_at}`}
                    className={`song-row ${isActive ? "active" : ""}`}
                  >
                    <div className="song-main" onClick={() => handlePlay(item)}>
                      <img
                        src={item.image_url || "/default-song.png"}
                        alt={item.title}
                        className="song-thumb"
                      />
                      <div className="song-info">
                        <span className="song-title">{item.title}</span>
                        <span className="song-artist">{item.artist_name}</span>
                      </div>
                    </div>
                    <span
                      className={`song-status ${
                        isActive ? (isPlaying ? "live" : "paused") : ""
                      } ${isActive ? "" : "inactive"}`}
                    >
                      {isActive ? (isPlaying ? "Now playing" : "Paused") : ""}
                    </span>
                    <span className="song-duration">
                      {item.duration ? formatDuration(item.duration) : "3:45"}
                    </span>
                    <span className="song-played-at">
                      {formatPlayedAt(item.played_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎶</div>
            <h2>No listening history yet</h2>
            <p>Songs you play will appear here</p>
          </div>
        )}

        {/* Clear History Dialog */}
        {showClearDialog && (
          <ConfirmModal
            title="Clear Listening History?"
            message="This will permanently delete all your listening history. This action cannot be undone."
            confirmText="Yes, Clear"
            cancelText="No"
            confirmStyle="danger"
            onConfirm={handleClearHistory}
            onCancel={() => setShowClearDialog(false)}
          />
        )}
      </main>
      <Footer />
      <AudioPlayer />
    </>
  );
};

export default History;
