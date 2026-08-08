import React, { useState, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Admin({ feedbacks = [], hospitalConfig = {}, updateConfig, deleteFeedback, seedDemoData }) {
  const [sortMode, setSortMode] = useState('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exportDept, setExportDept] = useState('ALL');
  const [uncheckedDepts, setUncheckedDepts] = useState([]);
  const [uncheckedSentiments, setUncheckedSentiments] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Modals specific to Admin
  const [modalState, setModalState] = useState(null); // 'addDept' | 'addQuestion' | 'confirm' | 'viewDetail' | null
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [newDept, setNewDept] = useState({ name: '', desc: '' });
  const [newQuestion, setNewQuestion] = useState({ dept: '', text: '' });
  const [confirmAction, setConfirmAction] = useState({ msg: '', onConfirm: null });

  // Filtered feedbacks (applies Date Range, Dept, Sentiment)
  const dateFilteredFeedbacks = useMemo(() => {
    let result = [...feedbacks];

    // Filter by Date Range
    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(f => f.createdAt && new Date(f.createdAt) >= start);
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(f => f.createdAt && new Date(f.createdAt) <= end);
    }

    // Filter by unchecked Departments
    if (uncheckedDepts.length > 0) {
      result = result.filter(f => f.feedbackType && !uncheckedDepts.includes(f.feedbackType));
    }

    // Filter by unchecked Sentiments
    if (uncheckedSentiments.length > 0) {
      result = result.filter(f => f.category && !uncheckedSentiments.includes(f.category));
    }

    return result;
  }, [feedbacks, fromDate, toDate, uncheckedDepts, uncheckedSentiments]);

  // Memoized Chart Calculations for high performance
  const chartData = useMemo(() => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const trendLabels = [];
    const trendData = [];
    const today = new Date();
    
    // Past 6 months trend calculation
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      trendLabels.push(monthNames[d.getMonth()]);
      const count = dateFilteredFeedbacks.filter(f => {
        const date = new Date(f.createdAt);
        return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
      }).length;
      trendData.push(count);
    }

    const posCount = dateFilteredFeedbacks.filter(f => f.category === 'Positive').length;
    const neuCount = dateFilteredFeedbacks.filter(f => f.category === 'Neutral').length;
    const negCount = dateFilteredFeedbacks.filter(f => f.category === 'Negative').length;

    const hasData = dateFilteredFeedbacks.length > 0;

    return {
      lineData: {
        labels: trendLabels,
        datasets: [{
          label: 'Feedback Entries',
          data: trendData,
          borderColor: '#0f4c81',
          backgroundColor: 'rgba(15, 76, 129, 0.12)',
          tension: 0.4,
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0f4c81',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      pieData: {
        labels: hasData ? ['Positive', 'Neutral', 'Negative'] : ['No Data'],
        datasets: [{
          data: hasData ? [posCount, neuCount, negCount] : [1],
          backgroundColor: hasData ? ['#059669', '#d97706', '#dc2626'] : ['#cbd5e1'],
          borderWidth: 0,
          hoverOffset: hasData ? 4 : 0
        }]
      },
      posCount,
      neuCount,
      negCount,
      avgRating: dateFilteredFeedbacks.length 
        ? (dateFilteredFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / dateFilteredFeedbacks.length).toFixed(1) 
        : '0.0'
    };
  }, [dateFilteredFeedbacks]);

  // Filter & Sort Table Submissions
  const filteredTableData = useMemo(() => {
    let result = [...dateFilteredFeedbacks];

    // Sort Modes
    if (sortMode === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortMode === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortMode === 'highest') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortMode === 'lowest') result.sort((a, b) => (a.rating || 0) - (b.rating || 0));

    return result;
  }, [dateFilteredFeedbacks, sortMode]);

  // Actions
  const saveDept = () => {
    const name = newDept.name.trim();
    if (!name || hospitalConfig[name]) return;
    
    updateConfig({ 
      ...hospitalConfig, 
      [name]: { 
        icon: "bi-building-fill", 
        desc: newDept.desc.trim() || "Healthcare Department", 
        questions: ["Overall Service Satisfaction"] 
      } 
    });
    setModalState(null);
    setNewDept({ name: '', desc: '' });
  };

  const saveQuestion = () => {
    const text = newQuestion.text.trim();
    if (text && newQuestion.dept && hospitalConfig[newQuestion.dept]) {
      const updated = { ...hospitalConfig };
      updated[newQuestion.dept].questions = [...updated[newQuestion.dept].questions, text];
      updateConfig(updated);
      setModalState(null);
      setNewQuestion({ dept: '', text: '' });
    }
  };

  const deleteConfigItem = (msg, action) => {
    setConfirmAction({ msg, onConfirm: () => { action(); setModalState(null); } });
    setModalState('confirm');
  };

  const exportCSV = (targetDept = 'ALL') => {
    const dataToExport = targetDept === 'ALL' 
      ? feedbacks 
      : feedbacks.filter(f => f.feedbackType === targetDept);

    if (!dataToExport.length) {
      return alert(`No feedback submissions available to export for ${targetDept === 'ALL' ? 'all departments' : targetDept + ' department'}.`);
    }
    
    // Add UTF-8 BOM for Microsoft Excel compatibility
    let csv = "\uFEFFFeedback ID,Date,Department,Patient Name,Mobile,Age,Gender,Rating,Category,Comments,Recommend Score\n";
    csv += dataToExport.map(f => {
      const dateStr = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '';
      const name = (f.patientName || '').replace(/"/g, '""');
      const mobile = (f.mobile || '');
      const comments = (f.feedbackText || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const nps = f.recommendScore !== undefined && f.recommendScore !== null ? f.recommendScore : '';
      return `"${f.id}","${dateStr}","${f.feedbackType}","${name}","${mobile}","${f.age || ''}","${f.gender || ''}","${f.rating || ''}","${f.category || ''}","${comments}","${nps}"`;
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileNameSuffix = targetDept === 'ALL' ? 'All_Depts' : targetDept.replace(/\s+/g, '_');
    link.download = `Hospital_Feedback_Export_${fileNameSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid py-4 px-md-5 mt-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-main m-0 d-flex align-items-center gap-2">
            <i className="bi bi-graph-up-arrow text-primary"></i> Analytics & Management Dashboard
          </h2>
          <p className="text-muted m-0">Real-time patient feedback performance overview</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {feedbacks.length === 0 && seedDemoData && (
            <button onClick={seedDemoData} className="btn btn-outline-primary rounded-pill px-4 shadow-sm fw-medium">
              <i className="bi bi-magic me-1"></i> Load Demo Data
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="glass stat-card card p-4 h-100">
            <h6 className="text-muted fw-semibold mb-2">Total Submissions</h6>
            <h2 className="text-primary fw-bold mb-0">{dateFilteredFeedbacks.length}</h2>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="glass stat-card card p-4 h-100 border-info">
            <h6 className="text-muted fw-semibold mb-2">Active Departments</h6>
            <h2 className="text-info fw-bold mb-0">{Object.keys(hospitalConfig).length}</h2>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="glass stat-card card p-4 h-100 border-success">
            <h6 className="text-muted fw-semibold mb-2">Positive Responses</h6>
            <h2 className="text-success fw-bold mb-0">{chartData.posCount}</h2>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="glass stat-card card p-4 h-100 border-warning">
            <h6 className="text-muted fw-semibold mb-2">Average Rating</h6>
            <h2 className="text-warning fw-bold mb-0">
              {chartData.avgRating} <i className="bi bi-star-fill fs-4 ms-1"></i>
            </h2>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="glass card p-4 h-100">
            <h5 className="mb-4 fw-bold text-main">Feedback Submission Trend (6 Months)</h5>
            <div className="chart-container">
              <Line data={chartData.lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass card p-4 h-100">
            <h5 className="mb-4 fw-bold text-main">Sentiment Breakdown</h5>
            <div className="chart-container">
              <Doughnut data={chartData.pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Manager */}
      <div className="glass card p-4 mb-5 border-primary border-2">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h5 className="mb-1 fw-bold text-primary">
              <i className="bi bi-gear-fill me-2"></i>Department & Questionnaires Config
            </h5>
            <p className="text-muted small m-0">Customize feedback questions for each hospital department</p>
          </div>
          <button className="btn btn-primary rounded-pill fw-medium shadow-sm" onClick={() => setModalState('addDept')}>
            <i className="bi bi-plus-circle me-1"></i> New Department
          </button>
        </div>

        <div className="row g-4">
          {Object.entries(hospitalConfig).map(([dept, data]) => (
            <div className="col-md-6 col-lg-4" key={dept}>
              <div className="card bg-light border-0 shadow-sm h-100 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold m-0 text-main d-flex align-items-center">
                    <i className={`bi ${data.icon} text-primary me-2 fs-5`}></i>{dept}
                  </h6>
                  <button 
                    className="btn btn-sm btn-outline-danger border-0" 
                    title={`Delete ${dept}`}
                    onClick={() => deleteConfigItem(`Delete ${dept} department and all its questions?`, () => {
                      const updated = { ...hospitalConfig };
                      delete updated[dept];
                      updateConfig(updated);
                    })}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>

                <div className="mb-3">
                  {data.questions.map((q, idx) => (
                    <div key={`${dept}-q-${idx}`} className="d-flex justify-content-between align-items-center bg-white border rounded p-2 mb-2 shadow-sm">
                      <span className="small fw-medium text-main">{q}</span>
                      <button 
                        className="btn btn-sm text-danger border-0 py-0" 
                        title="Remove question"
                        onClick={() => deleteConfigItem(`Remove question "${q}"?`, () => {
                          const updated = { ...hospitalConfig };
                          updated[dept].questions.splice(idx, 1);
                          updateConfig(updated);
                        })}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn-sm btn-outline-primary w-100 mt-auto rounded-pill fw-medium bg-white" 
                  onClick={() => { setNewQuestion({ dept, text: '' }); setModalState('addQuestion'); }}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Data Table */}
      <div className="glass card p-4 mb-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
          <div>
            <h5 className="mb-0 fw-bold text-main">Patient Submissions Data</h5>
            <span className="text-muted small">Showing {filteredTableData.length} of {feedbacks.length} records</span>
          </div>

          {/* Multi-Filter Toolbar */}
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-lg-end" style={{ zIndex: 10 }}>
            {/* Date Filters */}
            <div className="d-flex align-items-center gap-1 bg-white border rounded px-2 py-1 shadow-sm">
              <span className="small text-muted fw-bold">From:</span>
              <input 
                type="date" 
                className="form-control form-control-sm border-0 p-0 shadow-none" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                style={{ width: '115px', fontSize: '0.85rem', outline: 'none' }}
              />
              <span className="small text-muted fw-bold ms-1">To:</span>
              <input 
                type="date" 
                className="form-control form-control-sm border-0 p-0 shadow-none" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                style={{ width: '115px', fontSize: '0.85rem', outline: 'none' }}
              />
              {(fromDate || toDate) && (
                <button 
                  type="button"
                  className="btn btn-sm btn-link text-danger p-0 ms-1 border-0" 
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  title="Clear dates"
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            {/* Unified Custom Dropdown */}
            <div className="dropdown position-relative">
              <button 
                className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 fw-medium shadow-sm" 
                type="button" 
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              >
                <i className="bi bi-funnel-fill"></i> Filter & Sort
                {(uncheckedDepts.length > 0 || uncheckedSentiments.length > 0) && (
                  <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>!</span>
                )}
              </button>
              
              {filterDropdownOpen && (
                <>
                  <div 
                    className="position-fixed top-0 start-0 end-0 bottom-0" 
                    style={{ zIndex: 999 }} 
                    onClick={() => setFilterDropdownOpen(false)}
                  ></div>
                  <div 
                    className="dropdown-menu show p-3 shadow-lg border-0 rounded-3 mt-2 position-absolute end-0" 
                    style={{ zIndex: 1000, minWidth: '280px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}
                  >
                    {/* Sort Section */}
                    <h6 className="dropdown-header px-0 fw-bold text-primary mb-2 border-bottom pb-1">Sort By</h6>
                    <div className="mb-3">
                      {[
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'highest', label: 'Highest Rating' },
                        { value: 'lowest', label: 'Lowest Rating' }
                      ].map(opt => (
                        <div className="form-check mb-1" key={opt.value}>
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="sortModeRadio" 
                            id={`sort-${opt.value}`} 
                            value={opt.value}
                            checked={sortMode === opt.value}
                            onChange={() => setSortMode(opt.value)}
                          />
                          <label className="form-check-label small fw-medium text-main" htmlFor={`sort-${opt.value}`}>
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Departments Section */}
                    <h6 className="dropdown-header px-0 fw-bold text-primary mb-2 border-bottom pb-1">Departments</h6>
                    <div className="mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {Object.keys(hospitalConfig).map(dept => {
                        const isChecked = !uncheckedDepts.includes(dept);
                        return (
                          <div className="form-check mb-1" key={dept}>
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`filter-dept-${dept}`}
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setUncheckedDepts([...uncheckedDepts, dept]);
                                } else {
                                  setUncheckedDepts(uncheckedDepts.filter(d => d !== dept));
                                }
                              }}
                            />
                            <label className="form-check-label small fw-medium text-main" htmlFor={`filter-dept-${dept}`}>
                              {dept}
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sentiments Section */}
                    <h6 className="dropdown-header px-0 fw-bold text-primary mb-2 border-bottom pb-1">Sentiments</h6>
                    <div>
                      {[
                        { value: 'Positive', label: '😊 Positive' },
                        { value: 'Neutral', label: '😐 Neutral' },
                        { value: 'Negative', label: '😞 Negative' }
                      ].map(opt => {
                        const isChecked = !uncheckedSentiments.includes(opt.value);
                        return (
                          <div className="form-check mb-1" key={opt.value}>
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`filter-sent-${opt.value}`}
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setUncheckedSentiments([...uncheckedSentiments, opt.value]);
                                } else {
                                  setUncheckedSentiments(uncheckedSentiments.filter(s => s !== opt.value));
                                }
                              }}
                            />
                            <label className="form-check-label small fw-medium text-main" htmlFor={`filter-sent-${opt.value}`}>
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Export Dropdown & Button (side-by-side with Filter dropdown) */}
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center gap-1 bg-white border rounded px-2 py-1 shadow-sm">
                <span className="small text-muted fw-bold me-1">Export:</span>
                <select 
                  className="form-select form-select-sm border-0 p-0 shadow-none" 
                  style={{ width: '130px', fontSize: '0.85rem', outline: 'none' }}
                  value={exportDept} 
                  onChange={(e) => setExportDept(e.target.value)}
                >
                  <option value="ALL">All Depts</option>
                  {Object.keys(hospitalConfig).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => exportCSV(exportDept)} className="btn btn-success rounded-pill px-3 py-2 fs-6 shadow-sm fw-bold d-flex align-items-center gap-1">
                <i className="bi bi-file-earmark-spreadsheet"></i> Export
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Dept</th>
                <th>Patient Name</th>
                <th>Rating</th>
                <th>Sentiment</th>
                <th className="w-25">Comments</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.length > 0 ? (
                filteredTableData.map((f) => (
                  <tr key={f.id}>
                    <td className="text-muted small">
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td><span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">{f.feedbackType}</span></td>
                    <td className="fw-medium">{f.patientName}</td>
                    <td className="text-warning">
                      {'★'.repeat(f.rating || 0)}
                      <span className="text-muted opacity-25">{'★'.repeat(5 - (f.rating || 0))}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1 ${
                        f.category === 'Positive' ? 'bg-success-subtle text-success' : 
                        f.category === 'Negative' ? 'bg-danger-subtle text-danger' : 
                        'bg-warning-subtle text-warning'
                      }`}>
                        {f.category}
                      </span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '240px' }} title={f.feedbackText}>
                      {f.feedbackText || <em className="text-muted">No comments</em>}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn btn-sm btn-outline-primary rounded-circle"
                          title="View Full Submission"
                          onClick={() => { setSelectedSubmission(f); setModalState('viewDetail'); }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {deleteFeedback && (
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            title="Delete Submission"
                            onClick={() => deleteConfigItem(`Permanently delete submission ${f.id}?`, () => deleteFeedback(f.id))}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i> No matching feedback submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Dialog Modals */}
      {modalState && <div className="modal-backdrop fade show" onClick={() => setModalState(null)}></div>}
      
      {/* View Detail Modal */}
      {modalState === 'viewDetail' && selectedSubmission && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold text-primary m-0">
                  <i className="bi bi-file-earmark-text me-2"></i>Feedback Detail ({selectedSubmission.id})
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalState(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-3 mb-4 bg-light p-3 rounded-3">
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Department</span><strong>{selectedSubmission.feedbackType}</strong></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Patient Name</span><strong>{selectedSubmission.patientName}</strong></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Mobile</span><strong>{selectedSubmission.mobile || 'Not provided'}</strong></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Age / Gender</span><strong>{selectedSubmission.age ? `${selectedSubmission.age} yrs` : 'N/A'} / {selectedSubmission.gender}</strong></div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-primary-subtle rounded-3 text-primary">
                  <div>
                    <span className="small d-block fw-bold text-uppercase opacity-75">Overall Experience Rating</span>
                    <h4 className="fw-bold m-0 text-warning">
                      {'★'.repeat(selectedSubmission.rating)} <span className="fs-5 text-dark ms-2">({selectedSubmission.rating} / 5)</span>
                    </h4>
                  </div>
                  <span className={`badge rounded-pill fs-6 px-3 py-2 ${
                    selectedSubmission.category === 'Positive' ? 'bg-success text-white' : 
                    selectedSubmission.category === 'Negative' ? 'bg-danger text-white' : 
                    'bg-warning text-dark'
                  }`}>
                    {selectedSubmission.category} Sentiment
                  </span>
                </div>

                <h6 className="fw-bold text-main mb-2">Service Questionnaire Ratings</h6>
                <div className="row g-2 mb-4">
                  {Object.entries(selectedSubmission.questionAnswers || {}).map(([q, val], idx) => (
                    <div className="col-md-6" key={idx}>
                      <div className="d-flex justify-content-between align-items-center bg-white border p-2 rounded small">
                        <span className="text-muted">{q}</span>
                        <span className="fw-bold text-primary">{val || 'Not rated'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold text-main mb-2">Patient Comments & Suggestions</h6>
                <div className="bg-light p-3 rounded border text-main mb-4">
                  {selectedSubmission.feedbackText ? selectedSubmission.feedbackText : <em className="text-muted">No additional comments provided.</em>}
                </div>

                {selectedSubmission.recommendScore !== undefined && selectedSubmission.recommendScore !== null && (
                  <div className="p-3 bg-light rounded-3 border">
                    <span className="text-muted small d-block mb-1 fw-bold text-uppercase opacity-75">Recommendation Score (NPS)</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">{selectedSubmission.recommendScore} / 10</span>
                      <span className="fw-semibold text-main" style={{ fontSize: '0.95rem' }}>
                        {selectedSubmission.recommendScore >= 9 ? '😊 Happy (Likely to recommend)' : 
                         selectedSubmission.recommendScore >= 7 ? '😐 Neutral' : 
                         '😞 Sad (Unlikely to recommend)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setModalState(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Dept Modal */}
      {modalState === 'addDept' && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg p-4">
              <h5 className="fw-bold mb-3">Add New Department</h5>
              <input 
                type="text" 
                value={newDept.name} 
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} 
                className="form-control mb-3" 
                placeholder="Department Name (e.g. Optical Store)" 
                autoFocus
              />
              <input 
                type="text" 
                value={newDept.desc} 
                onChange={(e) => setNewDept({ ...newDept, desc: e.target.value })} 
                className="form-control mb-4" 
                placeholder="Description" 
              />
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setModalState(null)}>Cancel</button>
                <button className="btn btn-primary rounded-pill px-4" onClick={saveDept}>Save Department</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {modalState === 'addQuestion' && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg p-4">
              <h5 className="fw-bold mb-3">Add Question ({newQuestion.dept})</h5>
              <input 
                type="text" 
                value={newQuestion.text} 
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} 
                className="form-control mb-4" 
                placeholder="e.g. Pharmacy waiting experience..." 
                autoFocus
              />
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setModalState(null)}>Cancel</button>
                <button className="btn btn-primary rounded-pill px-4" onClick={saveQuestion}>Add Question</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalState === 'confirm' && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg text-center p-4">
              <i className="bi bi-exclamation-triangle-fill text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold mb-2">Confirm Action</h5>
              <p className="text-muted small mb-4">{confirmAction.msg}</p>
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-light rounded-pill px-3" onClick={() => setModalState(null)}>Cancel</button>
                <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={confirmAction.onConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}