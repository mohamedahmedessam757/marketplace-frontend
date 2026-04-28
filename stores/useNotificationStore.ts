import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let socket: Socket | null = null;

export type NotificationType = 'ORDER' | 'SYSTEM' | 'OFFER' | 'PAYMENT' | 'SHIPPING' | 'DELIVERED' | 'CANCELED' | 'RATE' | 'DISPUTE' | 'DOC_EXPIRY' | 'SECURITY';

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: string; // CUSTOMER | MERCHANT | ADMIN
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: NotificationType | string; // 'ORDER', 'SYSTEM', etc.
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;

  // App-specific legacy UI properties
  titleKey?: string;
  message?: string;
  orderId?: number;
  linkTo?: string;
  priority?: string;
  channels?: string[];
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;

  fetchNotifications: (userId: string, role: string) => Promise<void>;
  markAsRead: (id: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string, role: string) => Promise<void>;
  subscribeToNotifications: (userId: string, role: string) => void;
  unsubscribeFromNotifications: () => void;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,

  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0,
    isLoading: false
  }),

  fetchNotifications: async (userId: string, role: string) => {
    if (!userId || !role) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('recipient_role', role.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Map snake_case from DB to camelCase if needed, but Supabase returns as is unless mapped.
      // Actually Supabase JS client returns data matching column names by default? 
      // Yes, DB has snake_case (title_ar). I need to map it or use snake_case in interface.
      // Let's check Supabase configuration. Usually it returns column names.
      // I'll map it manually to be safe and consistent with frontend camelCase convention.

      const mappedNotifications = (data || []).map((n: any) => ({
        id: n.id,
        recipientId: n.recipient_id,
        recipientRole: n.recipient_role,
        titleAr: n.title_ar,
        titleEn: n.title_en,
        messageAr: n.message_ar,
        messageEn: n.message_en,
        type: n.type,
        isRead: n.is_read,
        link: n.link,
        metadata: n.metadata,
        createdAt: n.created_at
      }));

      set({
        notifications: mappedNotifications,
        unreadCount: mappedNotifications.filter(n => !n.isRead).length,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string, userId: string) => {
    // Optimistic update
    set(state => {
      const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.isRead).length
      };
    });

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (error) {
      console.error('Error marking as read:', error);
      // Maybe revert if critical, but for read status it's fine.
    }
  },

  markAllAsRead: async (userId: string, role: string) => {
    // Optimistic
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('recipient_role', role.toUpperCase())
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  addNotification: async (notification: Partial<Notification>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const recipientId = notification.recipientId || user?.id;
    if (!recipientId) return;

    const recipientRole = notification.recipientRole || 'CUSTOMER';

    const newNotif = {
      recipient_id: recipientId,
      recipient_role: recipientRole.toUpperCase(),
      title_ar: notification.titleAr || 'إشعار جديد',
      title_en: notification.titleEn || 'New Notification',
      message_ar: notification.messageAr || notification.message || notification.messageEn || '',
      message_en: notification.messageEn || notification.message || notification.messageAr || '',
      type: notification.type || 'SYSTEM',
      link: notification.link,
      metadata: notification.metadata,
      is_read: false
    };

    // Optimistic
    const optimistic: Notification = {
      id: Math.random().toString(),
      recipientId,
      recipientRole: newNotif.recipient_role,
      titleAr: newNotif.title_ar,
      titleEn: newNotif.title_en,
      messageAr: newNotif.message_ar,
      messageEn: newNotif.message_en,
      type: newNotif.type,
      isRead: false,
      link: newNotif.link,
      metadata: newNotif.metadata,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      notifications: [optimistic, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));

    // DB Insert
    try {
      await supabase.from('notifications').insert(newNotif);
    } catch (e) {
      console.error('Failed to add notification', e);
    }
  },

  subscribeToNotifications: (userId: string, role: string) => {
    // 1. Clean up legacy Supabase channels just in case
    supabase.getChannels().forEach(ch => {
      if (ch.topic.startsWith('public:notifications')) {
        supabase.removeChannel(ch);
      }
    });

    // 2. Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // 3. Connect to the NestJS WebSockets Gateway (Phase 1 Infrastructure)
    console.log(`[Notifications] Connecting to ${BACKEND_URL}/notifications for user ${userId}...`);
    socket = io(`${BACKEND_URL}/notifications`, {
      query: { userId, role: role.toUpperCase() },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log(`[Notifications] ✅ Connected to WebSocket Gateway! Socket ID: ${socket?.id}`);
      set({ isConnected: true });
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Notifications] ❌ Disconnected from WebSocket: ${reason}`);
      set({ isConnected: false });
    });

    // 3.1 Common Handler
    const handleNewNotification = (payload: any) => {
      console.log('[Notifications] Received real-time event:', payload);

      const mapped: Notification = {
        id: payload.id || Math.random().toString(),
        recipientId: payload.recipientId,
        recipientRole: payload.recipientRole,
        titleAr: payload.titleAr,
        titleEn: payload.titleEn,
        messageAr: payload.messageAr,
        messageEn: payload.messageEn,
        type: payload.type,
        isRead: payload.isRead || false,
        link: payload.link,
        metadata: payload.metadata,
        createdAt: payload.createdAt || new Date().toISOString()
      };

      set(state => {
        // Prevent duplicate if already fetched or optimistically added
        if (state.notifications.some(n => n.id === mapped.id)) return state;
        
        return {
          notifications: [mapped, ...state.notifications],
          unreadCount: state.unreadCount + 1
        };
      });
    };

    // Listen for standard notifications
    socket.on('new_notification', handleNewNotification);

    // Listen for administrative alerts if applicable
    socket.on('admin_alert', handleNewNotification);

    socket.on('connect_error', (err) => {
      console.error('[Notifications] Connection error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] Disconnected from Gateway');
    });
  },

  unsubscribeFromNotifications: () => {
    // Clean up legacy Supabase just in case
    supabase.getChannels().forEach(ch => {
      if (ch.topic.startsWith('public:notifications')) {
        supabase.removeChannel(ch);
      }
    });

    // Disconnect the WebSocket
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
}));
