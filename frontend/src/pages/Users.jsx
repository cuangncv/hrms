import { useEffect, useState } from 'react';
import { userAPI } from '../api/services';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const defaultForm = { username: '', password: '', fullName: '', role: 'employee' };

const Users = () => {
  const { user: me } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(defaultForm);
  const [saving,   setSaving]   = useState(false);

  const fetchData = () => {
    setLoading(true);
    userAPI.getAll()
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditId(null); setForm(defaultForm); setShowForm(true); };
  const openEdit   = (u)  => { setEditId(u._id); setForm({ username: u.username, password: '', fullName: u.fullName, role: u.role }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (editId) await userAPI.update(editId, data);
      else        await userAPI.create(data);
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi lưu user'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    await userAPI.remove(id); fetchData();
  };

  const roleBadge = (role) => ({ admin: '#eff6ff|#1d4ed8', manager: '#fef9c3|#a16207', employee: '#f0fdf4|#15803d' }[role] || '#f3f4f6|#374151');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Tài khoản</h1>
          <p className="page-subtitle">Tổng: {users.length} tài khoản</p>
        </div>
        <button className="btn-primary-hrms" onClick={openCreate}><i className="bi bi-person-plus" /> Thêm tài khoản</button>
      </div>

      {showForm && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>{editId ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h6>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label className="form-label">Họ và tên *</label>
                <input className="form-control-hrms" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Username *</label>
                <input className="form-control-hrms" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editId} />
              </div>
              <div>
                <label className="form-label">{editId ? 'Mật khẩu mới (để trống = không đổi)' : 'Mật khẩu *'}</label>
                <input className="form-control-hrms" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} />
              </div>
              <div>
                <label className="form-label">Vai trò</label>
                <select className="form-control-hrms" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="btn-outline-hrms" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="btn-primary-hrms" disabled={saving}>{saving ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Tạo tài khoản')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="hrms-table">
          <thead>
            <tr><th>Họ và tên</th><th>Username</th><th>Vai trò</th><th>Ngày tạo</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></td></tr>
            ) : users.map((u) => {
              const [bg, color] = roleBadge(u.role).split('|');
              return (
                <tr key={u._id}>
                  <td><strong>{u.fullName}</strong>{u._id === me._id && <span style={{ marginLeft: 6, fontSize: 11, background: '#eff6ff', color: '#1d4ed8', borderRadius: 10, padding: '1px 6px' }}>Bạn</span>}</td>
                  <td><code>{u.username}</code></td>
                  <td><span className="badge-status" style={{ background: bg, color }}>{u.role}</span></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--warning)' }}><i className="bi bi-pencil" /></button>
                      {u._id !== me._id && (
                        <button onClick={() => handleDelete(u._id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)' }}><i className="bi bi-trash" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
