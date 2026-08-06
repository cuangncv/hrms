// Format ngày giờ
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Format tiền VNĐ
export const formatCurrency = (amount) => {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Loại hợp đồng
export const contractTypeLabel = (type) => ({
  official:  'Chính thức',
  probation: 'Thử việc',
  parttime:  'Part-time',
}[type] || type);

// Loại đơn nghỉ
export const leaveTypeLabel = (type) => ({
  annual:   'Nghỉ phép năm',
  sick:     'Nghỉ ốm',
  wfh:      'Làm từ xa',
  business: 'Công tác',
  other:    'Khác',
}[type] || type);

// Trạng thái đơn
export const leaveStatusLabel = (s) => ({ pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }[s] || s);
export const leaveStatusClass = (s) => ({ pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }[s] || '');

// Rank KPI
export const rankClass = (rank) => ({
  'Xuất sắc':  'badge-rank-excellent',
  'Tốt':       'badge-rank-good',
  'Khá':       'badge-rank-fair',
  'Trung bình':'badge-rank-average',
  'Yếu':       'badge-rank-poor',
}[rank] || '');

// Initials từ tên
export const getInitials = (name = '') => name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();

// Ghép domain backend vào đường dẫn tương đối (vd avatar) — cần khi FE/BE khác domain
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
export const getAssetUrl = (path) => {
  if (!path) return path;
  if (/^(https?:|blob:)/i.test(path)) return path; // đã là URL đầy đủ (vd blob: preview)
  return API_ORIGIN + path;
};

// Tải file blob
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
