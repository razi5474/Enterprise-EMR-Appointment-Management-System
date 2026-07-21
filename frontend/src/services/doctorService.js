import api from './api';

export const getDoctors = async () => {
  const { data } = await api.get('/doctors');
  return data.data;
};

export const getSlots = async (doctorId, date) => {
  const { data } = await api.get('/slots', { params: { doctorId, date } });
  return data.data;
};