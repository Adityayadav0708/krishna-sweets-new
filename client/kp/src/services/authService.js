import api from '@/api/client';

export const authService = {
  /**
   * Log in an existing user with email and password.
   * On success, server sets httpOnly cookies (accessToken, refreshToken).
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    return response.data?.user || response.data?.data || response.data;
  },

  /**
   * Register a new user account.
   */
  async signup({ name, email, password }) {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  },

  /**
   * Log out the current user and invalidate cookies.
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    }
  },

  /**
   * Fetch current authenticated user session details from JWT cookie.
   */
  async getMe() {
    try {
      const response = await api.get('/auth/user-details');
      return response.data?.data || response.data?.user || null;
    } catch (err) {
      // 401 Unauthorized simply means not logged in
      return null;
    }
  },

  /**
   * Update profile information (name, mobile, password, address).
   */
  async updateProfile(updates) {
    const response = await api.put('/auth/update-user', updates);
    return response.data?.user || response.data?.data;
  },
};

export default authService;
