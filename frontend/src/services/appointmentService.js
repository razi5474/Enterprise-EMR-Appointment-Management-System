import api from './api';

export const createAppointment = async (payload) => {
  const { data } = await api.post('/appointments', payload);
  return data;
};

export const getAppointments = async (params = {}) => {
  const { data } = await api.get('/appointments', { params });
  return data;
};

export const updateAppointment = async (id, payload) => {
  const { data } = await api.put(`/appointments/${id}`, payload);
  return data;
};

export const cancelAppointment = async (id) => {
  const { data } = await api.delete(`/appointments/${id}`);
  return data;
};

export const markArrived = async (id) => {
  const { data } = await api.post(`/appointments/${id}/arrive`);
  return data;
};

export const getTodayStats = async () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const res = await getAppointments({ dateFrom: dateStr, dateTo: dateStr, limit: 100 });
  return res;
};