import React from "react";
import "./Popup.css";

const Popup = ({ trigger, onClose, children }) => {
  return (
    trigger ? (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
          {children}
        </div>
      </div>
    ) : null
  );
};

export default Popup;