import React from 'react';

export default function Home({ startFeedback }) {
  return (
    <div className="page active">
      {/* Hero Section */}
      <section className="hero">
        <div className="container text-center py-5">
          <span className="badge bg-light text-primary mb-3 px-3 py-2 rounded-pill fw-bold shadow-sm">
            PBMA's H.V. DESAI EYE HOSPITAL
          </span>
          <h1 className="display-4 display-md-3 fw-extrabold mb-4 text-white">
            Your Feedback Helps Us<br />Deliver Better Eye Care
          </h1>
          <p className="lead fs-5 mb-4 text-light opacity-90 mx-auto" style={{ maxWidth: '680px' }}>
            Your valuable insights enable our medical team to continuously enhance clinical services, patient comfort, and total healthcare experience.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button 
              onClick={startFeedback} 
              className="btn btn-light btn-lg px-5 py-3 fw-bold shadow-lg rounded-pill text-primary transition"
            >
              <i className="bi bi-chat-dots-fill me-2"></i> Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-main">Why Your Opinion Matters</h2>
          <p className="text-muted">We are committed to maintaining world-class standards in ophthalmology care</p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="glass p-4 text-center h-100 rounded-4">
              <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-heart-pulse-fill fs-2"></i>
              </div>
              <h5 className="fw-bold text-main mb-2">OPD Checkups</h5>
              <p className="text-muted small mb-0">Rate registration efficiency, doctor consultation, waiting room comfort, and staff support.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass p-4 text-center h-100 rounded-4">
              <div className="bg-info-subtle text-info rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-hospital-fill fs-2"></i>
              </div>
              <h5 className="fw-bold text-main mb-2">IPD Surgeries & Stays</h5>
              <p className="text-muted small mb-0">Evaluate nursing care, room cleanliness, surgical discharge process, and food quality.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass p-4 text-center h-100 rounded-4">
              <div className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-shield-check fs-2"></i>
              </div>
              <h5 className="fw-bold text-main mb-2">Continuous Improvement</h5>
              <p className="text-muted small mb-0">Every submission is reviewed by hospital administration to drive rapid quality upgrades.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}