import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { libraryStore } from "../utils/libraryStore";

const PlaylistCard = ({ data }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const addAlbumToLibrary = () => {
    libraryStore.addAlbum({
      id: data.id,
      name: data.name,
      image: data.image,
      songs: data.songs || [],
    });
    setMenuOpen(false);
  };

  return (
    <div
      className="card"
      onClick={() =>
        navigate(`/playlist/${data.id}`, {
          state: { title: data.name, image: data.image },
        })
      }
      onContextMenu={(e) => {
        e.preventDefault(); // right click
        setMenuOpen(true);
      }}
    >
      <img src={data.image} alt={data.name} />
      <h4>{data.name}</h4>

      {/* Mobile / Right click menu */}
      {menuOpen && (
        <div className="card-menu">
          <button onClick={addAlbumToLibrary}>
            Add album to Your Library
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
