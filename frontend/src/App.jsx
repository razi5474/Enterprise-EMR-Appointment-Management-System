import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Scheduler from './pages/Scheduler';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheduler" element={<Scheduler />} />
        {/* Scheduler, Appointments, Doctors, Audit Log routes get added here as we build them */}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;