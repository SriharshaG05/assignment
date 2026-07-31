import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  activeToast: Notification | null;
  setActiveToast: (toast: Notification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsUrl = API_URL.replace(/^http/, 'ws') + `/ws?token=${token}`;
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'notification') {
            const newNotif: Notification = payload.data;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            setActiveToast(newNotif);

            setTimeout(() => {
              setActiveToast((currentToast) => {
                if (currentToast?.id === newNotif.id) {
                  return null;
                }
                return currentToast;
              });
            }, 5000);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket encountered error:', err);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
      };

      return () => {
        socket.close();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setActiveToast(null);
    }
  }, [user, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        fetchNotifications,
        activeToast,
        setActiveToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
