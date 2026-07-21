import { useState, useEffect } from 'react';
import { getDoctors, createDoctor, setDoctorSchedule } from '../services/doctorService';
import './Doctors.css';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null); // doctor being scheduled
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    getDoctors()
      .then(setDoctors)
      .catch(() => setError('Could not load doctors.'));
  };

  useEffect(load, []);

  return (
    <div>
      <div className="doc-header">
        <div>
          <h1 className="doc-title">Doctors</h1>
          <p className="doc-subtitle">{doctors.length} on staff</p>
        </div>
        <button className="doc-add-btn" onClick={() => setShowAddForm(true)}>+ Add Doctor</button>
      </div>

      {error && <div className="doc-error">{error}</div>}
      {success && <div className="doc-success">{success}</div>}

      <div className="doc-grid">
        {doctors.map((doc) => (
          <div className="doc-card" key={doc._id}>
            <h3>{doc.user?.name}</h3>
            <p className="doc-dept">{doc.department}{doc.specialization ? ` · ${doc.specialization}` : ''}</p>
            <p className="doc-email">{doc.user?.email}</p>
            <button onClick={() => setScheduleTarget(doc)}>Manage Schedule</button>
          </div>
        ))}
      </div>

      {showAddForm && (
        <AddDoctorModal
          onClose={() => setShowAddForm(false)}
          onCreated={() => { setShowAddForm(false); setSuccess('Doctor added successfully.'); load(); }}
        />
      )}

      {scheduleTarget && (
        <ScheduleModal
          doctor={scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          onSaved={() => { setScheduleTarget(null); setSuccess('Schedule saved successfully.'); }}
        />
      )}
    </div>
  );
};

const AddDoctorModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', specialization: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createDoctor({ ...form, role: 'doctor' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Doctor</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Temporary password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input placeholder="Specialization (optional)" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          {error && <div className="doc-error">{error}</div>}
          <div className="doc-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Doctor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleModal = ({ doctor, onClose, onSaved }) => {
  const [workingDays, setWorkingDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [sessions, setSessions] = useState([{ startTime: '09:00', endTime: '12:00' }, { startTime: '13:00', endTime: '17:00' }]);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(15);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day) => {
    setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const updateSession = (index, field, value) => {
    setSessions((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSession = () => setSessions((prev) => [...prev, { startTime: '', endTime: '' }]);
  const removeSession = (index) => setSessions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (workingDays.length === 0) return setError('Select at least one working day.');
    setSubmitting(true);
    try {
      await setDoctorSchedule(doctor._id, { workingDays, sessions, slotDurationMinutes: Number(slotDurationMinutes) });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule — {doctor.user?.name}</h2>
        <form onSubmit={handleSubmit}>
          <label className="doc-modal-label">Working Days</label>
          <div className="doc-days">
            {WEEKDAYS.map((day) => (
              <button
                type="button"
                key={day}
                className={workingDays.includes(day) ? 'active' : ''}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <label className="doc-modal-label">Sessions</label>
          {sessions.map((s, i) => (
            <div className="doc-session-row" key={i}>
              <input type="time" value={s.startTime} onChange={(e) => updateSession(i, 'startTime', e.target.value)} required />
              <span>to</span>
              <input type="time" value={s.endTime} onChange={(e) => updateSession(i, 'endTime', e.target.value)} required />
              {sessions.length > 1 && <button type="button" onClick={() => removeSession(i)}>×</button>}
            </div>
          ))}
          <button type="button" className="doc-add-session" onClick={addSession}>+ Add session</button>

          <label className="doc-modal-label">Slot Duration (minutes)</label>
          <input type="number" value={slotDurationMinutes} min={5} onChange={(e) => setSlotDurationMinutes(e.target.value)} />

          {error && <div className="doc-error">{error}</div>}
          <div className="doc-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Doctors;