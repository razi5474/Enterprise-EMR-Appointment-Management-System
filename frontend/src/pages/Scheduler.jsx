import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getSlots } from '../services/doctorService';
import './Scheduler.css';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Scheduler = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Load the doctor list once, on mount
  useEffect(() => {
    getDoctors()
      .then((data) => {
        setDoctors(data);
        if (data.length > 0) setSelectedDoctorId(data[0]._id);
      })
      .catch(() => setError('Could not load doctors.'));
  }, []);

  // Reload slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !date) return;

    setLoading(true);
    setError('');
    getSlots(selectedDoctorId, date)
      .then((data) => setSlots(data.slots))
      .catch((err) => {
        setSlots([]);
        setError(err.response?.data?.message || 'Could not load slots for this date.');
      })
      .finally(() => setLoading(false));
  }, [selectedDoctorId, date]);

  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;
    navigate('/book', { state: { doctorId: selectedDoctorId, date, slotTime: slot.time } });
  };

  return (
    <div>
      <h1 className="scheduler-title">Scheduler</h1>
      <p className="scheduler-subtitle">Pick a doctor and date to see open slots.</p>

      <div className="scheduler-controls">
        <div className="scheduler-field">
          <label>Doctor</label>
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.user.name} — {doc.department}
              </option>
            ))}
          </select>
        </div>

        <div className="scheduler-field">
          <label>Date</label>
          <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {error && <div className="scheduler-error">{error}</div>}

      {loading ? (
        <p className="scheduler-status">Loading slots…</p>
      ) : slots.length === 0 && !error ? (
        <p className="scheduler-status">No slots available for this day.</p>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => (
            <button
              key={slot.time}
              className={`slot-btn ${slot.status}`}
              disabled={slot.status !== 'available'}
              onClick={() => handleSlotClick(slot)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scheduler;