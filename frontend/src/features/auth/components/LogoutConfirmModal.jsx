import ConfirmModal from "../../../components/ConfirmModal";

const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <ConfirmModal
      title="Confirm Logout"
      message="Are you sure you want to logout?"
      confirmText="Logout"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default LogoutConfirmModal;
