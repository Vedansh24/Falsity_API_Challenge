/**
 * Realtime Store - Notifications & Activity
 * Zustand store for managing notifications and activity feed state
 */

import { create } from 'zustand';

/**
 * Notification Store
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        read: false
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 100),
        unreadCount: state.unreadCount + 1
      };
    });
  },

  removeNotification: (id) => {
    set((state) => {
      const removed = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: removed && !removed.read ? state.unreadCount - 1 : state.unreadCount
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set(() => ({
      notifications: [],
      unreadCount: 0
    }));
  }
}));

/**
 * Activity Feed Store
 */
export interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: number;
  userId: string;
  userRole: string;
  metadata?: Record<string, any>;
  icon?: string;
  category?: string;
}

interface ActivityState {
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  getActivitiesByCategory: (category: string) => ActivityEvent[];
  getActivitiesByUser: (userId: string) => ActivityEvent[];
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  addActivity: (activity) => {
    const id = `activity_${Date.now()}_${Math.random()}`;
    set((state) => ({
      activities: [
        {
          ...activity,
          id,
          timestamp: Date.now()
        },
        ...state.activities
      ].slice(0, 200) // Keep last 200 activities
    }));
  },

  clearActivities: () => {
    set(() => ({
      activities: []
    }));
  },

  getActivitiesByCategory: (category) => {
    return get().activities.filter((a) => a.category === category);
  },

  getActivitiesByUser: (userId) => {
    return get().activities.filter((a) => a.userId === userId);
  }
}));

/**
 * Realtime Connection Store
 */
interface RealtimeConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastError: Error | null;
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useRealtimeConnectionStore = create<RealtimeConnectionState>((set) => ({
  isConnected: false,
  isReconnecting: false,
  lastError: null,

  setConnected: (connected) => {
    set(() => ({
      isConnected: connected,
      isReconnecting: false,
      lastError: null
    }));
  },

  setReconnecting: (reconnecting) => {
    set(() => ({
      isReconnecting: reconnecting
    }));
  },

  setError: (error) => {
    set(() => ({
      lastError: error
    }));
  }
}));

/**
 * Collaborative Presence Store
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userRole: string;
  currentPage: string;
  lastSeen: number;
  isActive: boolean;
}

interface PresenceState {
  activeUsers: Map<string, UserPresence>;
  addUser: (user: UserPresence) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<UserPresence>) => void;
  getActiveUsers: () => UserPresence[];
  getActiveUsersOnPage: (page: string) => UserPresence[];
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  activeUsers: new Map(),

  addUser: (user) => {
    set((state) => {
      const updated = new Map(state.activeUsers);
      updated.set(user.userId, user);
      return { activeUsers: updated };
    });
  },

  removeUser: (userId) => {
    set((state) => {
      const updated = new Map(state.activeUsers);
      updated.delete(userId);
      return { activeUsers: updated };
    });
  },

  updateUser: (userId, updates) => {
    set((state) => {
      const user = state.activeUsers.get(userId);
      if (!user) return state;
      const updated = new Map(state.activeUsers);
      updated.set(userId, { ...user, ...updates });
      return { activeUsers: updated };
    });
  },

  getActiveUsers: () => {
    return Array.from(get().activeUsers.values()).filter(
      (u) => u.isActive && Date.now() - u.lastSeen < 5 * 60 * 1000 // 5 min timeout
    );
  },

  getActiveUsersOnPage: (page) => {
    return get()
      .getActiveUsers()
      .filter((u) => u.currentPage === page);
  }
}));
