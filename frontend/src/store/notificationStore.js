import { create } from 'zustand';
import API from '../services/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await API.get('/notifications');
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      set({
        notifications: get().notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  },

  markAllAsRead: async () => {
    try {
      await API.put('/notifications/read-all');
      set({
        notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err.message);
    }
  },
}));
