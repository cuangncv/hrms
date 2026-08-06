import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout     from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import EmployeeList   from './pages/EmployeeList';
import EmployeeForm   from './pages/EmployeeForm';
import EmployeeDetail from './pages/EmployeeDetail';
import LeaveRequests  from './pages/LeaveRequests';
import KpiReviews     from './pages/KpiReviews';
import Payroll        from './pages/Payroll';
import Announcements  from './pages/Announcements';
import Trash          from './pages/Trash';
import Users          from './pages/Users';
import { useAuth }   from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const defaultHome = user?.role === 'employee' ? '/leaves' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={defaultHome} replace />} />
        <Route path="dashboard"            element={<ProtectedRoute managerOrAdmin><Dashboard /></ProtectedRoute>} />
        <Route path="employees"            element={<ProtectedRoute managerOrAdmin><EmployeeList /></ProtectedRoute>} />
        <Route path="employees/new"        element={<ProtectedRoute adminOnly><EmployeeForm /></ProtectedRoute>} />
        <Route path="employees/:id"        element={<EmployeeDetail />} />
        <Route path="employees/:id/edit"   element={<ProtectedRoute adminOnly><EmployeeForm /></ProtectedRoute>} />
        <Route path="leaves"               element={<LeaveRequests />} />
        <Route path="kpi"                  element={<ProtectedRoute managerOrAdmin><KpiReviews /></ProtectedRoute>} />
        <Route path="payroll"              element={<Payroll />} />
        <Route path="announcements"        element={<Announcements />} />
        <Route path="trash"                element={<ProtectedRoute adminOnly><Trash /></ProtectedRoute>} />
        <Route path="users"                element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
