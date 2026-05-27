import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // If we are on localhost, prioritize the local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  // Otherwise use the configured Ngrok/Production URL
  return envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Bypass Ngrok browser warning page
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
