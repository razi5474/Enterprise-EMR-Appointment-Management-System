import api from './api';

export const searchPatients = async (query) => {
  const { data } = await api.get('/patients', { params: { search: query } });
  return data.data;
};