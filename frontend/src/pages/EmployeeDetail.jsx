import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI, kpiAPI, leaveAPI } from '../api/services';
import { formatDate, formatCurrency, contractTypeLabel, leaveTypeLabel, leaveStatusLabel, leaveStatusClass, rankClass, getInitials, getAssetUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const [emp,    setEmp]    = useState(null);
  const [kpis,   setKpis]   = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tab,    setTab]    = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeAPI.getOne(id),
      kpiAPI.getByEmployee(id),
      leaveAPI.getAll({ employeeId: id, limit: 50 }),
    ]).then(([eRes, kRes, lRes]) => {
      setEmp(eRes.data);
      setKpis(kRes.data);
      setLeaves(lRes.data.leaves || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner-border text-primary" /></div>;
  if (!emp)    return <div className="empty-state"><i className="bi bi-person-x" /><p>Không tìm thấy nhân viên</p></div>;

  const tabs = [{ k: 'info', label: 'Thông tin', icon: 'bi-person' }, { k: 'kpi', label: `KPI (${kpis.length})`, icon: 'bi-star' }, { k: 'leaves', label: `Đơn nghỉ (${leaves.length})`, icon: 'bi-calendar-check' }];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ nhân viên</h1>
          <p className="page-subtitle">Chi tiết thông tin và lịch sử</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && <button className="btn-outline-hrms" onClick={() => navigate(`/employees/${id}/edit`)}><i className="bi bi-pencil" /> Chỉnh sửa</button>}
          <button className="btn-outline-hrms" onClick={() => navigate('/employees')}><i className="bi bi-arrow-left" /> Quay lại</button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {emp.avatar
            ? <img src={getAssetUrl(emp.avatar)} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>{getInitials(emp.fullName)}</div>
          }
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{emp.fullName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emp.position} · {emp.department}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{emp.employeeId}</code>
              <span className={`badge-status badge-${emp.contractType}`}>{contractTypeLabel(emp.contractType)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Lương cơ bản</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(emp.baseSalary)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: tab === t.k ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t.k ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2 }}>
            <i className={`bi ${t.icon} me-1`} />{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Thông tin */}
      {tab === 'info' && (
        <div className="form-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Email', emp.email], ['SĐT', emp.phone || '—'], ['Ngày sinh', formatDate(emp.birthday)], ['Giới tính', { male: 'Nam', female: 'Nữ', other: 'Khác' }[emp.gender]],
              ['Phòng ban', emp.department], ['Chức vụ', emp.position], ['Ngày vào làm', formatDate(emp.startDate)],
              ['PC Ăn trưa', formatCurrency(emp.allowances?.lunch)], ['PC Xăng xe', formatCurrency(emp.allowances?.transport)], ['PC Điện thoại', formatCurrency(emp.allowances?.phone)],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: KPI */}
      {tab === 'kpi' && (
        <div>
          {kpis.length === 0 ? <div className="empty-state"><i className="bi bi-star" /><p>Chưa có phiếu đánh giá</p></div> : (
            <div className="timeline">
              {kpis.map((k) => (
                <div key={k._id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-date">{k.period.quarter} / {k.period.year} — Người đánh giá: {k.reviewer?.fullName}</div>
                    <div className="timeline-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Điểm TB: <strong>{k.avgScore}</strong> / 5</span>
                      <span className={`badge-status ${rankClass(k.rank)}`}>{k.rank}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                      <span>Thái độ: <b>{k.scores?.attitude}</b></span>
                      <span>Năng lực: <b>{k.scores?.skill}</b></span>
                      <span>Kết quả: <b>{k.scores?.result}</b></span>
                    </div>
                    {k.comment && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>{k.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Đơn nghỉ */}
      {tab === 'leaves' && (
        <div>
          {leaves.length === 0 ? <div className="empty-state"><i className="bi bi-calendar2-x" /><p>Chưa có đơn xin nghỉ</p></div> : (
            <div className="timeline">
              {leaves.map((l) => (
                <div key={l._id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }[l.status] }} />
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(l.fromDate)} → {formatDate(l.toDate)} ({l.days} ngày)</div>
                    <div className="timeline-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{leaveTypeLabel(l.leaveType)}</span>
                      <span className={`badge-status ${leaveStatusClass(l.status)}`}>{leaveStatusLabel(l.status)}</span>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{l.reason}</p>
                    {l.reviewNote && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Ghi chú: {l.reviewNote}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
