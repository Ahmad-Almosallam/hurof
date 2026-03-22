import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:5000',
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('hurof_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
