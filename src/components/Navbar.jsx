import React, { useRef } from 'react';

export default function Navbar({ isAdminActive, currentPage, goToPage, openLoginModal, confirmLogout }) {
  const clickTimeoutRef = useRef(null);

  // Safely manage single vs double click on logo using useRef
  const handleLogoClick = (e) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    if (e.detail === 1) {
      clickTimeoutRef.current = setTimeout(() => {
        if (isAdminActive) {
          confirmLogout();
        } else {
          goToPage('landing');
        }
      }, 250);
    } else if (e.detail === 2) {
      openLoginModal();
    }
  };

  return (
    <nav className="navbar navbar-expand-xl fixed-top shadow-sm py-2">
      <div className="container-xl">
        {/* Brand Logo */}
        <div 
          className="navbar-brand d-flex align-items-center gap-2" 
          style={{ cursor: 'pointer' }} 
          onClick={handleLogoClick}
          title="Click to go Home | Double-click for Admin Access"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && (isAdminActive ? confirmLogout() : goToPage('landing'))}
        >
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
            HV
          </div>
          <div>
            <div className="fw-bold text-main lh-1" style={{ fontSize: '1.05rem' }}>H.V. Desai Eye Hospital</div>
            <div className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>Patient Feedback Portal</div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler border-0 shadow-none p-2" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links & Actions */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {!isAdminActive ? (
            <>
              <div className="navbar-nav me-auto ms-xl-4 gap-1 align-items-xl-center mt-3 mt-xl-0">
                <span 
                  className={`nav-link ${currentPage === 'landing' ? 'active-nav' : ''}`} 
                  onClick={() => goToPage('landing')}
                  role="button"
                  tabIndex={0}
                >
                  <i className="bi bi-house-door me-1"></i> Home
                </span>
                <span 
                  className={`nav-link ${currentPage === 'feedback' ? 'active-nav' : ''}`} 
                  onClick={() => goToPage('feedback')}
                  role="button"
                  tabIndex={0}
                >
                  <i className="bi bi-chat-heart me-1"></i> Give Feedback
                </span>
              </div>

              <div className="d-flex flex-column flex-xl-row align-items-xl-center gap-3 mt-3 mt-xl-0 pt-3 pt-xl-0 border-top border-xl-0">
                {/* Hospital Contact Info */}
                <div className="d-flex flex-column flex-sm-row gap-3 gap-xl-4" style={{ fontSize: '0.9rem' }}>
                  <a href="tel:+919175239393" className="text-decoration-none nav-contact-link">
                    <span className="nav-contact-icon"><i className="bi bi-telephone-fill"></i></span> +91 9175239393
                  </a>
                  <a href="mailto:inquire@hvdeh.org" className="text-decoration-none nav-contact-link">
                    <span className="nav-contact-icon"><i className="bi bi-envelope-fill"></i></span> inquire@hvdeh.org
                  </a>
                </div>

                {/* Social Links */}
                <div className="d-flex gap-2">
                  <a href="https://www.facebook.com/hvdeh.org/" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://www.instagram.com/hvdesaieyehospitalofficial/?hl=en" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://x.com/hv_desaieye" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="Twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/pbma's-h-v-desai-eye-hospital---india/" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>

                {/* Explicit Admin Access Trigger */}
                <button 
                  onClick={openLoginModal} 
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium ms-xl-2"
                  title="Admin Dashboard Login"
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Login
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-nav ms-auto gap-2 align-items-xl-center mt-3 mt-xl-0">
              <span className="nav-link text-primary fw-bold px-3 py-2 bg-primary-subtle rounded-pill">
                <i className="bi bi-person-circle me-2"></i> Admin Mode
              </span>
              <button 
                onClick={confirmLogout} 
                className="btn btn-danger rounded-pill px-4 fw-medium shadow-sm"
              >
                <i className="bi bi-power me-1"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}