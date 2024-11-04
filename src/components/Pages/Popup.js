import React from 'react';
import '../Styles/Popup.css'; // Create a CSS file for popup styles

function Popup({ message, onClose }) {
  return (
    <div className="popup-container">
      <div className="popup-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Popup;
