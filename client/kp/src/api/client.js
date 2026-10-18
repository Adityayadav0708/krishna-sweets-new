import axios from 'axios';

/**
 * Pre-configured Axios instance for the Krishna Sweets API.
 * - baseURL: points to the Express backend (http://localhost:5006/api)
 * - withCredentials: true sends httpOnly cookies (accessToken, refreshToken)
 *   automatically with every request.
 */
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5006/api',     is it for local deploment 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5006/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token from localStorage if available as cookie fallback
api.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem('ks_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const token = parsed?.accessToken || parsed?.token;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {}
  return config;
});

// Response interceptor for consistent error extraction and silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and request was not already a retry or auth route
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh-token');
        const newToken = refreshRes.data?.accessToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          try {
            const raw = localStorage.getItem('ks_user');
            if (raw) {
              const u = JSON.parse(raw);
              u.accessToken = newToken;
              localStorage.setItem('ks_user', JSON.stringify(u));
            }
          } catch (e) {}
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh token expired or invalid; proceed with rejection
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
