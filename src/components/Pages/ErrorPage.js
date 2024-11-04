import React from 'react'
import '../Styles/ErrorPage.css'

function ErrorPage() {
  return (
    <div className="error-container">
    <div className="error-content">
      <h1 className="error-heading">Oops!</h1>
      <p className="error-message">The page you are looking for does not exist.</p>
    </div>
  </div>
  )
}

export default ErrorPage