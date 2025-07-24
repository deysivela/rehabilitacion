import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./Notification.css";

const Notification = ({ id, type, message, persistent, onClose }) => {
  const handleClose = () => {
    onClose(id);
  };

  const iconMap = {
    success: <FaCheckCircle className="notification-icon" />,
    error: <FaExclamationCircle className="notification-icon" />,
    warning: <FaExclamationCircle className="notification-icon" />,
    info: <FaInfoCircle className="notification-icon" />
  };

  return (
    <div className={`notification ${type}`}>
      {iconMap[type]}
      <div className="notification-content">{message}</div>
      {persistent && (
        <button 
          className="notification-close" 
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default Notification;