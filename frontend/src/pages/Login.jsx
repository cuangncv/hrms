import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);
    if (result.ok) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>🏢 Mini HRMS</h1>
          <p>Hệ thống Quản lý Nhân sự</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="login-label">Tên đăng nhập</label>
            <input
              className="login-input"
              placeholder="Nhập username..."
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="login-label">Mật khẩu</label>
            <input
              type="password"
              className="login-input"
              placeholder="Nhập mật khẩu..."
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#fca5a5', fontSize: 13 }}>
              <i className="bi bi-exclamation-triangle me-2" />{error}
            </div>
          )}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><i className="bi bi-hourglass-split me-2" />Đang đăng nhập...</> : <><i className="bi bi-box-arrow-in-right me-2" />Đăng nhập</>}
          </button>
        </form>
        <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 20 }}>
          <p style={{ color: '#475569', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>Tài khoản demo</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['admin','admin123'], ['manager','manager123'], ['employee','emp123']].map(([u,p]) => (
              <button key={u} onClick={() => setForm({ username: u, password: p })}
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', fontSize: 11.5, cursor: 'pointer' }}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
