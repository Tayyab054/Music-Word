import PropTypes from "prop-types";

const HistoryTable = ({ history, onPlay, onClearHistory }) => {
  return (
    <div className="history-list">
      <div className="history-controls">
        {history.length > 0 && (
          <button className="clear-btn" onClick={onClearHistory}>
            Clear History
          </button>
        )}
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Played At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={`${item.song_id}-${item.played_at}`}>
              <td className="index">{index + 1}</td>
              <td className="title">{item.title || "Unknown"}</td>
              <td className="artist">{item.artist_name || "Unknown"}</td>
              <td className="played-at">
                {new Date(item.played_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="action">
                <button
                  className="play-btn"
                  onClick={() => onPlay(item)}
                  title="Play"
                >
                  ▶️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

HistoryTable.propTypes = {
  history: PropTypes.array.isRequired,
  onPlay: PropTypes.func.isRequired,
  onClearHistory: PropTypes.func.isRequired,
};

export default HistoryTable;
