import { useState, useEffect, useCallback } from 'react';
import { getAppointments, cancelAppointment, markArrived } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import './AppointmentList.css';

const STATUS_OPTIONS = ['scheduled', 'arrived', 'completed', 'cancelled'];

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await getAppointments(params);
      setAppointments(res.data);
      setMeta(res.meta);
    } catch (err) {
      setActionError('Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setActionError('');
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not cancel appointment.');
    }
  };

  const handleArrive = async (id) => {
    setActionError('');
    try {
      await markArrived(id);
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not update appointment.');
    }
  };

  const canManage = user?.role === 'receptionist' || user?.role === 'super_admin';

  return (
    <div>
      <h1 className="al-title">Appointments</h1>
      <p className="al-subtitle">{meta.total} total</p>

      <div className="al-controls">
        <input
          className="al-search"
          placeholder="Search patient name or mobile…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {actionError && <div className="al-error">{actionError}</div>}

      {loading ? (
        <p className="al-status">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="al-status">No appointments found.</p>
      ) : (
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.name}<div className="al-muted">{a.patient?.mobile}</div></td>
                  <td>{a.doctor?.user?.name}<div className="al-muted">{a.department}</div></td>
                  <td>{a.date}</td>
                  <td>{a.slotTime}</td>
                  <td><span className={`al-badge ${a.status}`}>{a.status}</span></td>
                  {canManage && (
                    <td className="al-actions">
                      {a.status === 'scheduled' && (
                        <>
                          <button onClick={() => handleArrive(a._id)}>Mark Arrived</button>
                          <button className="al-danger" onClick={() => handleCancel(a._id)}>Cancel</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="al-pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;