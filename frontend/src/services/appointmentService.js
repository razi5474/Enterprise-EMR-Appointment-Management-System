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