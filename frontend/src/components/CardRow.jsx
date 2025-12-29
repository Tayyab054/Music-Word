import { useRef } from "react";
import PlaylistCard from "./PlaylistCard";
import "../styles/cards.css";

const CardRow = ({ items, category }) => {
  const rowRef = useRef(null);

  const scroll = (offset) => {
    rowRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return (
    <div className="slider">
      <button
        className="arrow left"
        onClick={() => scroll(-300)}
        aria-label="Scroll left"
      >
        ‹
      </button>

      <div className="card-row" ref={rowRef}>
        {items.map((item) => (
          <PlaylistCard
            key={item.id}
            data={item}
            category={category}
          />
        ))}
      </div>

      <button
        className="arrow right"
        onClick={() => scroll(300)}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
};

export default CardRow;
