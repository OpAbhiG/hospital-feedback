import React, { useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Admin({ feedbacks, hospitalConfig, updateConfig }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('newest');

  // Modals specific to Admin
  const [modalState, setModalState] = useState(null);
  const [newDept, setNewDept] = useState({ name: '', desc: '' });
  const [newQuestion, setNewQuestion] = useState({ dept: '', text: '' });
  const [confirmAction, setConfirmAction] = useState({ msg: '', onConfirm: null });

  // SAFE CHART DATA CALCULATION (Fixes the undefined labels error)
  const getChartData = () => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const trendLabels = [], trendData = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      trendLabels.push(monthNames[d.getMonth()]);
      trendData.push(feedbacks.filter(f => new Date(f.createdAt).getMonth() === d.getMonth() && new Date(f.createdAt).getFullYear() === d.getFullYear()).length);
    }

    return {
      lineData: {
        labels: trendLabels,
        datasets: [{
          label: 'Feedback Entries', data: trendData, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.15)', tension: 0.4, borderWidth: 3, fill: true, pointBackgroundColor: '#ffffff', pointBorderColor: '#2563eb', pointBorderWidth: 2, pointRadius: 4
        }]
      },
      pieData: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [
            feedbacks.filter(f => f.category === 'Positive').length || 1, 
            feedbacks.filter(f => f.category === 'Neutral').length || 1, 
            feedbacks.filter(f => f.category === 'Negative').length || 1
          ],
          backgroundColor: feedbacks.length > 0 ? ['#10b981', '#f59e0b', '#ef4444'] : ['#e2e8f0', '#e2e8f0', '#e2e8f0'],
          borderWidth: 0, hoverOffset: 4
        }]
      }
    };
  };

  const { lineData, pieData } = getChartData();

  // Sort and Filter
  let tableData = [...feedbacks];
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    tableData = tableData.filter(f => f.patientName.toLowerCase().includes(lower) || f.feedbackType.toLowerCase().includes(lower) || (f.feedbackText && f.feedbackText.toLowerCase().includes(lower)));
  }
  if (sortMode === 'newest') tableData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortMode === 'oldest') tableData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortMode === 'highest') tableData.sort((a, b) => b.rating - a.rating);
  if (sortMode === 'lowest') tableData.sort((a, b) => a.rating - b.rating);

  // Config Logic
  const saveDept = () => {
    if (!newDept.name.trim() || hospitalConfig[newDept.name]) return;
    updateConfig({ ...hospitalConfig, [newDept.name]: { icon: "bi-building-fill", desc: newDept.desc || "Healthcare Department", questions: ["Overall Satisfaction"] } });
    setModalState(null);
    setNewDept({ name: '', desc: '' });
  };

  const saveQuestion = () => {
    if (newQuestion.text.trim()) {
      const updated = { ...hospitalConfig };
      updated[newQuestion.dept].questions.push(newQuestion.text.trim());
      updateConfig(updated);
      setModalState(null);
      setNewQuestion({ dept: '', text: '' });
    }
  };

  const deleteConfigItem = (msg, action) => {
    setConfirmAction({ msg, onConfirm: () => { action(); setModalState(null); }});
    setModalState('confirm');
  };

  const exportCSV = () => {
    if (!feedbacks.length) return alert("No data");
    let csv = "Feedback ID,Date,Department,Patient Name,Mobile,Age,Gender,Rating,Sentiment,Comments\n" + feedbacks.map(f => `"${f.id}","${new Date(f.createdAt).toLocaleDateString()}","${f.feedbackType}","${f.patientName}","${f.mobile || ''}","${f.age}","${f.gender}","${f.rating}","${f.category}","${(f.feedbackText||'').replace(/"/g, '""').replace(/\n/g, ' ')}"`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `Hospital_Export.csv`; a.click();
  };

  return (
    <div className="container-fluid py-4 px-md-5 mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 mt-4">
        <div>
          <h2 className="fw-bold text-main m-0"><i className="bi bi-graph-up-arrow text-primary"></i> Analytics Dashboard</h2>
          <p className="text-muted m-0">Real-time overview of hospital performance</p>
        </div>
        <button onClick={exportCSV} className="btn btn-success rounded-pill px-4 shadow-sm fw-medium"><i className="bi bi-file-earmark-spreadsheet me-2"></i> Export CSV</button>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6"><div className="glass stat-card card p-4 h-100"><h6 className="text-muted fw-semibold mb-2">Total Feedbacks</h6><h2 className="text-primary fw-bold mb-0">{feedbacks.length}</h2></div></div>
        <div className="col-md-3 col-sm-6"><div className="glass stat-card card p-4 h-100 border-info"><h6 className="text-muted fw-semibold mb-2">Active Depts</h6><h2 className="text-info fw-bold mb-0">{Object.keys(hospitalConfig).length}</h2></div></div>
        <div className="col-md-3 col-sm-6"><div className="glass stat-card card p-4 h-100 border-success"><h6 className="text-muted fw-semibold mb-2">Positive Responses</h6><h2 className="text-success fw-bold mb-0">{feedbacks.filter(f=>f.category==='Positive').length}</h2></div></div>
        <div className="col-md-3 col-sm-6"><div className="glass stat-card card p-4 h-100 border-warning"><h6 className="text-muted fw-semibold mb-2">Avg. Rating</h6><h2 className="text-warning fw-bold mb-0">{feedbacks.length ? (feedbacks.reduce((s,f)=>s+f.rating,0)/feedbacks.length).toFixed(1) : '0.0'} <i className="bi bi-star-fill fs-4"></i></h2></div></div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="glass card p-4 h-100">
            <h5 className="mb-4 fw-bold text-main">Feedback Volume Trend</h5>
            <div className="chart-container"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass card p-4 h-100">
            <h5 className="mb-4 fw-bold text-main">Sentiment Analysis</h5>
            <div className="chart-container"><Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>
      </div>

      {/* Config Manager */}
      <div className="glass card p-4 mb-5 border-primary border-2">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <h5 className="mb-0 fw-bold text-primary"><i className="bi bi-gear-fill me-2"></i>Manage Departments & Questionnaires</h5>
          <button className="btn btn-primary rounded-pill fw-medium shadow-sm" onClick={() => setModalState('addDept')}><i className="bi bi-plus-circle me-1"></i> New Department</button>
        </div>
        <div className="row g-4">
          {Object.entries(hospitalConfig).map(([dept, data]) => (
            <div className="col-md-6 col-lg-4" key={dept}>
              <div className="card bg-light border-0 shadow-sm h-100 p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold m-0 text-main"><i className={`bi ${data.icon} text-primary me-2`}></i>{dept}</h6>
                  <button className="btn btn-sm btn-outline-danger border-0" onClick={() => deleteConfigItem(`Delete ${dept}?`, () => {const u={...hospitalConfig}; delete u[dept]; updateConfig(u);})}><i className="bi bi-trash-fill"></i></button>
                </div>
                <div className="mb-3">
                  {data.questions.map((q, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center bg-white border rounded p-2 mb-2 shadow-sm">
                      <span className="small fw-medium">{q}</span>
                      <button className="btn btn-sm text-danger border-0 py-0" onClick={() => deleteConfigItem(`Remove this question?`, () => {const u={...hospitalConfig}; u[dept].questions.splice(i,1); updateConfig(u);})}><i className="bi bi-x-circle-fill"></i></button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-sm btn-outline-primary w-100 mt-auto rounded-pill fw-medium bg-white" onClick={() => { setNewQuestion({dept, text:''}); setModalState('addQuestion'); }}><i className="bi bi-plus-circle me-1"></i> Add Question</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="glass card p-4 mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h5 className="mb-0 fw-bold text-main">Submissions Data</h5>
          <div className="d-flex gap-2 w-100" style={{maxWidth: '450px'}}>
            <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select className="form-select" style={{minWidth:'150px'}} value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="highest">Highest Rating</option><option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>Date</th><th>Dept</th><th>Patient</th><th>Rating</th><th>Sentiment</th><th className="w-25">Comments</th></tr></thead>
            <tbody>
              {tableData.map((f, i) => (
                <tr key={i}>
                  <td className="text-muted small">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge bg-primary-subtle text-primary rounded-pill">{f.feedbackType}</span></td>
                  <td className="fw-medium">{f.patientName}</td>
                  <td className="text-warning">{'★'.repeat(f.rating)}<span className="text-muted opacity-25">{'★'.repeat(5-f.rating)}</span></td>
                  <td><span className={`badge rounded-pill ${f.category === 'Positive' ? 'bg-success-subtle text-success' : f.category === 'Negative' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>{f.category}</span></td>
                  <td className="text-truncate" style={{maxWidth:'250px'}} title={f.feedbackText}>{f.feedbackText || <em className="text-muted">No comment</em>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modals */}
      {modalState && <div className="modal-backdrop fade show"></div>}
      {modalState === 'addDept' && (
        <div className="modal fade show d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content shadow-lg p-4"><h5 className="fw-bold mb-3">New Department</h5><input type="text" value={newDept.name} onChange={(e)=>setNewDept({...newDept, name:e.target.value})} className="form-control mb-3" placeholder="Name" /><input type="text" value={newDept.desc} onChange={(e)=>setNewDept({...newDept, desc:e.target.value})} className="form-control mb-4" placeholder="Description" /><div className="d-flex justify-content-end gap-2"><button className="btn btn-light rounded-pill px-4" onClick={()=>setModalState(null)}>Cancel</button><button className="btn btn-primary rounded-pill px-4" onClick={saveDept}>Save</button></div></div></div></div>
      )}
      {modalState === 'addQuestion' && (
        <div className="modal fade show d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content shadow-lg p-4"><h5 className="fw-bold mb-3">Add Question</h5><input type="text" value={newQuestion.text} onChange={(e)=>setNewQuestion({...newQuestion, text:e.target.value})} className="form-control mb-4" placeholder="Question text..." /><div className="d-flex justify-content-end gap-2"><button className="btn btn-light rounded-pill px-4" onClick={()=>setModalState(null)}>Cancel</button><button className="btn btn-primary rounded-pill px-4" onClick={saveQuestion}>Save</button></div></div></div></div>
      )}
      {modalState === 'confirm' && (
        <div className="modal fade show d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content shadow-lg text-center p-4"><i className="bi bi-exclamation-triangle-fill text-danger mb-3" style={{fontSize:'3rem'}}></i><h5 className="fw-bold mb-2">Are you sure?</h5><p className="text-muted small mb-4">{confirmAction.msg}</p><div className="d-flex justify-content-center gap-2"><button className="btn btn-light rounded-pill" onClick={()=>setModalState(null)}>Cancel</button><button className="btn btn-danger rounded-pill fw-bold" onClick={confirmAction.onConfirm}>Yes, Delete</button></div></div></div></div>
      )}
    </div>
  );
}