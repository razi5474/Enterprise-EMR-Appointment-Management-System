import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['super_admin', 'receptionist', 'doctor'] },
  { path: '/scheduler', label: 'Scheduler', roles: ['super_admin', 'receptionist', 'doctor'] },
  { path: '/appointments', label: 'Appointments', roles: ['super_admin', 'receptionist', 'doctor'] },
  { path: '/doctors', label: 'Doctors', roles: ['super_admin'] },
  { path: '/audit-log', label: 'Audit Log', roles: ['super_admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">Enterprise EMR</div>
        <nav className="app-sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-user">
            <span className="app-user-name">{user?.name}</span>
            <span className="app-user-role">{user?.role?.replace('_', ' ')}</span>
          </div>
          <button className="app-logout-btn" onClick={logout}>Logout</button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;