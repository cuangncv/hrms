import api from './client';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data)  => api.post('/auth/login', data),
  getMe: ()      => api.get('/auth/me'),
};

// ─── Employees ───────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:       (params) => api.get('/employees', { params }),
  getOne:       (id)     => api.get(`/employees/${id}`),
  getTrash:     ()       => api.get('/employees/trash'),
  create:       (data)   => api.post('/employees', data), 

  update:       (id, data) => { data.append('_method', 'PUT'); return api.post(`/employees/${id}`, data); },
  softDelete:   (id)     => api.delete(`/employees/${id}`),
  restore:      (id)     => api.patch(`/employees/${id}/restore`),
  permDelete:   (id)     => api.delete(`/employees/${id}/permanent`),
  exportExcel:  ()       => api.get('/employees/export-excel', { responseType: 'blob' }),
};

// ─── Leaves ──────────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll:  (params) => api.get('/leaves', { params }),
  create:  (data)   => api.post('/leaves', data),
  approve: (id, data) => api.patch(`/leaves/${id}/approve`, data),
  reject:  (id, data) => api.patch(`/leaves/${id}/reject`, data),
  remove:  (id)     => api.delete(`/leaves/${id}`),
};

// ─── KPI ─────────────────────────────────────────────────────────────────────
export const kpiAPI = {
  getAll:       (params) => api.get('/kpi', { params }),
  getByEmployee:(empId)  => api.get(`/kpi/employee/${empId}`),
  create:       (data)   => api.post('/kpi', data),
  update:       (id, data) => api.put(`/kpi/${id}`, data),
  remove:       (id)     => api.delete(`/kpi/${id}`),
};

// ─── Payroll ──────────────────────────────────────────────────────────────────
export const payrollAPI = {
  getAll:      (params) => api.get('/payroll', { params }),
  generate:    (data)   => api.post('/payroll/generate', data),
  update:      (id, data) => api.put(`/payroll/${id}`, data),
  exportExcel: (params) => api.get('/payroll/export-excel', { params, responseType: 'blob' }),
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll:   ()     => api.get('/announcements'),
  create:   (data) => api.post('/announcements', data),
  markRead: (id)   => api.patch(`/announcements/${id}/read`),
  remove:   (id)   => api.delete(`/announcements/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:  ()          => api.get('/users'),
  create:  (data)      => api.post('/users', data),
  update:  (id, data)  => api.put(`/users/${id}`, data),
  remove:  (id)        => api.delete(`/users/${id}`),
};
