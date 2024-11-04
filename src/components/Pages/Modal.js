// Modal.js
import React from 'react';
import './Modal.css'; // Make sure to use the updated CSS

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        {/* <button onClick={onClose} className='modal-close-button' aria-label='Close'>
        </button> */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
