import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { songApi } from "../features/songs/api/songApi";
import { libraryApi } from "../features/library/api/libraryApi";
import { useAuth } from "./AuthContext";
import LinkedList from "../features/songs/utils/LinkedList";
import Stack from "../utils/Stack";

/**
 * Player Context
 * ==============
 * Manages audio playback state and playlist navigation.
 *
 * DATA STRUCTURES USED:
 * ---------------------
 * 1. LinkedList (Doubly Linked List) - For playlist navigation
 *    - Enables O(1) next/previous song navigation
 *    - Maintains play order and current position
 *
 * 2. Stack - For listening history (Recently Played)
 *    - LIFO: Most recently played song is always on top
 *    - Automatic duplicate removal (moves to top if replayed)
 *    - Max 100 songs to prevent memory issues
 *    - Synced with backend for persistence
 */

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const audioRef = useRef(new Audio());

  /**
   * Playlist as Doubly Linked List
   * Enables O(1) next/previous navigation
   */
  const playlistRef = useRef(new LinkedList());

  /**
   * History as Stack (LIFO)
   * Most recently played song is always on top
   * Automatically handles duplicates by moving replayed songs to top
   */
  const historyStackRef = useRef(new Stack(100));

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("none"); // none, one, all
  const [history, setHistory] = useState([]); // Array view of history stack

  /**
   * Play a song
   * Updates both LinkedList (for navigation) and Stack (for history)
   */
  const playSong = useCallback(
    async (song, playlist = null) => {
      if (!song?.song_url) return;

      // If playlist provided, build LinkedList for navigation
      if (playlist && playlist.length > 0) {
        playlistRef.current.fromArray(playlist);
        playlistRef.current.setCurrent(song.song_id);
        setQueue(playlist);
      } else if (playlistRef.current.isEmpty()) {
        // Add single song to queue
        playlistRef.current.fromArray([song]);
        setQueue([song]);
      } else {
        // Update current in existing playlist
        playlistRef.current.setCurrent(song.song_id);
      }

      // Set current song and play
      setCurrentSong(song);
      audioRef.current.src = song.song_url;

      /**
       * Push to history Stack
       * Stack.push() handles duplicates by removing existing and adding to top
       */
      historyStackRef.current.push({
        ...song,
        played_at: new Date().toISOString(),
      });
      // Update React state with array view of stack
      setHistory(historyStackRef.current.toArray());

      try {
        await audioRef.current.play();

        // Record play to backend if authenticated
        if (isAuthenticated) {
          songApi.play(song.song_id).catch(() => {});
        }
      } catch (err) {
        console.error("Playback error:", err);
      }
    },
    [isAuthenticated]
  );

  /**
   * Handle next song using LinkedList navigation
   * LinkedList.getNext() is O(1)
   */
  const handleNext = useCallback(() => {
    if (playlistRef.current.isEmpty()) return;

    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextSong;
    if (shuffle) {
      // Random selection for shuffle mode
      const allSongs = playlistRef.current.toArray();
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      nextSong = allSongs[randomIndex];
      playlistRef.current.setCurrent(nextSong.song_id);
    } else {
      // Use LinkedList for O(1) navigation
      nextSong = playlistRef.current.getNext();
      if (!nextSong && repeat === "all") {
        // Loop back to start
        nextSong = playlistRef.current.head?.song;
        if (nextSong) {
          playlistRef.current.setCurrent(nextSong.song_id);
        }
      }
    }

    if (nextSong) {
      playSong(nextSong);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, shuffle, playSong]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNext();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [handleNext]);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  /**
   * Load persisted history from backend when user is authenticated
   * This syncs the Stack with previously played songs from the database
   */
  useEffect(() => {
    const loadPersistedHistory = async () => {
      if (!isAuthenticated) {
        // Clear history when logged out
        historyStackRef.current.clear();
        setHistory([]);
        return;
      }

      try {
        const response = await libraryApi.getHistory(100);
        const persistedHistory = response.data?.history || [];

        // Clear current stack and rebuild from persisted data
        historyStackRef.current.clear();

        // Add in reverse order since history comes newest-first from API
        // but we want to push oldest first so newest ends up on top
        const reversedHistory = [...persistedHistory].reverse();
        for (const song of reversedHistory) {
          historyStackRef.current.push({
            ...song,
            played_at: song.played_at || new Date().toISOString(),
          });
        }

        setHistory(historyStackRef.current.toArray());
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    loadPersistedHistory();
  }, [isAuthenticated]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  /**
   * Seek to position in track
   */
  const seek = (time) => {
    audioRef.current.currentTime = time;
  };

  /**
   * Handle previous song using LinkedList navigation
   * LinkedList.getPrevious() is O(1)
   */
  const handlePrevious = () => {
    if (playlistRef.current.isEmpty()) return;

    // If more than 3 seconds into song, restart it
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    // Use LinkedList for O(1) navigation
    const prevSong = playlistRef.current.getPrevious();
    if (prevSong) {
      playSong(prevSong);
    } else if (repeat === "all") {
      // Loop to end
      const lastSong = playlistRef.current.tail?.song;
      if (lastSong) {
        playlistRef.current.setCurrent(lastSong.song_id);
        playSong(lastSong);
      }
    }
  };

  /**
   * Toggle shuffle mode
   */
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  /**
   * Cycle through repeat modes: none -> all -> one -> none
   */
  const toggleRepeat = () => {
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  /**
   * Add song to queue (end of LinkedList)
   */
  const addToQueue = (song) => {
    playlistRef.current.append(song);
    setQueue((prev) => [...prev, song]);
  };

  /**
   * Clear the queue (LinkedList)
   */
  const clearQueue = () => {
    playlistRef.current.clear();
    setQueue([]);
  };

  /**
   * Clear listening history (Stack and backend)
   */
  const clearHistory = async () => {
    historyStackRef.current.clear();
    setHistory([]);

    // Also clear on backend if authenticated
    if (isAuthenticated) {
      try {
        await libraryApi.clearHistory();
      } catch (err) {
        console.error("Failed to clear history on backend:", err);
      }
    }
  };

  /**
   * Get listening history as array (from Stack)
   * Returns most recent first (LIFO order)
   */
  const getHistory = () => {
    return historyStackRef.current.toArray();
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    shuffle,
    repeat,
    history,
    playSong,
    togglePlay,
    seek,
    setVolume,
    playNext: handleNext,
    playPrevious: handlePrevious,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    clearQueue,
    clearHistory,
    getHistory,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
