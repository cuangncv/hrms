import { useEffect, useState } from 'react';
import { employeeAPI } from '../api/services';
import { formatDate, getInitials, getAssetUrl } from '../utils/helpers';

const Trash = () => {
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchData = () => {
    setLoading(true);
    employeeAPI.getTrash()
      .then((r) => setEmployees(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRestore = async (id) => {
    await employeeAPI.restore(id); fetchData();
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm('⚠️ Xóa vĩnh viễn nhân viên này? Hành động KHÔNG thể hoàn tác!')) return;
    await employeeAPI.permDelete(id); fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thùng rác</h1>
          <p className="page-subtitle">Nhân viên đã nghỉ việc — {employees.length} người</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Mã NV</th>
              <th>Phòng ban</th>
              <th>Ngày xóa</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><i className="bi bi-trash3" /><p>Thùng rác trống</p></div></td></tr>
            ) : employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.75 }}>
                    {emp.avatar
                      ? <img src={getAssetUrl(emp.avatar)} alt="" className="emp-avatar" style={{ filter: 'grayscale(100%)' }} />
                      : <div className="emp-avatar-placeholder" style={{ background: '#94a3b8' }}>{getInitials(emp.fullName)}</div>
                    }
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{emp.employeeId}</code></td>
                <td>{emp.department}</td>
                <td>{formatDate(emp.deletedAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleRestore(emp._id)}
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 12px', color: '#15803d', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                      <i className="bi bi-arrow-counterclockwise me-1" />Khôi phục
                    </button>
                    <button onClick={() => handlePermanentDelete(emp._id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 12px', color: '#b91c1c', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                      <i className="bi bi-trash-fill me-1" />Xóa vĩnh viễn
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Trash;
