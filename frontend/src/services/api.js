import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_agent_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: auto redirect on expired token
      // localStorage.removeItem('study_agent_token');
    }
    return Promise.reject(error);
  }
);

export default api;
