import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../api/services';
import { formatDate, contractTypeLabel, getInitials, downloadBlob, getAssetUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS   = ['', 'IT', 'Sales', 'Marketing', 'Kế toán', 'Nhân sự', 'Khác'];
const CONTRACT_TYPES = [{ v: '', l: 'Tất cả HĐ' }, { v: 'official', l: 'Chính thức' }, { v: 'probation', l: 'Thử việc' }, { v: 'parttime', l: 'Part-time' }];

const EmployeeList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [employees,  setEmployees]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);

  const [params, setParams] = useState({ search: '', department: '', contractType: '', page: 1, limit: 10, sortField: 'createdAt', sortOrder: 'desc' });

  const fetchData = useCallback(() => {
    setLoading(true);
    employeeAPI.getAll(params)
      .then((res) => { setEmployees(res.data.employees); setTotal(res.data.total); setTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm('Chuyển nhân viên vào thùng rác?')) return;
    await employeeAPI.softDelete(id);
    fetchData();
  };

  const handleExport = async () => {
    const res = await employeeAPI.exportExcel();
    downloadBlob(res.data, 'danh_sach_nhan_vien.xlsx');
  };

  const setParam = (key, val) => setParams((p) => ({ ...p, [key]: val, page: 1 }));
  const contractBadge = (t) => ({ official: 'badge-official', probation: 'badge-probation', parttime: 'badge-parttime' }[t] || '');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Nhân viên</h1>
          <p className="page-subtitle">Tổng: {total} nhân viên</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button className="btn-outline-hrms" onClick={handleExport}><i className="bi bi-file-earmark-excel" /> Xuất Excel</button>
              <button className="btn-primary-hrms" onClick={() => navigate('/employees/new')}><i className="bi bi-person-plus" /> Thêm NV</button>
            </>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <input className="filter-input" placeholder="🔍 Tìm theo tên, email, mã NV..." value={params.search} onChange={(e) => setParam('search', e.target.value)} />
        <select className="filter-select" value={params.department} onChange={(e) => setParam('department', e.target.value)}>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'Tất cả phòng ban'}</option>)}
        </select>
        <select className="filter-select" value={params.contractType} onChange={(e) => setParam('contractType', e.target.value)}>
          {CONTRACT_TYPES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
        <select className="filter-select" value={params.sortField + '_' + params.sortOrder} onChange={(e) => { const [f, o] = e.target.value.split('_'); setParams((p) => ({ ...p, sortField: f, sortOrder: o })); }}>
          <option value="createdAt_desc">Mới nhất</option>
          <option value="fullName_asc">Tên A→Z</option>
          <option value="baseSalary_desc">Lương cao nhất</option>
          <option value="startDate_asc">Vào làm sớm nhất</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Mã NV</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Hợp đồng</th>
              <th>Ngày vào làm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><i className="bi bi-people" /><p>Không tìm thấy nhân viên</p></div></td></tr>
            ) : employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {emp.avatar
                      ? <img src={getAssetUrl(emp.avatar)} alt="" className="emp-avatar" />
                      : <div className="emp-avatar-placeholder">{getInitials(emp.fullName)}</div>
                    }
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{emp.employeeId}</code></td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td><span className={`badge-status ${contractBadge(emp.contractType)}`}>{contractTypeLabel(emp.contractType)}</span></td>
                <td>{formatDate(emp.startDate)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate(`/employees/${emp._id}`)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--primary)' }} title="Xem chi tiết"><i className="bi bi-eye" /></button>
                    {isAdmin && <button onClick={() => navigate(`/employees/${emp._id}/edit`)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--warning)' }} title="Chỉnh sửa"><i className="bi bi-pencil" /></button>}
                    {isAdmin && <button onClick={() => handleDelete(emp._id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)' }} title="Xóa"><i className="bi bi-trash" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-bar">
          <span className="page-info">Hiển thị {employees.length} / {total} nhân viên</span>
          <div className="page-btns">
            <button className="page-btn" disabled={params.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}><i className="bi bi-chevron-left" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === params.page ? 'active' : ''}`} onClick={() => setParams((prev) => ({ ...prev, page: p }))}>{p}</button>
            ))}
            <button className="page-btn" disabled={params.page >= totalPages} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}><i className="bi bi-chevron-right" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
