import "../styles/confirmModal.css";

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "primary",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2>{title}</h2>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal-btn confirm-btn ${confirmStyle}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
