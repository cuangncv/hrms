import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const Sidebar = ({ unread }) => {
  const { user, logout, isAdmin, isManager } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Mini HRMS</h1>
        <span>Quản lý Nhân sự</span>
      </div>

      <nav className="sidebar-nav">
        {(isAdmin || isManager) && (
          <>
            <div className="nav-section-label">Tổng quan</div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <i className="bi bi-grid-1x2-fill" /> Dashboard
            </NavLink>
          </>
        )}

        <div className="nav-section-label">Nhân sự</div>
        {(isAdmin || isManager) && (
          <NavLink to="/employees" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="bi bi-people-fill" /> Nhân viên
          </NavLink>
        )}
        <NavLink to="/leaves" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-calendar-check-fill" /> Đơn xin nghỉ
        </NavLink>
        {(isAdmin || isManager) && (
          <NavLink to="/kpi" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <i className="bi bi-star-fill" /> Đánh giá KPI
          </NavLink>
        )}
        <NavLink to="/payroll" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-cash-stack" /> Bảng lương
        </NavLink>

        <div className="nav-section-label">Hệ thống</div>
        <NavLink to="/announcements" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-bell-fill" /> Thông báo
          {unread > 0 && <span className="badge-count">{unread}</span>}
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/trash" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <i className="bi bi-trash3-fill" /> Thùng rác
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <i className="bi bi-shield-fill" /> Quản lý User
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials(user?.fullName)}</div>
          <div>
            <div className="sidebar-user-name">{user?.fullName}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="btn-logout" onClick={logout} title="Đăng xuất">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
