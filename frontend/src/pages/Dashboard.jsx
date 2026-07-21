import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodayStats } from '../services/appointmentService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayStats()
      .then((res) => {
        const appointments = res.data;
        setStats({
          total: appointments.length,
          scheduled: appointments.filter((a) => a.status === 'scheduled').length,
          arrived: appointments.filter((a) => a.status === 'arrived').length,
          cancelled: appointments.filter((a) => a.status === 'cancelled').length,
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="dash-title">Welcome back, {user?.name}</h1>
      <p className="dash-subtitle">Here's today's overview.</p>

      {loading ? (
        <p className="dash-status">Loading…</p>
      ) : stats ? (
        <div className="dash-stats">
          <div className="dash-stat-card">
            <span className="dash-stat-value">{stats.total}</span>
            <span className="dash-stat-label">Today's Appointments</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-value">{stats.scheduled}</span>
            <span className="dash-stat-label">Scheduled</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-value">{stats.arrived}</span>
            <span className="dash-stat-label">Arrived</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-value">{stats.cancelled}</span>
            <span className="dash-stat-label">Cancelled</span>
          </div>
        </div>
      ) : (
        <p className="dash-status">Could not load today's stats.</p>
      )}
    </div>
  );
};

export default Dashboard;