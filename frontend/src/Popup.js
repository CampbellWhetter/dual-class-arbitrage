import React from "react";
import "./Popup.css";

/**
 * Popup Component
 * @param {boolean} trigger - Determines whether the popup is visible.
 * @param {function} onClose - Function to handle closing the popup.
 * @param {React.ReactNode} children - Content to display inside the popup.
 */
const Popup = ({ trigger, onClose, children }) => {
  return (
    // Render the popup only if the trigger is true
    trigger ? (
      <div className="popup-overlay">
        {/* Popup content container */}
        <div className="popup-content">
          {/* Close button to trigger the onClose callback */}
          <button className="close-btn" onClick={onClose}>
            &times; {/* Unicode character for "×" (close icon) */}
          </button>
          {/* Render any children elements passed to the popup */}
          {children}
        </div>
      </div>
    ) : null // Return null if the popup is not triggered (hidden)
  );
};

export default Popup;