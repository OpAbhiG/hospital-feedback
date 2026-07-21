import React, { useState } from 'react';

const EMOJI_SCALE = [
  { value: 1, text: 'Terrible', emoji: '😠' },
  { value: 2, text: 'Poor', emoji: '😕' },
  { value: 3, text: 'Average', emoji: '😐' },
  { value: 4, text: 'Good', emoji: '😊' },
  { value: 5, text: 'Excellent', emoji: '🤩' }
];

const INITIAL_FORM_DATA = { patientName: '', mobile: '', age: '', gender: '', feedbackText: '' };

export default function Feedback({ hospitalConfig, submitFeedback, goHome }) {
  const [step, setStep] = useState('select-dept'); // 'select-dept' | 'form' | 'thank-you'
  const [currentType, setCurrentType] = useState('');
  const [currentCategory, setCurrentCategory] = useState('Positive');
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleDeptSelect = (type) => {
    setCurrentType(type);
    // Unbiased survey design: start with empty answers so patient actively chooses
    const initialAnswers = {};
    hospitalConfig[type]?.questions.forEach(q => initialAnswers[q] = '');
    setQuestionAnswers(initialAnswers);
    setStep('form');
  };

  const handleResetAndHome = () => {
    setFormData(INITIAL_FORM_DATA);
    setQuestionAnswers({});
    setRating(5);
    setCurrentCategory('Positive');
    setStep('select-dept');
    goHome();
  };

  const handleAnotherFeedback = () => {
    setFormData(INITIAL_FORM_DATA);
    setQuestionAnswers({});
    setRating(5);
    setCurrentCategory('Positive');
    setStep('select-dept');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const uniqueId = 'FB-' + Math.random().toString(36).substring(2, 11).toUpperCase();

    const feedbackObj = {
      id: uniqueId,
      feedbackType: currentType,
      patientName: formData.patientName.trim() || 'Anonymous',
      mobile: formData.mobile.trim(),
      age: formData.age ? parseInt(formData.age, 10) : null,
      gender: formData.gender || 'Not specified',
      rating,
      category: currentCategory,
      questionAnswers,
      feedbackText: formData.feedbackText.trim(),
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
                      <label htmlFor="patientName" className="form-label text-muted small fw-bold">Full Name</label>
                      <input 
                        id="patientName"
                        type="text" 
                        value={formData.patientName} 
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} 
                        className="form-control" 
                        placeholder="Optional (or Anonymous)" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="mobile" className="form-label text-muted small fw-bold">Mobile Number</label>
                      <input 
                        id="mobile"
                        type="tel" 
                        value={formData.mobile} 
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} 
                        className="form-control" 
                        placeholder="Optional 10-digit number" 
                        pattern="[0-9]{10}" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="age" className="form-label text-muted small fw-bold">Age <span className="text-danger">*</span></label>
                      <input 
                        id="age"
                        type="number" 
                        value={formData.age} 
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })} 
                        className="form-control" 
                        required 
                        min="1" 
                        max="120" 
                        placeholder="e.g. 45"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="gender" className="form-label text-muted small fw-bold">Gender <span className="text-danger">*</span></label>
                      <select 
                        id="gender"
                        value={formData.gender} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="form-select" 
                        required
                      >
                        <option value="" disabled>Select Gender</option>
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

                  {/* Sentiment Category Buttons */}
                  <h5 className="fw-bold mt-4 mb-3 text-primary border-bottom pb-2">3. General Sentiment</h5>
                  <div className="btn-group w-100 mb-4 gap-2 d-flex flex-wrap flex-md-nowrap" role="group">
                    <button 
                      type="button" 
                      className={`category-btn btn btn-outline-success flex-fill py-2 ${currentCategory === 'Positive' ? 'active-positive' : ''}`} 
                      onClick={() => setCurrentCategory('Positive')}
                    >
                      😊 Positive
                    </button>
                    <button 
                      type="button" 
                      className={`category-btn btn btn-outline-warning flex-fill py-2 ${currentCategory === 'Neutral' ? 'active-neutral' : ''}`} 
                      onClick={() => setCurrentCategory('Neutral')}
                    >
                      😐 Neutral
                    </button>
                    <button 
                      type="button" 
                      className={`category-btn btn btn-outline-danger flex-fill py-2 ${currentCategory === 'Negative' ? 'active-negative' : ''}`} 
                      onClick={() => setCurrentCategory('Negative')}
                    >
                      😞 Negative
                    </button>
                  </div>

                  {/* Specific Service Ratings */}
                  <div className="mb-4 bg-light p-3 p-md-4 rounded-3 border">
                    <h6 className="mb-3 fw-bold text-main border-bottom pb-2">4. Specific Department Services</h6>
                    <div className="row g-3">
                      {hospitalConfig[currentType]?.questions.map((q, idx) => (
                        <div className="col-md-6" key={idx}>
                          <label className="form-label text-muted small fw-bold mb-2">{q}</label>
                          <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm border">
                            {EMOJI_SCALE.map((item) => {
                              const isSelected = questionAnswers[q] === item.text;
                              return (
                                <div 
                                  key={`q-${idx}-${item.value}`} 
                                  title={item.text}
                                  className="emoji-option"
                                  onClick={() => setQuestionAnswers({ ...questionAnswers, [q]: item.text })}
                                  tabIndex={0}
                                  role="radio"
                                  aria-checked={isSelected}
                                  aria-label={`${q}: ${item.text}`}
                                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setQuestionAnswers({ ...questionAnswers, [q]: item.text })}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mb-4">
                    <label htmlFor="feedbackComments" className="form-label fw-bold text-primary">5. Any suggestions or comments?</label>
                    <textarea 
                      id="feedbackComments"
                      className="form-control" 
                      rows="4" 
                      placeholder="Tell us about your doctor consultation, nursing care, wait times, or cleanliness..." 
                      value={formData.feedbackText} 
                      onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
                    ></textarea>
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