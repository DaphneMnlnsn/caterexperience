import axios from 'axios';
import Swal from 'sweetalert2';

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      Swal.fire({
        icon: 'warning',
        title: 'Logged out',
        text: 'You were logged out because your account was used to log in on another device.',
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.href = '/login';
        localStorage.removeItem('token');
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;