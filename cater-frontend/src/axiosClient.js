import axios from 'axios';

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;