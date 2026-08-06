import { useEffect, useState } from 'react';
import { kpiAPI, employeeAPI } from '../api/services';
import { formatDate, rankClass } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const defaultForm = { employeeId: '', period: { quarter: 'Q1', year: new Date().getFullYear() }, scores: { attitude: 3, skill: 3, result: 3 }, comment: '' };

const StarInput = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}
        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: s <= value ? '#f59e0b' : '#d1d5db', padding: 0 }}>
        ★
      </button>
    ))}
  </div>
);

const KpiReviews = () => {
  const { isAdmin, isManager } = useAuth();
  const canManage = isAdmin || isManager;

  const [reviews,   setReviews]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(defaultForm);
  const [saving,    setSaving]    = useState(false);
  const [filterEmp, setFilterEmp] = useState('');
  const [filterQ,   setFilterQ]   = useState('');
  const [filterY,   setFilterY]   = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (filterEmp) params.employeeId = filterEmp;
    if (filterQ)   params.quarter    = filterQ;
    if (filterY)   params.year       = filterY;
    kpiAPI.getAll({ ...params, limit: 50 }).then((r) => setReviews(r.data.reviews || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    if (canManage) employeeAPI.getAll({ limit: 200 }).then((r) => setEmployees(r.data.employees || []));
  }, [filterEmp, filterQ, filterY]);

  const setScore = (key, val) => setForm((f) => ({ ...f, scores: { ...f.scores, [key]: val } }));
  const setPeriod = (key, val) => setForm((f) => ({ ...f, period: { ...f.period, [key]: val } }));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await kpiAPI.create(form); setShowForm(false); setForm(defaultForm); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Lỗi tạo phiếu KPI'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa phiếu đánh giá này?')) return;
    await kpiAPI.remove(id); fetchData();
  };

  const renderStars = (score) => '★'.repeat(score) + '☆'.repeat(5 - score);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đánh giá KPI</h1>
          <p className="page-subtitle">Phiếu đánh giá hiệu suất nhân viên theo kỳ</p>
        </div>
        {canManage && (
          <button className="btn-primary-hrms" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-plus-circle" /> Tạo phiếu đánh giá
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Phiếu đánh giá KPI mới</h6>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Nhân viên *</label>
                <select className="form-control-hrms" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Quý</label>
                <select className="form-control-hrms" value={form.period.quarter} onChange={(e) => setPeriod('quarter', e.target.value)}>
                  {QUARTERS.map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Năm</label>
                <input className="form-control-hrms" type="number" value={form.period.year} onChange={(e) => setPeriod('year', Number(e.target.value))} min="2020" max="2030" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[['attitude', 'Thái độ & Kỷ luật'], ['skill', 'Năng lực chuyên môn'], ['result', 'Kết quả công việc']].map(([k, label]) => (
                <div key={k}>
                  <label className="form-label">{label}</label>
                  <StarInput value={form.scores[k]} onChange={(v) => setScore(k, v)} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Nhận xét tổng</label>
              <textarea className="form-control-hrms" rows={2} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Nhận xét chung về nhân viên trong kỳ đánh giá..." />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline-hrms" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="btn-primary-hrms" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu phiếu'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        {canManage && (
          <select className="filter-select" value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
            <option value="">Tất cả nhân viên</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}
          </select>
        )}
        <select className="filter-select" value={filterQ} onChange={(e) => setFilterQ(e.target.value)}>
          <option value="">Tất cả quý</option>
          {QUARTERS.map((q) => <option key={q}>{q}</option>)}
        </select>
        <select className="filter-select" value={filterY} onChange={(e) => setFilterY(e.target.value)}>
          <option value="">Tất cả năm</option>
          {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state"><i className="bi bi-star" /><p>Không tìm thấy phiếu đánh giá</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.employee?.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.employee?.department}</div>
                  </div>
                  <span className={`badge-status ${rankClass(r.rank)}`}>{r.rank}</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.period?.quarter} / {r.period?.year}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{r.avgScore} / 5</span>
                  </div>
                  {[['attitude', 'Thái độ'], ['skill', 'Năng lực'], ['result', 'Kết quả']].map(([k, l]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 3 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                      <span style={{ color: '#f59e0b' }}>{renderStars(r.scores?.[k] || 0)}</span>
                    </div>
                  ))}
                </div>
                {r.comment && <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>"{r.comment}"</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--text-muted)' }}>
                  <span>Người đánh giá: {r.reviewer?.fullName}</span>
                  {canManage && <button onClick={() => handleDelete(r._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}><i className="bi bi-trash" /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KpiReviews;
