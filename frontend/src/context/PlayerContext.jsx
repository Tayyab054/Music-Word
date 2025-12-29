import { createContext, useContext, useState, useRef, useEffect } from "react";
import { songsAPI, libraryAPI } from "../api";
import { useAuth } from "./AuthContext";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("none"); // none, one, all

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
  }, [queueIndex, queue, repeat, shuffle]);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Play a song
  const playSong = async (song, playlist = null) => {
    if (!song?.song_url) return;

    // If playlist provided, set up queue
    if (playlist && playlist.length > 0) {
      const songIndex = playlist.findIndex((s) => s.song_id === song.song_id);
      setQueue(playlist);
      setQueueIndex(songIndex >= 0 ? songIndex : 0);
    } else if (!queue.find((s) => s.song_id === song.song_id)) {
      // Add single song to queue
      setQueue([song]);
      setQueueIndex(0);
    }

    // Set current song and play
    setCurrentSong(song);
    audioRef.current.src = song.song_url;

    try {
      await audioRef.current.play();

      // Record play to history if authenticated
      if (isAuthenticated) {
        songsAPI.play(song.song_id).catch(() => {});
      }
    } catch (err) {
      console.error("Playback error:", err);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Seek
  const seek = (time) => {
    audioRef.current.currentTime = time;
  };

  // Next song
  const handleNext = () => {
    if (queue.length === 0) return;

    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeat === "all") {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    playSong(queue[nextIndex]);
  };

  // Previous song
  const handlePrevious = () => {
    if (queue.length === 0) return;

    // If more than 3 seconds into song, restart it
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeat === "all" ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIndex);
    playSong(queue[prevIndex]);
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Cycle repeat mode
  const toggleRepeat = () => {
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  // Add to queue
  const addToQueue = (song) => {
    setQueue((prev) => [...prev, song]);
  };

  // Clear queue
  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(0);
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    seek,
    setVolume,
    handleNext,
    handlePrevious,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    clearQueue,
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

export default PlayerContext;
