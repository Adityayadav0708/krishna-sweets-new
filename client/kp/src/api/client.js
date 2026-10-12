import axios from 'axios';

/**
 * Pre-configured Axios instance for the Krishna Sweets API.
 * - baseURL: points to the Express backend (http://localhost:5006/api)
 * - withCredentials: true sends httpOnly cookies (accessToken, refreshToken)
 *   automatically with every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5006/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
