import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchPatients } from '../services/patientService';
import { createAppointment } from '../services/appointmentService';
import './Booking.css';

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Guard: someone landed here without going through the Scheduler
  if (!state?.doctorId || !state?.date || !state?.slotTime) {
    return (
      <div>
        <p>No slot selected.</p>
        <button onClick={() => navigate('/scheduler')}>Back to Scheduler</button>
      </div>
    );
  }

  const { doctorId, date, slotTime } = state;

  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({ name: '', mobile: '', age: '', gender: 'male' });
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSelectedPatient(null);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchPatients(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'existing' && !selectedPatient) {
      setError('Please select a patient from the search results.');
      return;
    }
    if (mode === 'new' && (!newPatient.name || !newPatient.mobile)) {
      setError('New patient requires at least name and mobile.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId,
        date,
        slotTime,
        purpose,
        ...(mode === 'existing'
          ? { patientId: selectedPatient._id }
          : { newPatient: { ...newPatient, age: Number(newPatient.age) || undefined } }),
      };
      await createAppointment(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <h2>Appointment booked</h2>
        <p>{date} at {slotTime}</p>
        <button onClick={() => navigate('/appointments')}>View Appointments</button>
        <button onClick={() => navigate('/scheduler')}>Book Another</button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <h1 className="booking-title">Book Appointment</h1>
      <p className="booking-subtitle">{date} at {slotTime}</p>

      <div className="booking-tabs">
        <button className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>
          Existing Patient
        </button>
        <button className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>
          New Patient
        </button>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {mode === 'existing' ? (
          <div className="booking-field">
            <label>Search by name or mobile</label>
            <input value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Start typing…" />
            {searchResults.length > 0 && !selectedPatient && (
              <ul className="patient-results">
                {searchResults.map((p) => (
                  <li key={p._id} onClick={() => { setSelectedPatient(p); setSearchQuery(p.name); setSearchResults([]); }}>
                    {p.name} — {p.mobile}
                  </li>
                ))}
              </ul>
            )}
            {selectedPatient && (
              <p className="patient-selected">Selected: {selectedPatient.name} ({selectedPatient.mobile})</p>
            )}
          </div>
        ) : (
          <>
            <div className="booking-field">
              <label>Full name</label>
              <input
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                required
              />
            </div>
            <div className="booking-field">
              <label>Mobile</label>
              <input
                value={newPatient.mobile}
                onChange={(e) => setNewPatient({ ...newPatient, mobile: e.target.value })}
                required
              />
            </div>
            <div className="booking-row">
              <div className="booking-field">
                <label>Age</label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                />
              </div>
              <div className="booking-field">
                <label>Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="booking-field">
          <label>Purpose of visit</label>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow-up consultation" />
        </div>

        {error && <div className="booking-error">{error}</div>}

        <button type="submit" className="booking-submit" disabled={submitting}>
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default Booking;