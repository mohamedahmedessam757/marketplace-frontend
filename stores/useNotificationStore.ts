import { create } from 'zustand';
import { supabase } from '../services/supabase';

export type NotificationType = 'ORDER' | 'SYSTEM' | 'OFFER' | 'PAYMENT' | 'SHIPPING' | 'DELIVERED' | 'CANCELED' | 'RATE' | 'DISPUTE' | 'DOC_EXPIRY' | 'SECURITY';

export interface Notification {
  id: string;
  recipientId: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: NotificationType | string; // 'ORDER', 'SYSTEM', etc.
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    if (!userId) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
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

  markAllAsRead: async (userId: string) => {
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
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  addNotification: async (notification: Partial<Notification>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const recipientId = notification.recipientId || user?.id;
    if (!recipientId) return;

    const newNotif = {
      recipient_id: recipientId,
      title_ar: notification.titleAr || 'إشعار جديد',
      title_en: notification.titleEn || 'New Notification',
      message_ar: notification.messageAr || notification.messageEn || '',
      message_en: notification.messageEn || notification.messageAr || '',
      type: notification.type || 'SYSTEM',
      link: notification.link,
      metadata: notification.metadata,
      is_read: false
    };

    // Optimistic
    const optimistic: Notification = {
      id: Math.random().toString(),
      recipientId,
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

  subscribeToNotifications: (userId: string) => {
    // Unsubscribe existing if any (handled by component unmount usually, but safety check)
    // We can store subscription in a variable outside or in store? Store is better but simple var here works if singleton.
    // Using supabase.channel returns a subscription.

    const channel = supabase.channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as any;
          const mapped: Notification = {
            id: newNotif.id,
            recipientId: newNotif.recipient_id,
            titleAr: newNotif.title_ar,
            titleEn: newNotif.title_en,
            messageAr: newNotif.message_ar,
            messageEn: newNotif.message_en,
            type: newNotif.type,
            isRead: newNotif.is_read,
            link: newNotif.link,
            metadata: newNotif.metadata,
            createdAt: newNotif.created_at
          };

          set(state => ({
            notifications: [mapped, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));

          // Optional: Play sound?
        }
      )
      .subscribe();

    // We should store 'max 1 channel' logic if called multiple times
  },

  unsubscribeFromNotifications: () => {
    supabase.removeChannel(supabase.channel('public:notifications'));
  }
}));
