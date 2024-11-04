import React from 'react';
import '../Styles/SlipPopup.css';

const SalarySlipPopup = ({ onClose, staffId }) => {
  return (
    <div className="salary-slip-popup-overlay">
      <div className="salary-slip-popup-container">
        <h2 className="salary-slip-popup-title">Salary Slip</h2>
        <p>Salary slip details for staff ID: {staffId}</p>
        {/* Placeholder for actual salary slip data */}
        <button className="salary-slip-download-button">
          Download Salary Slip
        </button>
        <button className="salary-slip-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SalarySlipPopup;