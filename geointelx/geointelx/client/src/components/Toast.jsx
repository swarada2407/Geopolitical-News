import { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

let toastTimeout;
let setToastGlobal;

export const showToast = (message, type = "info") => {
  if (setToastGlobal) {
    setToastGlobal({ message, type, visible: true });
  }
};

const Toast = () => {
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });

  setToastGlobal = setToast;

  useEffect(() => {
    if (toast.visible) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        setToast({ ...toast, visible: false });
      }, 3000);
    }
  }, [toast]);

  if (!toast.visible) return null;

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    info: <FaInfoCircle />,
  };

  return (
    <div className={`toast-container ${toast.type}`} onClick={() => setToast({ ...toast, visible: false })}>
      <div className="toast-icon">{icons[toast.type]}</div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close">
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
