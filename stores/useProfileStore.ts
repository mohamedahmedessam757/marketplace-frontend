import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Address {
  id: string;
  title: string;
  details: string;
  city: string;
  isDefault: boolean;
}

export interface Session {
  id: string;
  device: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSettings {
  language: 'ar' | 'en';
  currency: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  notifications_offers: boolean;
  theme: 'dark' | 'light';
  autoTranslateChat: boolean;
}

interface ProfileState {
  user: UserProfile | null;
  addresses: Address[];
  sessions: Session[];
  loading: boolean;
  error: string | null;
  settings: UserSettings;

  // Actions
  fetchProfile: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;

  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Session Actions
  terminateSession: (id: string) => void;
  terminateAllSessions: () => void;

  // Security Actions
  updatePassword: (current: string, newPass: string) => Promise<void>;
  detectCurrentSession: () => void;
  deleteAccount: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  addresses: [],
  sessions: [],
  loading: false,
  error: null,
  settings: {
    language: 'ar',
    currency: 'AED',
    notifications_email: true,
    notifications_push: true,
    notifications_sms: true,
    notifications_offers: true,
    theme: 'dark',
    autoTranslateChat: false
  },

  fetchProfile: async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      set({ user: null, loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      // 1. Fetch user data
      const userReq = supabase
        .from('users')
        .select('id, name, email, phone, role')
        .eq('id', userId)
        .single();

      // 2. Fetch settings
      const settingsReq = supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      const [userRes, settingsRes] = await Promise.all([userReq, settingsReq]);

      if (userRes.error) throw userRes.error;

      // Handle settings (might be null if new user)
      let currentSettings = get().settings;
      if (settingsRes.data) {
        currentSettings = {
          language: settingsRes.data.language,
          currency: settingsRes.data.currency,
          notifications_email: settingsRes.data.notifications_email,
          notifications_push: settingsRes.data.notifications_push,
          notifications_sms: settingsRes.data.notifications_sms,
          notifications_offers: settingsRes.data.notifications_offers,
          theme: settingsRes.data.theme,
          autoTranslateChat: settingsRes.data.auto_translate_chat ?? false
        };
      }

      set({
        user: {
          id: userRes.data.id,
          name: userRes.data.name || '',
          email: userRes.data.email || '',
          phone: userRes.data.phone || '',
          role: userRes.data.role || 'CUSTOMER'
        },
        settings: currentSettings,
        loading: false
      });

    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      // Fallback
      set({ loading: false });
    }
  },

  updateUser: async (data) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('id', userId);

      if (error) throw error;

      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      }));
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      set({ error: err.message });
    }
  },

  updateSettings: async (data) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Optimistic Update
    set((state) => ({
      settings: { ...state.settings, ...data }
    }));

    try {
      // Check if setting row exists
      const { data: existing } = await supabase.from('user_settings').select('user_id').eq('user_id', userId).single();

      if (existing) {
        await supabase.from('user_settings').update(data).eq('user_id', userId);
      } else {
        await supabase.from('user_settings').insert({ user_id: userId, ...data });
      }
    } catch (err: any) {
      console.error('Failed to update settings:', err);
    }
  },

  deleteAccount: async () => {
    set({ loading: true });
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      // 1. Delete Settings
      await supabase.from('user_settings').delete().eq('user_id', userId);

      // 2. Delete Public User Data
      // Note: This matches common RLS policies where users can delete their own data
      await supabase.from('users').delete().eq('id', userId);

      // 3. Sign Out
      await supabase.auth.signOut();

      set({ user: null, sessions: [], addresses: [] });
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addAddress: (address) => set((state) => {
    const isFirst = state.addresses.length === 0;
    const newAddress = { ...address, id: Date.now().toString(), isDefault: isFirst || address.isDefault };
    const updatedAddresses = address.isDefault
      ? state.addresses.map(a => ({ ...a, isDefault: false }))
      : state.addresses;
    return { addresses: [...updatedAddresses, newAddress] };
  }),

  removeAddress: (id) => set((state) => ({
    addresses: state.addresses.filter(a => a.id !== id)
  })),

  setDefaultAddress: (id) => set((state) => ({
    addresses: state.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }))
  })),

  terminateSession: (id) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== id)
  })),

  terminateAllSessions: () => set((state) => ({
    sessions: state.sessions.filter(s => s.isCurrent)
  })),

  updatePassword: async (currentPassword, newPassword) => {
    set({ loading: true });
    // Mock API Call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentPassword === 'wrong') {
          set({ loading: false, error: 'Incorrect current password' });
          reject(new Error('Incorrect current password'));
        } else {
          set({ loading: false });
          resolve();
        }
      }, 1000);
    });
  },

  detectCurrentSession: () => {
    // Safety check for SSR
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';

    let os = 'Unknown OS';
    if (ua.indexOf('Win') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'MacOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('like Mac') > -1) os = 'iOS';

    const currentSession: Session = {
      id: 'current-session',
      device: `${browser} on ${os}`,
      os: os,
      location: 'Riyadh, KSA', // Mock Location
      ip: '192.168.1.1', // Mock IP
      lastActive: 'Now',
      isCurrent: true
    };

    set(state => {
      // Prevent duplicate current session
      const others = state.sessions.filter(s => !s.isCurrent);
      return { sessions: [currentSession, ...others] };
    });
  }
}));
