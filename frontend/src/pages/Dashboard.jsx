import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { dashboardAPI } from '../api/services';
import { formatCurrency } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  const cards = [
    { label: 'Tổng nhân viên',       value: stats?.totalEmployees ?? 0, icon: 'bi-people-fill',         cls: 'blue'   },
    { label: 'Đang nghỉ hôm nay',    value: stats?.onLeaveToday   ?? 0, icon: 'bi-calendar-x-fill',     cls: 'yellow' },
    { label: 'Nhân viên mới (tháng)',value: stats?.newThisMonth   ?? 0, icon: 'bi-person-plus-fill',    cls: 'green'  },
    { label: 'Đơn chờ duyệt',        value: stats?.pendingLeaves  ?? 0, icon: 'bi-hourglass-split',     cls: 'red'    },
  ];

  const pieData = {
    labels:   stats?.departmentStats?.map((d) => d.department) || [],
    datasets: [{ data: stats?.departmentStats?.map((d) => d.count) || [], backgroundColor: PIE_COLORS, borderWidth: 0 }],
  };

  const barData = {
    labels: stats?.leaveByMonth?.map((l) => l.month) || [],
    datasets: [{
      label: 'Đơn xin nghỉ',
      data: stats?.leaveByMonth?.map((l) => l.count) || [],
      backgroundColor: 'rgba(59,130,246,.75)',
      borderRadius: 8,
    }],
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Tổng quan tình hình nhân sự</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className={`stat-icon ${c.cls}`}><i className={`bi ${c.icon}`} /></div>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 20 }}>
        <div className="card">
          <div className="card-body">
            <h6 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>
              <i className="bi bi-pie-chart-fill me-2 text-primary" />Nhân sự theo phòng ban
            </h6>
            {stats?.departmentStats?.length > 0
              ? <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } } }} />
              : <div className="empty-state"><i className="bi bi-bar-chart" /><p>Chưa có dữ liệu</p></div>
            }
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h6 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>
              <i className="bi bi-bar-chart-fill me-2 text-primary" />Đơn xin nghỉ 6 tháng gần nhất
            </h6>
            {stats?.leaveByMonth?.length > 0
              ? <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
              : <div className="empty-state"><i className="bi bi-calendar2-x" /><p>Chưa có dữ liệu</p></div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
