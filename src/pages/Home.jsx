import React from 'react';

export default function Home({ startFeedback }) {
  return (
    <div className="page active">
      <div className="hero">
        <div className="container text-center">
          <span className="badge bg-light text-primary mb-3 px-3 py-2 rounded-pill fw-bold shadow-sm">H.V. DESAI EYE HOSPITAL</span>
          <h1 className="display-3 fw-bold mb-4">Your Feedback Helps Us<br />Deliver Better Care</h1>
          <p className="lead fs-4 mb-5 text-light opacity-75">Your valuable feedback enables us to continuously improve patient care, clinical services, and the overall healthcare experience.</p>
          <button onClick={startFeedback} className="btn btn-light btn-lg px-5 py-3 fw-bold shadow-lg rounded-pill text-primary transition">
            <i className="bi bi-chat-dots-fill me-2"></i> Share Your Experience
          </button>
        </div>
      </div>
    </div>
  );
}