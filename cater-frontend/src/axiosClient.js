import axios from 'axios';

const token = localStorage.getItem('token');

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

export default axiosClient;
