import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back, {user?.name}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
        Here's what's happening today.
      </p>
      {/* Real widgets (today's appointment count, etc.) come once the Appointment List page exists */}
    </div>
  );
};

export default Dashboard;