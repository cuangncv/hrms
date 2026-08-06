import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { announcementAPI } from '../api/services';
import { formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const Announcements = () => {
  const { isAdmin } = useAuth();
  const { refreshUnread } = useOutletContext();
  const [list,     setList]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ title: '', content: '' });
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchData = () => {
    setLoading(true);
    announcementAPI.getAll().then((r) => setList(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await announcementAPI.create(form); setShowForm(false); setForm({ title: '', content: '' }); fetchData(); refreshUnread(); }
    catch (err) { alert(err.response?.data?.message || 'Lỗi tạo thông báo'); }
    setSaving(false);
  };

  const handleOpen = async (ann) => {
    setExpanded(expanded === ann._id ? null : ann._id);
    if (!ann.isRead) {
      await announcementAPI.markRead(ann._id).catch(() => {});
      setList((prev) => prev.map((a) => a._id === ann._id ? { ...a, isRead: true } : a));
      refreshUnread();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa thông báo này?')) return;
    await announcementAPI.remove(id); fetchData(); refreshUnread();
  };

  const unread = list.filter((a) => !a.isRead).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thông báo nội bộ</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} thông báo chưa đọc` : 'Tất cả đã đọc'}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary-hrms" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-megaphone" /> Đăng thông báo
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Thông báo mới</h6>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Tiêu đề *</label>
              <input className="form-control-hrms" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Tiêu đề thông báo..." />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Nội dung *</label>
              <textarea className="form-control-hrms" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required placeholder="Nội dung thông báo..." />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline-hrms" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="btn-primary-hrms" disabled={saving}>{saving ? 'Đang đăng...' : 'Đăng thông báo'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner-border text-primary" /></div>
      ) : list.length === 0 ? (
        <div className="empty-state"><i className="bi bi-bell-slash" /><p>Chưa có thông báo nào</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((ann) => (
            <div key={ann._id} className="card" style={{ border: ann.isRead ? '1px solid var(--border)' : '1.5px solid var(--primary)', cursor: 'pointer' }}
              onClick={() => handleOpen(ann)}>
              <div className="card-body" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {!ann.isRead && <span style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />}
                      <h6 style={{ margin: 0, fontWeight: ann.isRead ? 600 : 700, color: ann.isRead ? 'var(--text-main)' : 'var(--primary)' }}>{ann.title}</h6>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {ann.createdByUser?.fullName} · {formatDateTime(ann.createdAt)}
                    </div>
                    {expanded === ann._id && (
                      <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--text-main)' }}>{ann.content}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <i className={`bi bi-chevron-${expanded === ann._id ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }} />
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(ann._id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
