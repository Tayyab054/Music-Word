// import { useParams, useLocation } from "react-router-dom";
// import { useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import PlaylistGrid from "../components/PlaylistGrid";
// import PlaylistPlayer from "../components/PlaylistPlayer";
// import Toast from "../components/Toast";
// import { songs } from "../data/songs";
// import { groupSongsByPlaylist } from "../utils/buildIndex";
// import { libraryStore } from "../utils/libraryStore";
// import "../styles/playlist.css";

// const Playlist = () => {
//   const { playlistId } = useParams();
//   const location = useLocation();

//   /* Build playlist songs */
//   const songMap = groupSongsByPlaylist(songs);
//   const playlistSongs = playlistId ? songMap[playlistId] || [] : [];

//   /* Display info */
//   const title = location.state?.title || "PLAYLIST";
//   const coverImage = location.state?.image;

//   /* Player state */
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   /* Toast state */
//   const [toast, setToast] = useState("");

//   const handlePlaySong = (song) => {
//     setCurrentSong(song);
//     setIsPlaying(true);
//   };

//   /* ADD SONG */
//   const handleAddSong = (song) => {
//     libraryStore.addSong(song);
//     setToast("Song added to My Library");
//     setTimeout(() => setToast(""), 2500);
//   };
//   const handleTogglePlay = () => {
//     setIsPlaying((p) => !p);
//   };

//   return (
//     <>
//       <Navbar />

//       {/* Playlist Header */}
//       <div
//         className="playlist-header"
//         style={{
//           backgroundImage: coverImage
//             ? `linear-gradient(to bottom, rgba(0,0,0,0.4), #121212), url(${coverImage})`
//             : undefined,
//         }}
//       >
//         <h1>{title.toUpperCase()}</h1>
//       </div>

//       <main className="main-content">
//         <PlaylistPlayer
//           song={currentSong}
//           isPlaying={isPlaying}
//           onToggle={() => setIsPlaying((p) => !p)}
//         />
//         <PlaylistGrid
//           songs={playlistSongs}
//           currentSong={currentSong}
//           isPlaying={isPlaying}
//           onPlay={handlePlaySong}
//           onTogglePlay={() => setIsPlaying((p) => !p)}
//           onAdd={handleAddSong}
//         />
//       </main>

//       <Toast message={toast} />
//       <Footer />
//     </>
//   );
// };

// export default Playlist;
import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PlaylistGrid from "../components/PlaylistGrid";
import PlaylistPlayer from "../components/PlaylistPlayer";
import Toast from "../components/Toast";
import { songs } from "../data/songs";
import { groupSongsByPlaylist } from "../utils/buildIndex";
import { libraryStore } from "../utils/libraryStore";
import "../styles/playlist.css";

const Playlist = () => {
  const { playlistId } = useParams();
  const location = useLocation();

  /* Build playlist songs */
  const songMap = groupSongsByPlaylist(songs);
  const playlistSongs = playlistId ? songMap[playlistId] || [] : [];

  /* Display info */
  const title = location.state?.title || "PLAYLIST";
  const coverImage = location.state?.image;

  /* Player state */
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* Toast */
  const [toast, setToast] = useState("");

  /* Play / pause logic */
  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying((p) => !p);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((p) => !p);
  };

  /* Add song */
  const handleAddSong = (song) => {
    libraryStore.addSong(song);
    setToast("Song added to My Library");
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <div
        className="playlist-header"
        style={{
          backgroundImage: coverImage
            ? `linear-gradient(to bottom, rgba(0,0,0,0.4), #121212), url(${coverImage})`
            : undefined,
        }}
      >
        <h1>{title.toUpperCase()}</h1>
      </div>

      <main className="main-content">
        <PlaylistPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onToggle={handleTogglePlay}
        />

        <PlaylistGrid
          songs={playlistSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlay={handlePlaySong}
          onTogglePlay={handleTogglePlay}
          onAdd={handleAddSong}
        />
      </main>

      <Toast message={toast} />
      <Footer />
    </>
  );
};

export default Playlist;
