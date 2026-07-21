import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';

const DEFAULT_DEPARTMENTS = {
  "OPD": { 
    icon: "bi-person-walking", 
    desc: "Outpatient Department (Consultations, regular eye checkups)", 
    questions: ["Registration Experience", "Waiting Time", "Doctor's Behavior", "Support Staff Behavior", "Premises Cleanliness"] 
  },
  "IPD": { 
    icon: "bi-hospital", 
    desc: "Inpatient Department (Admissions, surgeries, overnight stays)", 
    questions: ["Admission Process", "Nursing Care", "Doctor's Care", "Room Cleanliness", "Food & Diet", "Discharge Process"] 
  }
};

const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || "1234";

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAdminActive, setIsAdminActive] = useState(() => sessionStorage.getItem('isAdminActive') === 'true');
  
  // Lazy initializers for localStorage to optimize performance
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('hospitalFeedbacks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hospitalConfig, setHospitalConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('hospitalConfig');
      return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  });
  
  // App-level Modals & Notifications
  const [modalState, setModalState] = useState(null); // 'login' | 'logout' | null
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalState) {
        setModalState(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  // Toast Auto-Dismiss Effect
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleNewFeedback = (newFeedback) => {
    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('hospitalFeedbacks', JSON.stringify(updatedFeedbacks));
    setShowToast(true);
  };

  const handleConfigUpdate = (newConfig) => {
    setHospitalConfig(newConfig);
    localStorage.setItem('hospitalConfig', JSON.stringify(newConfig));
  };

  const handleAdminLogin = () => {
    if (adminPinInput.trim() === ADMIN_PIN) {
      sessionStorage.setItem('isAdminActive', 'true');
      setIsAdminActive(true);
      setModalState(null);
      setCurrentPage('admin');
      setAdminPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const executeLogout = () => {
    sessionStorage.removeItem('isAdminActive');
    setIsAdminActive(false);
    setModalState(null);
    setCurrentPage('landing');
  };

  return (
    <>
      <Navbar 
        isAdminActive={isAdminActive} 
        currentPage={currentPage} 
        goToPage={setCurrentPage}
        openLoginModal={() => { if (!isAdminActive) setModalState('login'); }}
        confirmLogout={() => setModalState('logout')}
      />

      {/* Page Routing */}
      <main>
        {currentPage === 'landing' && <Home startFeedback={() => setCurrentPage('feedback')} />}
        {currentPage === 'feedback' && (
          <Feedback 
            hospitalConfig={hospitalConfig} 
            submitFeedback={handleNewFeedback} 
            goHome={() => setCurrentPage('landing')} 
          />
        )}
        {currentPage === 'admin' && isAdminActive && (
          <Admin 
            feedbacks={feedbacks} 
            hospitalConfig={hospitalConfig} 
            updateConfig={handleConfigUpdate} 
          />
        )}
      </main>

      {/* Toast Notification */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
        <div 
          className={`toast align-items-center text-white bg-success border-0 shadow-lg ${showToast ? 'show' : 'hide'}`}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body fw-medium py-3 px-4">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i> 
              Feedback submitted successfully! Thank you.
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white me-3 m-auto" 
              onClick={() => setShowToast(false)}
              aria-label="Close notification"
            ></button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {modalState && <div className="modal-backdrop fade show" onClick={() => setModalState(null)}></div>}
      
      {/* Admin Login Modal */}
      {modalState === 'login' && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold" id="loginModalTitle">
                  <i className="bi bi-shield-lock-fill me-2"></i>Admin Access
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setModalState(null)} 
                  aria-label="Close login modal"
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <label htmlFor="adminPinInput" className="form-label text-muted fw-bold small mb-3">
                  Enter Security PIN
                </label>
                <input 
                  id="adminPinInput"
                  type="password" 
                  value={adminPinInput} 
                  onChange={(e) => { setAdminPinInput(e.target.value); setPinError(false); }} 
                  className={`form-control form-control-lg text-center fs-3 shadow-sm ${pinError ? 'is-invalid' : ''}`}
                  placeholder="••••" 
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} 
                />
                {pinError && (
                  <div className="text-danger small mt-2 fw-medium">
                    <i className="bi bi-exclamation-circle me-1"></i>Incorrect PIN. Try again.
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pb-4 pt-0 justify-content-center">
                <button 
                  className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" 
                  onClick={handleAdminLogin}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {modalState === 'logout' && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="logoutModalTitle">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg text-center p-4">
              <div className="mb-3">
                <i className="bi bi-box-arrow-right text-danger" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="fw-bold mb-2" id="logoutModalTitle">Confirm Logout</h5>
              <p className="text-muted small mb-4">Are you sure you want to log out of the admin dashboard?</p>
              <div className="d-flex justify-content-center gap-2">
                <button 
                  className="btn btn-light rounded-pill px-4" 
                  onClick={() => setModalState(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" 
                  onClick={executeLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}