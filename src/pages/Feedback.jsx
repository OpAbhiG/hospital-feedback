import React, { useState } from 'react';

export default function Feedback({ hospitalConfig, submitFeedback, goHome }) {
  const [step, setStep] = useState('select-dept'); // 'select-dept', 'form', 'thank-you'
  const [currentType, setCurrentType] = useState('');
  const [currentCategory, setCurrentCategory] = useState('Positive');
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({ patientName: '', mobile: '', age: '', gender: '', feedbackText: '' });
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleDeptSelect = (type) => {
    setCurrentType(type);
    const initialAnswers = {};
    hospitalConfig[type].questions.forEach(q => initialAnswers[q] = 'Good');
    setQuestionAnswers(initialAnswers);
    setStep('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const feedbackObj = {
      id: 'FB-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      feedbackType: currentType,
      patientName: formData.patientName.trim() || 'Anonymous',
      mobile: formData.mobile.trim(),
      age: parseInt(formData.age),
      gender: formData.gender,
      rating,
      category: currentCategory,
      questionAnswers,
      feedbackText: formData.feedbackText.trim(),
      createdAt: new Date().toISOString()
    };
    submitFeedback(feedbackObj);
    setStep('thank-you');
  };

  if (step === 'select-dept') {
    return (
      <div className="container py-5 page active">
        <div className="text-center mb-5 mt-4">
          <h2 className="fw-bold text-main">Select Department</h2>
          <p className="text-muted">Where did you receive your care today?</p>
        </div>
        <div className="row justify-content-center g-4">
          {Object.entries(hospitalConfig).map(([deptName, data]) => (
            <div className="col-lg-5 col-md-6" key={deptName}>
              <div className="feedback-card glass card p-5 text-center h-100" onClick={() => handleDeptSelect(deptName)}>
                <div className="mb-4"><i className={`bi ${data.icon} text-accent`} style={{ fontSize: '4.5rem' }}></i></div>
                <h3 className="fw-bold text-main">{deptName}</h3>
                <p className="text-muted mb-0">{data.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="container py-5 page active mt-4">
        <button className="btn btn-link text-muted text-decoration-none mb-3 px-0 fw-medium" onClick={() => setStep('select-dept')}>
          <i className="bi bi-arrow-left"></i> Back to selection
        </button>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass card border-0 overflow-hidden">
              <div className="card-header bg-primary text-white py-4 border-0">
                <h4 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <i className={`bi ${hospitalConfig[currentType]?.icon}`}></i> {currentType} Feedback
                </h4>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <h5 className="fw-bold mb-3 text-primary border-bottom pb-2">Patient Details</h5>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Full Name</label>
                      <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className="form-control" placeholder="Optional" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Mobile Number</label>
                      <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="form-control" placeholder="Optional" pattern="[0-9]{10}" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Age <span className="text-danger">*</span></label>
                      <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="form-control" required min="1" max="120" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Gender <span className="text-danger">*</span></label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="form-select" required>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <h5 className="fw-bold mt-5 mb-3 text-primary border-bottom pb-2">Overall Experience</h5>
                  <div className="star-rating mb-4">
                    {[5, 4, 3, 2, 1].map((num) => (
                      <React.Fragment key={num}>
                        <input type="radio" id={`star${num}`} name="rating" value={num} checked={rating === num} onChange={() => setRating(num)} required />
                        <label htmlFor={`star${num}`} className="bi bi-star-fill" title={`${num} stars`}></label>
                      </React.Fragment>
                    ))}
                  </div>

                  <h5 className="fw-bold mt-5 mb-3 text-primary border-bottom pb-2">Experience Category</h5>
                  <div className="btn-group w-100 mb-4 gap-2 d-flex flex-wrap flex-md-nowrap" role="group">
                    <button type="button" className={`category-btn btn btn-outline-success flex-fill py-2 ${currentCategory === 'Positive' ? 'active-positive' : ''}`} onClick={() => setCurrentCategory('Positive')}>😊 Positive</button>
                    <button type="button" className={`category-btn btn btn-outline-warning flex-fill py-2 ${currentCategory === 'Neutral' ? 'active-neutral' : ''}`} onClick={() => setCurrentCategory('Neutral')}>😐 Neutral</button>
                    <button type="button" className={`category-btn btn btn-outline-danger flex-fill py-2 ${currentCategory === 'Negative' ? 'active-negative' : ''}`} onClick={() => setCurrentCategory('Negative')}>😞 Negative</button>
                  </div>

                  <div className="mb-4 bg-light p-4 rounded-3 border">
                    <h6 className="mb-3 fw-bold text-main border-bottom pb-2">Rate Specific Services</h6>
                    <div className="row g-3">
                      {hospitalConfig[currentType]?.questions.map((q, idx) => (
                        <div className="col-md-6" key={idx}>
                          <label className="form-label text-muted small fw-bold mb-1">{q}</label>
                          <select className="form-select shadow-sm" value={questionAnswers[q] || 'Good'} onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q]: e.target.value })}>
                            <option value="Excellent">⭐⭐⭐⭐⭐ Excellent</option>
                            <option value="Good">⭐⭐⭐⭐ Good</option>
                            <option value="Average">⭐⭐⭐ Average</option>
                            <option value="Poor">⭐⭐ Poor</option>
                            <option value="Terrible">⭐ Terrible</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-bold text-primary">Additional Comments</label>
                    <textarea className="form-control" rows="4" placeholder="Tell us more about your experience..." value={formData.feedbackText} onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}></textarea>
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

  return (
    <div className="container py-5 text-center page active mt-5">
      <div className="glass card mx-auto border-0" style={{ maxWidth: '500px' }}>
        <div className="card-body py-5 px-4">
          <div className="mb-4"><i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i></div>
          <h2 className="text-main fw-bold">Thank You!</h2>
          <p className="text-muted mt-3 mb-4">Your feedback is invaluable to us. We will use it to improve our services.</p>
          <button onClick={goHome} className="btn btn-outline-primary px-5 py-2 fw-bold rounded-pill">Return to Home</button>
        </div>
      </div>
    </div>
  );
}