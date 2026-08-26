import React, { useState } from 'react';

const EMOJI_SCALE = [
  { value: 1, text: 'Terrible', emoji: '😠' },
  { value: 2, text: 'Poor', emoji: '😕' },
  { value: 3, text: 'Average', emoji: '😐' },
  { value: 4, text: 'Good', emoji: '😊' },
  { value: 5, text: 'Excellent', emoji: '🤩' }
];

const INITIAL_FORM_DATA = { patientName: '', mobile: '', age: '', gender: '', feedbackText: '', recommendScore: null };

export default function Feedback({ hospitalConfig, submitFeedback, goHome }) {
  const [step, setStep] = useState('select-dept'); // 'select-dept' | 'form' | 'thank-you'
  const [currentType, setCurrentType] = useState('');
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleDeptSelect = (type) => {
    setCurrentType(type);
    // Unbiased survey design: start with empty answers so patient actively chooses
    const initialAnswers = {};
    if (hospitalConfig[type]?.questions) {
      hospitalConfig[type].questions.forEach(q => {
        const qText = typeof q === 'object' ? q.text : q;
        initialAnswers[qText] = '';
      });
    }
    setQuestionAnswers(initialAnswers);
    setStep('form');
  };

  const handleResetAndHome = () => {
    setFormData(INITIAL_FORM_DATA);
    setQuestionAnswers({});
    setRating(5);
    setStep('select-dept');
    goHome();
  };

  const handleAnotherFeedback = () => {
    setFormData(INITIAL_FORM_DATA);
    setQuestionAnswers({});
    setRating(5);
    setStep('select-dept');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all department questions have been answered
    const questions = hospitalConfig[currentType]?.questions || [];
    for (const q of questions) {
      const qText = typeof q === 'object' ? q.text : q;
      if (!questionAnswers[qText]) {
        alert(`Please answer the question: "${qText}"`);
        return;
      }
    }

    if (formData.recommendScore === null) {
      alert("Please select a recommendation score (Question 5).");
      return;
    }

    const uniqueId = 'FB-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    const computedCategory = rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative';

    const feedbackObj = {
      id: uniqueId,
      feedbackType: currentType,
      patientName: formData.patientName.trim() || 'Anonymous',
      mobile: formData.mobile.trim(),
      age: formData.age ? parseInt(formData.age, 10) : null,
      gender: formData.gender || 'Not specified',
      rating,
      category: computedCategory,
      questionAnswers,
      feedbackText: formData.feedbackText.trim(),
      recommendScore: formData.recommendScore,
      createdAt: new Date().toISOString()
    };

    submitFeedback(feedbackObj);
    setStep('thank-you');
  };

  // Step 1: Select Department
  if (step === 'select-dept') {
    return (
      <div className="container py-5 page active">
        {/* Step Progress */}
        <div className="d-flex justify-content-center mb-4">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold">
            Step 1 of 2: Select Department
          </span>
        </div>

        <div className="text-center mb-5 mt-1">
          <h2 className="fw-bold text-main">Select Department</h2>
          <p className="text-muted">Where did you receive your eye care services today?</p>
        </div>

        <div className="row justify-content-center g-4">
          {Object.entries(hospitalConfig).map(([deptName, data]) => (
            <div className="col-lg-5 col-md-6" key={deptName}>
              <div 
                className="feedback-card glass card p-4 p-md-5 text-center h-100" 
                onClick={() => handleDeptSelect(deptName)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${deptName} Department`}
                onKeyDown={(e) => e.key === 'Enter' && handleDeptSelect(deptName)}
              >
                <div className="mb-4">
                  <i className={`bi ${data.icon} text-accent`} style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold text-main mb-2">{deptName}</h3>
                <p className="text-muted mb-0">{data.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Feedback Form
  if (step === 'form') {
    return (
      <div className="container py-4 page active mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            className="btn btn-link text-muted text-decoration-none px-0 fw-medium d-inline-flex align-items-center gap-1" 
            onClick={() => setStep('select-dept')}
          >
            <i className="bi bi-arrow-left"></i> Change Department
          </button>
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold">
            Step 2 of 2: Details & Ratings
          </span>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass card border-0 overflow-hidden shadow-sm">
              <div className="card-header bg-primary text-white py-4 border-0">
                <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <i className={`bi ${hospitalConfig[currentType]?.icon}`}></i> {currentType} Patient Feedback
                </h4>
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  {/* Patient Details Section */}
                  <h5 className="fw-bold mb-3 text-primary border-bottom pb-2">1. Patient Details</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label htmlFor="patientName" className="form-label text-muted small fw-bold">Patient Name <span className="text-danger">*</span></label>
                      <input 
                        id="patientName"
                        type="text" 
                        value={formData.patientName} 
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} 
                        className="form-control" 
                        required
                        placeholder="Enter patient name" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="mobile" className="form-label text-muted small fw-bold">Mobile Number <span className="text-danger">*</span></label>
                      <input 
                        id="mobile"
                        type="tel" 
                        value={formData.mobile} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setFormData({ ...formData, mobile: val });
                          }
                        }} 
                        className="form-control" 
                        required
                        placeholder="Enter 10-digit mobile number" 
                        maxLength={10}
                        pattern="[0-9]{10}" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="age" className="form-label text-muted small fw-bold">Age</label>
                      <input 
                        id="age"
                        type="number" 
                        value={formData.age} 
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })} 
                        className="form-control" 
                        min="1" 
                        max="120" 
                        placeholder="Optional (e.g. 45)"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="gender" className="form-label text-muted small fw-bold">Gender</label>
                      <select 
                        id="gender"
                        value={formData.gender} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="form-select"
                      >
                        <option value="">Select Gender (Optional)</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Overall Rating Emoji Scale */}
                  <h5 className="fw-bold mt-5 mb-3 text-primary border-bottom pb-2">2. Overall Experience</h5>
                  <p className="text-center text-muted small mb-3">Select the emoji that best describes your overall visit today.</p>
                  
                  <div className="d-flex justify-content-center gap-2 gap-md-4 mb-4 flex-wrap" role="radiogroup" aria-label="Overall Experience Rating">
                    {EMOJI_SCALE.map((item) => {
                      const isSelected = rating === item.value;
                      return (
                        <div 
                          key={`overall-${item.value}`} 
                          className="emoji-option text-center"
                          onClick={() => setRating(item.value)}
                          tabIndex={0}
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`${item.text} (${item.value} out of 5)`}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRating(item.value)}
                        >
                          <div style={{ 
                            fontSize: '2.5rem', 
                            opacity: isSelected ? 1 : 0.35, 
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)', 
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                          }}>
                            {item.emoji}
                          </div>
                          <div className={`small mt-1 fw-medium ${isSelected ? 'text-primary fw-bold' : 'text-muted'}`}>
                            {item.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Specific Service Ratings */}
                  <div className="mb-4 bg-light p-3 p-md-4 rounded-3 border">
                    <h6 className="mb-3 fw-bold text-main border-bottom pb-2">3. Specific Department Services</h6>
                    <div className="row g-3">
                      {hospitalConfig[currentType]?.questions.map((q, idx) => {
                        const qText = typeof q === 'object' ? q.text : q;
                        const qType = typeof q === 'object' ? q.type : 'emoji-5';
                        const qOptions = typeof q === 'object' ? q.options : null;

                        return (
                          <div className="col-md-6" key={idx}>
                            <label className="form-label text-muted small fw-bold mb-2">
                              {qText} <span className="text-danger">*</span>
                            </label>

                            {qType === 'select' ? (
                              <div className="d-flex gap-2">
                                {(qOptions || ["Yes", "No", "May be"]).map(opt => {
                                  const isSelected = questionAnswers[qText] === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={`btn btn-sm flex-fill py-2 rounded-pill fw-medium ${
                                        isSelected ? 'btn-primary' : 'btn-outline-primary bg-white'
                                      }`}
                                      onClick={() => setQuestionAnswers({ ...questionAnswers, [qText]: opt })}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : qType === 'emoji-3' ? (
                              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm border" style={{ height: '42px' }}>
                                {[
                                  { text: "Good", emoji: "😊" },
                                  { text: "Neutral", emoji: "😐" },
                                  { text: "Bad", emoji: "😞" }
                                ].map(opt => {
                                  const isSelected = questionAnswers[qText] === opt.text;
                                  return (
                                    <div
                                      key={opt.text}
                                      title={opt.text}
                                      className="emoji-option flex-fill text-center d-flex align-items-center justify-content-center gap-1"
                                      onClick={() => setQuestionAnswers({ ...questionAnswers, [qText]: opt.text })}
                                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                      <span style={{
                                        fontSize: '1.3rem',
                                        opacity: isSelected ? 1 : 0.3,
                                        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.2s'
                                      }}>
                                        {opt.emoji}
                                      </span>
                                      {isSelected && (
                                        <span className="small fw-bold text-primary" style={{ fontSize: '0.75rem' }}>
                                          {opt.text}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm border">
                                {EMOJI_SCALE.map((item) => {
                                  const isSelected = questionAnswers[qText] === item.text;
                                  return (
                                    <div 
                                      key={`q-${idx}-${item.value}`} 
                                      title={item.text}
                                      className="emoji-option"
                                      onClick={() => setQuestionAnswers({ ...questionAnswers, [qText]: item.text })}
                                      tabIndex={0}
                                      role="radio"
                                      aria-checked={isSelected}
                                      aria-label={`${qText}: ${item.text}`}
                                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setQuestionAnswers({ ...questionAnswers, [qText]: item.text })}
                                    >
                                      <div style={{ 
                                        fontSize: '1.4rem', 
                                        opacity: isSelected ? 1 : 0.25, 
                                        transform: isSelected ? 'scale(1.25)' : 'scale(1)', 
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                                      }}>
                                        {item.emoji}
                                      </div>
                                    </div>
                                  );
                                })}
                                {(qType === 'emoji-5-na' || qText.toLowerCase().includes('call center')) && (
                                  <div 
                                    title="Not Applicable"
                                    className="emoji-option d-flex align-items-center justify-content-center fw-bold rounded-circle border"
                                    style={{ 
                                      width: '32px', 
                                      height: '32px', 
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      opacity: questionAnswers[qText] === 'N/A' ? 1 : 0.25,
                                      backgroundColor: questionAnswers[qText] === 'N/A' ? '#e9ecef' : 'transparent',
                                      color: questionAnswers[qText] === 'N/A' ? '#0d6efd' : '#6c757d',
                                      borderColor: questionAnswers[qText] === 'N/A' ? '#0d6efd' : '#cbd5e1',
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => setQuestionAnswers({ ...questionAnswers, [qText]: 'N/A' })}
                                    tabIndex={0}
                                    role="radio"
                                    aria-checked={questionAnswers[qText] === 'N/A'}
                                    aria-label={`${qText}: Not Applicable`}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setQuestionAnswers({ ...questionAnswers, [qText]: 'N/A' })}
                                  >
                                    N/A
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mb-4">
                    <label htmlFor="feedbackComments" className="form-label fw-bold text-primary">4. Tell us about your experience</label>
                    <textarea 
                      id="feedbackComments"
                      className="form-control" 
                      rows="4" 
                      placeholder="Tell us about your experience..." 
                      value={formData.feedbackText} 
                      onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Recommendation Score (NPS) */}
                  <div className="mb-4 border-top pt-4">
                    <label className="form-label fw-bold text-primary mb-3">5. How likely are you to recommend us to your friends and family?</label>
                    
                    {/* Numbers 0 to 10 Container grouped dynamically */}
                    <div className="d-flex justify-content-between gap-3 mb-4 w-100 align-items-end flex-wrap flex-md-nowrap" style={{ paddingBottom: '8px' }}>
                      {/* Detractors Group (0-6) */}
                      <div className="d-flex flex-column flex-fill" style={{ minWidth: '270px' }}>
                        <span className="text-muted small fw-bold text-start mb-2 text-uppercase px-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                          Not at all likely
                        </span>
                        <div className="d-flex justify-content-between gap-1 p-1.5 rounded bg-light border-bottom border-3 border-danger">
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => {
                            const isSelected = formData.recommendScore === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                className="btn p-0 d-flex align-items-center justify-content-center flex-fill rounded-circle shadow-sm"
                                style={{ 
                                  width: '38px', 
                                  height: '38px',
                                  minWidth: '32px',
                                  minHeight: '32px',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  backgroundColor: isSelected ? '#dc2626' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#4b5563',
                                  border: `2px solid ${isSelected ? '#dc2626' : '#e5e7eb'}`,
                                  transition: 'all 0.15s'
                                }}
                                onClick={() => setFormData({ ...formData, recommendScore: num })}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Passives Group (7-8) */}
                      <div className="d-flex flex-column flex-fill" style={{ maxWidth: '120px', minWidth: '90px' }}>
                        <span className="text-muted small fw-bold text-center mb-2 text-uppercase invisible" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                          Neutral
                        </span>
                        <div className="d-flex justify-content-between gap-1 p-1.5 rounded bg-light border-bottom border-3 border-secondary">
                          {[7, 8].map((num) => {
                            const isSelected = formData.recommendScore === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                className="btn p-0 d-flex align-items-center justify-content-center flex-fill rounded-circle shadow-sm"
                                style={{ 
                                  width: '38px', 
                                  height: '38px',
                                  minWidth: '32px',
                                  minHeight: '32px',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  backgroundColor: isSelected ? '#6b7280' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#4b5563',
                                  border: `2px solid ${isSelected ? '#6b7280' : '#e5e7eb'}`,
                                  transition: 'all 0.15s'
                                }}
                                onClick={() => setFormData({ ...formData, recommendScore: num })}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Promoters Group (9-10) */}
                      <div className="d-flex flex-column flex-fill" style={{ maxWidth: '120px', minWidth: '90px' }}>
                        <span className="text-muted small fw-bold text-end mb-2 text-uppercase px-1" style={{ fontSize: '0.75rem', color: '#b45309', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                          Extremely likely
                        </span>
                        <div className="d-flex justify-content-between gap-1 p-1.5 rounded bg-light border-bottom border-3 border-warning">
                          {[9, 10].map((num) => {
                            const isSelected = formData.recommendScore === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                className="btn p-0 d-flex align-items-center justify-content-center flex-fill rounded-circle shadow-sm"
                                style={{ 
                                  width: '38px', 
                                  height: '38px',
                                  minWidth: '32px',
                                  minHeight: '32px',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  backgroundColor: isSelected ? '#eab308' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#4b5563',
                                  border: `2px solid ${isSelected ? '#eab308' : '#e5e7eb'}`,
                                  transition: 'all 0.15s'
                                }}
                                onClick={() => setFormData({ ...formData, recommendScore: num })}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Group Categories Visual Design */}
                    <div className="row g-2 text-center align-items-center justify-content-center">
                      {/* Detractors Group */}
                      <div className="col-4">
                        <div 
                          className="p-2 rounded-3 transition-all d-flex flex-column align-items-center"
                          style={{
                            borderTop: '3px solid #dc2626',
                            backgroundColor: formData.recommendScore !== null && formData.recommendScore <= 6 ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                            opacity: formData.recommendScore !== null && formData.recommendScore <= 6 ? 1 : 0.4,
                            transition: 'all 0.3s'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem', lineHeight: 1 }} className="mb-1">😠</span>
                          <span className="fw-bold small text-danger" style={{ fontSize: '0.8rem' }}>Detractors</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>(0-6)</span>
                        </div>
                      </div>

                      {/* Passives Group */}
                      <div className="col-4">
                        <div 
                          className="p-2 rounded-3 transition-all d-flex flex-column align-items-center"
                          style={{
                            borderTop: '3px solid #6b7280',
                            backgroundColor: formData.recommendScore !== null && (formData.recommendScore === 7 || formData.recommendScore === 8) ? 'rgba(107, 114, 128, 0.05)' : 'transparent',
                            opacity: formData.recommendScore !== null && (formData.recommendScore === 7 || formData.recommendScore === 8) ? 1 : 0.4,
                            transition: 'all 0.3s'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem', lineHeight: 1 }} className="mb-1">😐</span>
                          <span className="fw-bold small text-secondary" style={{ fontSize: '0.8rem' }}>Passives</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>(7-8)</span>
                        </div>
                      </div>

                      {/* Promoters Group */}
                      <div className="col-4">
                        <div 
                          className="p-2 rounded-3 transition-all d-flex flex-column align-items-center"
                          style={{
                            borderTop: '3px solid #eab308',
                            backgroundColor: formData.recommendScore !== null && formData.recommendScore >= 9 ? 'rgba(234, 179, 8, 0.05)' : 'transparent',
                            opacity: formData.recommendScore !== null && formData.recommendScore >= 9 ? 1 : 0.4,
                            transition: 'all 0.3s'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem', lineHeight: 1 }} className="mb-1">😄</span>
                          <span className="fw-bold small" style={{ fontSize: '0.8rem', color: '#b45309' }}>Promoters</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>(9-10)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-3 fs-5 fw-bold rounded-pill shadow-sm">
                    Submit Feedback <i className="bi bi-send ms-2"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div> 
      </div>
    );
  }

  // Step 3: Thank You Screen
  return (
    <div className="container py-5 text-center page active mt-4">
      <div className="glass card mx-auto border-0 shadow-lg" style={{ maxWidth: '520px' }}>
        <div className="card-body py-5 px-4">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4.5rem' }}></i>
          </div>
          <h2 className="text-main fw-bold">Thank You!</h2>
          <p className="text-muted mt-3 mb-4">Your feedback has been submitted successfully. Your input helps us continuously improve our patient care standards.</p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <button onClick={handleAnotherFeedback} className="btn btn-outline-primary px-4 py-2.5 fw-bold rounded-pill">
              Submit Another Feedback
            </button>
            <button onClick={handleResetAndHome} className="btn btn-primary px-4 py-2.5 fw-bold rounded-pill shadow-sm">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}