// Converts "09:00" -> 540 (minutes since midnight). Easier to do arithmetic on numbers than strings.
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Converts 540 -> "09:00"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Generates all possible slot start times for one day, given a schedule.
 * Does NOT know about bookings — that's handled separately by comparing
 * against existing Appointment documents.
 */
const generateSlotsForDay = (sessions, slotDurationMinutes) => {
  const slots = [];

  for (const session of sessions) {
    const sessionStart = timeToMinutes(session.startTime);
    const sessionEnd = timeToMinutes(session.endTime);

    for (let time = sessionStart; time + slotDurationMinutes <= sessionEnd; time += slotDurationMinutes) {
      slots.push(minutesToTime(time));
    }
  }

  return slots;
};

const getWeekday = (dateStr) => {
  // dateStr expected as "YYYY-MM-DD"
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
};

const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateStr + 'T00:00:00');
  return inputDate < today;
};

const isToday = (dateStr) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dateStr === todayStr;
};


module.exports = { generateSlotsForDay, timeToMinutes, minutesToTime, getWeekday, isPastDate, isToday };