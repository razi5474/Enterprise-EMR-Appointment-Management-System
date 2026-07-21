import api from './api';

export const getDoctors = async () => {
  const { data } = await api.get('/doctors');
  return data.data;
};

export const getSlots = async (doctorId, date) => {
  const { data } = await api.get('/slots', { params: { doctorId, date } });
  return data.data;
};

export const createDoctor = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data;
};

export const setDoctorSchedule = async (doctorId, payload) => {
  const { data } = await api.post(`/doctors/${doctorId}/schedule`, payload);
  return data;
};