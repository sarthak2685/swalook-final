import React from 'react';
import '../Styles/GlobalErrorPage.css';

const GlobalErrorPage = ({ message }) => {
  return (
    <div className="global-error-container">
      <div className="global-error-content">
        <h1 className="global-error-heading">Something went wrong</h1>
        <p className="global-error-message">{message || "Please try again later. If the issue persists, contact support."}</p>
      </div>
    </div>
  );
};

export default GlobalErrorPage;
