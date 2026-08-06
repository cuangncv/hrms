import { useEffect, useState } from 'react';
import { leaveAPI, employeeAPI } from '../api/services';
import { formatDate, leaveTypeLabel, leaveStatusLabel, leaveStatusClass } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const LEAVE_TYPES = [{ v: 'annual', l: 'Nghỉ phép năm' }, { v: 'sick', l: 'Nghỉ ốm' }, { v: 'wfh', l: 'Làm từ xa' }, { v: 'business', l: 'Công tác' }, { v: 'other', l: 'Khác' }];

const defaultForm = { employeeId: '', leaveType: 'annual', fromDate: '', toDate: '', reason: '' };

const LeaveRequests = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [leaves,    setLeaves]    = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(defaultForm);
  const [saving,    setSaving]    = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [reviewNote,   setReviewNote]   = useState({});

  const canManage = isAdmin || isManager;

  const fetchData = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus, limit: 50 } : { limit: 50 };
    leaveAPI.getAll(params).then((res) => setLeaves(res.data.leaves || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    if (canManage) employeeAPI.getAll({ limit: 200 }).then((r) => setEmployees(r.data.employees || []));
  }, [filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await leaveAPI.create(form); setShowForm(false); setForm(defaultForm); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Lỗi tạo đơn'); }
    setSaving(false);
  };

  const handleApprove = async (id) => {
    await leaveAPI.approve(id, { reviewNote: reviewNote[id] || '' }); fetchData();
  };
  const handleReject = async (id) => {
    const note = reviewNote[id]?.trim();
    if (!note) return alert('Vui lòng nhập lý do từ chối');
    await leaveAPI.reject(id, { reviewNote: note }); fetchData();
  };
  const handleDelete = async (id) => {
    if (!confirm('Xóa đơn này?')) return;
    await leaveAPI.remove(id); fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đơn xin nghỉ phép</h1>
          <p className="page-subtitle">Quản lý và xét duyệt đơn nghỉ</p>
        </div>
        <button className="btn-primary-hrms" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-circle" /> Tạo đơn mới
        </button>
      </div>

      {/* Form tạo đơn */}
      {showForm && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Đơn xin nghỉ mới</h6>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {canManage && (
                <div>
                  <label className="form-label">Nhân viên *</label>
                  <select className="form-control-hrms" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                    <option value="">-- Chọn NV --</option>
                    {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Loại đơn</label>
                <select className="form-control-hrms" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                  {LEAVE_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Từ ngày *</label>
                <input className="form-control-hrms" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Đến ngày *</label>
                <input className="form-control-hrms" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Lý do *</label>
                <textarea className="form-control-hrms" rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button type="button" className="btn-outline-hrms" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="btn-primary-hrms" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi đơn'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="filters-bar">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              borderColor: filterStatus === s ? 'var(--primary)' : 'var(--border)',
              background: filterStatus === s ? 'var(--primary)' : '#fff',
              color: filterStatus === s ? '#fff' : 'var(--text-muted)' }}>
            {s === '' ? 'Tất cả' : leaveStatusLabel(s)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Loại</th>
              <th>Từ ngày</th>
              <th>Đến ngày</th>
              <th>Số ngày</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              {canManage && <th>Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-calendar-x" /><p>Không có đơn nào</p></div></td></tr>
            ) : leaves.map((l) => (
              <tr key={l._id}>
                <td><div style={{ fontWeight: 600 }}>{l.employee?.fullName || '—'}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.employee?.department}</div></td>
                <td>{leaveTypeLabel(l.leaveType)}</td>
                <td>{formatDate(l.fromDate)}</td>
                <td>{formatDate(l.toDate)}</td>
                <td style={{ textAlign: 'center' }}><strong>{l.days}</strong></td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                <td><span className={`badge-status ${leaveStatusClass(l.status)}`}>{leaveStatusLabel(l.status)}</span></td>
                {canManage && (
                  <td>
                    {l.status === 'pending' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <input placeholder="Ghi chú (bắt buộc nếu từ chối)..." style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }} value={reviewNote[l._id] || ''} onChange={(e) => setReviewNote((n) => ({ ...n, [l._id]: e.target.value }))} />
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleApprove(l._id)} style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 0', color: '#15803d', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>✅ Duyệt</button>
                          <button onClick={() => handleReject(l._id)} style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 0', color: '#b91c1c', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>❌ Từ chối</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {l.reviewNote && <div>📝 {l.reviewNote}</div>}
                        <button onClick={() => handleDelete(l._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 12, padding: 0, marginTop: 4 }}><i className="bi bi-trash" /> Xóa</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequests;
