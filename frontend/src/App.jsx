import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Scheduler from './pages/Scheduler';
import Booking from './pages/Booking';
import AppointmentList from './pages/AppointmentList';
import Doctors from './pages/Doctors';

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
        <Route path="/book" element={<Booking />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/doctors" element={<Doctors />} />
        {/* Scheduler, Appointments, Doctors, Audit Log routes get added here as we build them */}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;