import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('study_agent_token', response.data.access_token);
      localStorage.setItem('study_agent_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(email, password, full_name) {
    const response = await api.post('/auth/register', { email, password, full_name });
    if (response.data.access_token) {
      localStorage.setItem('study_agent_token', response.data.access_token);
      localStorage.setItem('study_agent_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('study_agent_token');
    localStorage.removeItem('study_agent_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('study_agent_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
