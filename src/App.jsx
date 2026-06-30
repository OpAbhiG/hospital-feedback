import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';

const defaultDepartments = {
  "OPD": { icon: "bi-person-walking", desc: "Outpatient Department (Consultations, regular checkups)", questions: ["Registration Experience", "Waiting Time", "Doctor's Behavior", "Support Staff Behavior", "Premises Cleanliness"] },
  "IPD": { icon: "bi-hospital", desc: "Inpatient Department (Admissions, surgeries, overnight stays)", questions: ["Admission Process", "Nursing Care", "Doctor's Care", "Room Cleanliness", "Food & Diet", "Discharge Process"] }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAdminActive, setIsAdminActive] = useState(sessionStorage.getItem('isAdminActive') === 'true');
  const [feedbacks, setFeedbacks] = useState(JSON.parse(localStorage.getItem('hospitalFeedbacks')) || []);
  const [hospitalConfig, setHospitalConfig] = useState(JSON.parse(localStorage.getItem('hospitalConfig')) || defaultDepartments);
  
  // App-level Modals
  const [modalState, setModalState] = useState(null); 
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Future API logic easily plugs in here
  const handleNewFeedback = (feedback) => {
    const updated = [...feedbacks, feedback];
    setFeedbacks(updated);
    localStorage.setItem('hospitalFeedbacks', JSON.stringify(updated));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleConfigUpdate = (newConfig) => {
    setHospitalConfig(newConfig);
    localStorage.setItem('hospitalConfig', JSON.stringify(newConfig));
  };

  const handleAdminLogin = () => {
    if (adminPinInput === "1234") {
      sessionStorage.setItem('isAdminActive', 'true');
      setIsAdminActive(true);
      setModalState(null);
      setCurrentPage('admin');
      setAdminPinInput('');
      setPinError(false);
    } else setPinError(true);
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
        openLoginModal={() => { if (!isAdminActive) setModalState('login') }}
        confirmLogout={() => setModalState('logout')}
      />

      {/* Page Routing */}
      {currentPage === 'landing' && <Home startFeedback={() => setCurrentPage('feedback')} />}
      {currentPage === 'feedback' && <Feedback hospitalConfig={hospitalConfig} submitFeedback={handleNewFeedback} goHome={() => setCurrentPage('landing')} />}
      {currentPage === 'admin' && isAdminActive && <Admin feedbacks={feedbacks} hospitalConfig={hospitalConfig} updateConfig={handleConfigUpdate} />}

      {/* Global Toast */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
        <div className={`toast align-items-center text-white bg-success border-0 ${showToast ? 'show' : ''}`}>
          <div className="d-flex">
            <div className="toast-body fw-medium"><i className="bi bi-check-circle-fill me-2"></i> Feedback submitted successfully!</div>
          </div>
        </div>
      </div>

      {/* Global Modals (Login/Logout) */}
      {modalState && <div className="modal-backdrop fade show"></div>}
      
      {modalState === 'login' && (
        <div className="modal fade show d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content shadow-lg border-0"><div className="modal-header bg-primary text-white border-0 py-3"><h5 className="modal-title fw-bold"><i className="bi bi-shield-lock-fill me-2"></i>Admin Access</h5><button type="button" className="btn-close btn-close-white" onClick={() => setModalState(null)}></button></div><div className="modal-body p-4 text-center"><label className="form-label text-muted fw-bold small mb-3">Enter Security PIN</label><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} className="form-control form-control-lg text-center fs-3 shadow-sm" placeholder="••••" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />{pinError && <p className="text-danger small mt-2 mb-0"><i className="bi bi-exclamation-circle me-1"></i>Incorrect PIN.</p>}</div><div className="modal-footer border-0 pb-4 pt-0 justify-content-center"><button className="btn btn-primary w-100 rounded-pill fw-bold py-2" onClick={handleAdminLogin}>Login</button></div></div></div></div>
      )}

      {modalState === 'logout' && (
        <div className="modal fade show d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content shadow-lg text-center p-4"><div className="mb-3"><i className="bi bi-box-arrow-right text-danger" style={{fontSize: '3rem'}}></i></div><h5 className="fw-bold mb-2">Logout</h5><p className="text-muted small mb-4">Are you sure you want to log out of the admin dashboard?</p><div className="d-flex justify-content-center gap-2"><button className="btn btn-light rounded-pill px-4" onClick={() => setModalState(null)}>Cancel</button><button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={executeLogout}>Logout</button></div></div></div></div>
      )}
    </>
  );
}