
import { create } from 'zustand';

export type NotificationType = 'offer' | 'accepted' | 'payment' | 'shipping' | 'delivery' | 'rate' | 'dispute' | 'system' | 'docExpiry' | 'security';
export type NotificationChannel = 'app' | 'whatsapp' | 'email';

export interface Notification {
  id: string;
  type: NotificationType;
  titleKey: string;
  message: string;
  date: string;
  isRead: boolean;
  linkTo?: string;
  orderId?: number;
  priority?: 'normal' | 'urgent';
  channels?: NotificationChannel[];
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notif: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: '1', type: 'offer', titleKey: 'newOffer', message: 'You received a new offer for Order #1002', date: '2 mins ago', isRead: false, orderId: 1002, linkTo: 'order-details', priority: 'normal', channels: ['app', 'whatsapp'] },
    { id: '2', type: 'shipping', titleKey: 'shipped', message: 'Your Order #1003 has been shipped via DHL', date: '1 hour ago', isRead: false, orderId: 1003, linkTo: 'order-details', priority: 'normal', channels: ['app', 'whatsapp'] },
    { id: '3', type: 'payment', titleKey: 'paymentConfirmed', message: 'Payment confirmed for Order #1006', date: 'Yesterday', isRead: true, orderId: 1006, linkTo: 'order-details', priority: 'normal', channels: ['app', 'email'] }
  ],
  unreadCount: 2,

  addNotification: (notif) => {
    // In a real backend, here we would trigger API calls to Twilio/SendGrid based on `channels`
    if (notif.channels?.includes('whatsapp')) {
      console.log(`[Mock System] Sending WhatsApp to User: ${notif.message}`);
    }
    if (notif.channels?.includes('email')) {
      console.log(`[Mock System] Sending Email to User: ${notif.message}`);
    }

    set((state) => ({
      notifications: [{
        ...notif,
        id: Date.now().toString(),
        date: 'Just now',
        isRead: false,
        channels: notif.channels || ['app'] // Default to app
      }, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  fetchNotifications: async () => {
    // Mock implementation for now - just ensures no crash
    // In real app, this would fetch from backend API
    console.log("Fetching notifications...");
  }
}));
