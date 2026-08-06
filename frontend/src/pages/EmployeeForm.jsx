import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI } from '../api/services';
import { getInitials, getAssetUrl } from '../utils/helpers';

const DEPARTMENTS   = ['IT', 'Sales', 'Marketing', 'Kế toán', 'Nhân sự', 'Khác'];
const CONTRACT_TYPES = [{ v: 'official', l: 'Chính thức' }, { v: 'probation', l: 'Thử việc' }, { v: 'parttime', l: 'Part-time' }];

const defaultForm = { fullName: '', email: '', phone: '', birthday: '', gender: 'male', department: 'IT', position: 'Nhân viên', contractType: 'official', baseSalary: '', startDate: '', allowances: { lunch: 0, transport: 0, phone: 0 }, username: '', password: '' };

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const [form,     setForm]     = useState(defaultForm);
  const [avatar,   setAvatar]   = useState(null);
  const [preview,  setPreview]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    employeeAPI.getOne(id).then((res) => {
      const e = res.data;
      setForm({
        fullName: e.fullName, email: e.email, phone: e.phone || '',
        birthday: e.birthday ? e.birthday.split('T')[0] : '',
        gender: e.gender, department: e.department, position: e.position,
        contractType: e.contractType, baseSalary: e.baseSalary || '',
        startDate: e.startDate ? e.startDate.split('T')[0] : '',
        allowances: e.allowances || { lunch: 0, transport: 0, phone: 0 },
      });
      if (e.avatar) setPreview(getAssetUrl(e.avatar));
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setAllowance = (key, val) => setForm((f) => ({ ...f, allowances: { ...f.allowances, [key]: Number(val) } }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'allowances') fd.append('allowances', JSON.stringify(v));
        else fd.append(k, v);
      });
      if (avatar) fd.append('avatar', avatar);
      if (isEdit) await employeeAPI.update(id, fd);
      else        await employeeAPI.create(fd);
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu nhân viên');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới'}</h1>
          <p className="page-subtitle">{isEdit ? 'Chỉnh sửa thông tin nhân viên' : 'Điền thông tin để tạo hồ sơ nhân viên'}</p>
        </div>
        <button className="btn-outline-hrms" onClick={() => navigate('/employees')}><i className="bi bi-arrow-left" /> Quay lại</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Avatar */}
          <div className="form-card" style={{ textAlign: 'center' }}>
            <p className="form-section-title" style={{ marginTop: 0 }}>Ảnh đại diện</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {preview
                ? <img src={preview} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                : <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff' }}>{getInitials(form.fullName) || '?'}</div>
              }
              <label className="btn-outline-hrms" style={{ cursor: 'pointer' }}>
                <i className="bi bi-camera" /> Chọn ảnh
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          {/* Form fields */}
          <div className="form-card">
            <p className="form-section-title" style={{ marginTop: 0 }}>Thông tin cá nhân</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Họ và tên *</label>
                <input className="form-control-hrms" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input className="form-control-hrms" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Số điện thoại</label>
                <input className="form-control-hrms" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Ngày sinh</label>
                <input className="form-control-hrms" type="date" value={form.birthday} onChange={(e) => setField('birthday', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Giới tính</label>
                <select className="form-control-hrms" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {!isEdit && (
              <>
                <p className="form-section-title">Tài khoản đăng nhập</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label">Tên đăng nhập *</label>
                    <input className="form-control-hrms" value={form.username} onChange={(e) => setField('username', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Mật khẩu *</label>
                    <input className="form-control-hrms" type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <p className="form-section-title">Thông tin công việc</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Phòng ban *</label>
                <select className="form-control-hrms" value={form.department} onChange={(e) => setField('department', e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Chức vụ *</label>
                <input className="form-control-hrms" value={form.position} onChange={(e) => setField('position', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Loại hợp đồng</label>
                <select className="form-control-hrms" value={form.contractType} onChange={(e) => setField('contractType', e.target.value)}>
                  {CONTRACT_TYPES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Ngày vào làm</label>
                <input className="form-control-hrms" type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
              </div>
            </div>

            <p className="form-section-title">Lương & Phụ cấp</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Lương cơ bản (₫)</label>
                <input className="form-control-hrms" type="number" value={form.baseSalary} onChange={(e) => setField('baseSalary', e.target.value)} min="0" />
              </div>
              <div>
                <label className="form-label">PC Ăn trưa (₫)</label>
                <input className="form-control-hrms" type="number" value={form.allowances.lunch} onChange={(e) => setAllowance('lunch', e.target.value)} min="0" />
              </div>
              <div>
                <label className="form-label">PC Xăng xe (₫)</label>
                <input className="form-control-hrms" type="number" value={form.allowances.transport} onChange={(e) => setAllowance('transport', e.target.value)} min="0" />
              </div>
              <div>
                <label className="form-label">PC Điện thoại (₫)</label>
                <input className="form-control-hrms" type="number" value={form.allowances.phone} onChange={(e) => setAllowance('phone', e.target.value)} min="0" />
              </div>
            </div>

            {error && <div style={{ marginTop: 16, color: 'var(--danger)', fontSize: 13 }}><i className="bi bi-exclamation-triangle me-1" />{error}</div>}

            <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline-hrms" onClick={() => navigate('/employees')}>Hủy</button>
              <button type="submit" className="btn-primary-hrms" disabled={saving}>
                {saving ? <><i className="bi bi-hourglass-split me-1" /> Đang lưu...</> : <><i className="bi bi-check-circle me-1" /> {isEdit ? 'Cập nhật' : 'Tạo nhân viên'}</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
