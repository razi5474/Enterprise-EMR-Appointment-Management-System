import api from './api';

export const createAppointment = async (payload) => {
  const { data } = await api.post('/appointments', payload);
  return data;
};

export const getAppointments = async (params = {}) => {
  const { data } = await api.get('/appointments', { params });
  return data;
};