import { useEffect, useState } from 'react';
import { payrollAPI } from '../api/services';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { downloadBlob } from '../utils/helpers';

const now = new Date();

const Payroll = () => {
  const { isAdmin } = useAuth();
  const [payrolls,  setPayrolls]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [generating,setGenerating]= useState(false);
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [year,      setYear]      = useState(now.getFullYear());

  const fetchData = () => {
    setLoading(true);
    payrollAPI.getAll({ month, year, limit: 50 }).then((r) => setPayrolls(r.data.payrolls || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await payrollAPI.generate({ month, year });
      alert(res.data.message);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi tạo bảng lương'); }
    setGenerating(false);
  };

  const handleExport = async () => {
    const res = await payrollAPI.exportExcel({ month, year });
    downloadBlob(res.data, `bang_luong_T${month}_${year}.xlsx`);
  };

  const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bảng lương</h1>
          <p className="page-subtitle">Tháng {month}/{year} — {payrolls.length} phiếu lương</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="filter-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <select className="filter-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
          {isAdmin && (
            <>
              <button className="btn-primary-hrms" onClick={handleGenerate} disabled={generating}>
                <i className="bi bi-plus-circle" /> {generating ? 'Đang tạo...' : 'Tạo phiếu còn thiếu'}
              </button>
              <button className="btn-outline-hrms" onClick={handleExport} disabled={payrolls.length === 0}>
                <i className="bi bi-file-earmark-excel" /> Xuất Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tổng chi phí */}
      {payrolls.length > 0 && (
        <div className="stat-card" style={{ marginBottom: 20, display: 'inline-flex' }}>
          <div className="stat-icon blue"><i className="bi bi-cash-stack" /></div>
          <div>
            <div className="stat-label">Tổng chi phí lương tháng {month}/{year}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(totalNet)}</div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th style={{ textAlign: 'right' }}>Lương CB</th>
              <th style={{ textAlign: 'right' }}>PC Ăn trưa</th>
              <th style={{ textAlign: 'right' }}>PC Xăng xe</th>
              <th style={{ textAlign: 'right' }}>PC ĐT</th>
              <th style={{ textAlign: 'right' }}>Gross</th>
              <th style={{ textAlign: 'right' }}>Khấu trừ</th>
              <th style={{ textAlign: 'right' }}>Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></td></tr>
            ) : payrolls.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <i className="bi bi-cash-coin" />
                  <p>Chưa có bảng lương tháng {month}/{year}</p>
                  {isAdmin && <p style={{ fontSize: 12, marginTop: 8 }}>Nhấn <b>"Tạo phiếu còn thiếu"</b> để tự động tính lương cho toàn bộ nhân viên</p>}
                </div>
              </td></tr>
            ) : payrolls.map((p) => (
              <tr key={p._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.employee?.fullName || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.employee?.employeeId}</div>
                </td>
                <td>{p.employee?.department}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.baseSalary)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.allowances?.lunch)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.allowances?.transport)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.allowances?.phone)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.grossSalary)}</td>
                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(p.deductions)}</td>
                <td style={{ textAlign: 'right' }}><strong style={{ color: 'var(--success)', fontSize: 14 }}>{formatCurrency(p.netSalary)}</strong></td>
              </tr>
            ))}
          </tbody>
          {payrolls.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={8} style={{ textAlign: 'right', fontWeight: 700, padding: '12px 16px', background: '#f8fafc' }}>Tổng thực nhận:</td>
                <td style={{ textAlign: 'right', padding: '12px 16px', background: '#f8fafc' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{formatCurrency(totalNet)}</strong>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default Payroll;
