import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { songApi } from "../features/songs/api/songApi";
import { useAuth } from "./AuthContext";
import LinkedList from "../features/songs/utils/LinkedList";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const audioRef = useRef(new Audio());
  const playlistRef = useRef(new LinkedList()); // Using LinkedList for navigation
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("none"); // none, one, all

  // Play a song
  const playSong = useCallback(
    async (song, playlist = null) => {
      if (!song?.song_url) return;

      // If playlist provided, set up LinkedList
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

      try {
        await audioRef.current.play();

        // Record play to history if authenticated
        if (isAuthenticated) {
          songApi.play(song.song_id).catch(() => {});
        }
      } catch (err) {
        console.error("Playback error:", err);
      }
    },
    [isAuthenticated]
  );

  // Next song
  const handleNext = useCallback(() => {
    if (playlistRef.current.isEmpty()) return;

    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextSong;
    if (shuffle) {
      const allSongs = playlistRef.current.toArray();
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      nextSong = allSongs[randomIndex];
      playlistRef.current.setCurrent(nextSong.song_id);
    } else {
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

  // Previous song
  const handlePrevious = () => {
    if (playlistRef.current.isEmpty()) return;

    // If more than 3 seconds into song, restart it
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

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

  // Toggle shuffle
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Cycle repeat mode
  const toggleRepeat = () => {
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  // Add to queue
  const addToQueue = (song) => {
    playlistRef.current.append(song);
    setQueue((prev) => [...prev, song]);
  };

  // Clear queue
  const clearQueue = () => {
    playlistRef.current.clear();
    setQueue([]);
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
