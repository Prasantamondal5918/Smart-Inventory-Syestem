import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  shop: JSON.parse(localStorage.getItem('shop')) || null,
  branch: JSON.parse(localStorage.getItem('branch')) || null,
  loading: false,
  error: null,

  setAuth: (user, token, shop = null, branch = null) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (shop) localStorage.setItem('shop', JSON.stringify(shop));
    if (branch) localStorage.setItem('branch', JSON.stringify(branch));
    set({ user, token, shop, branch });
  },

  registerOwner: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/auth/register', formData);
      const { user, token, shop, branch } = res.data;
      get().setAuth(user, token, shop, branch);
      set({ loading: false });
      return res;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/auth/login', { email, password });
      const { user, token, shop, branch } = res.data;
      get().setAuth(user, token, shop, branch);
      set({ loading: false });
      return res;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await API.get('/auth/me');
      const { user, shop, branch } = res.data;
      get().setAuth(user, token, shop, branch);
    } catch (err) {
      console.error('Fetch me failed:', err.message);
    }
  },

  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore network logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('shop');
      localStorage.removeItem('branch');
      set({ user: null, token: null, shop: null, branch: null });
    }
  },
}));
