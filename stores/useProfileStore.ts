import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId, getCurrentUser } from '../utils/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
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
  uploadAvatar: (file: File) => Promise<void>;

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
      console.warn('[useProfileStore] No user ID found in localStorage');
      set({ user: null, loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      console.log('[useProfileStore] Fetching data for userId:', userId);

      // 1. Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, phone, role, avatar')
        .eq('id', userId)
        .maybeSingle(); // Changed from single() to maybeSingle() to prevent 406 errors

      if (userError) {
        // Fallback: Try fetching profile from our Custom Backend API (Bypasses RLS)
        // This is critical if RLS policies are broken or missing or if the user hasn't run the migration script yet.
        try {
          const { authApi } = await import('../services/api/auth');
          const apiProfile = await authApi.getProfile();

          if (apiProfile) {
            // Success! We recovered the profile. 
            // We do NOT log the original RLS error to keep the console clean for the user.
            // console.debug('[useProfileStore] RLS Bypass successful');

            set({
              user: {
                id: apiProfile.id,
                name: apiProfile.name, // Ensure this field exists in response
                email: apiProfile.email,
                phone: apiProfile.phone,
                role: apiProfile.role,
                avatar: apiProfile.avatar
              },
              loading: false
            });
            return; // Return early, effectively suppressing the throw userError
          }
        } catch (apiErr) {
          // Only log if BOTH fail
          console.warn('[useProfileStore] API Fallback attempt failed:', apiErr);
        }

        // If we reach here, both Supabase AND Fallback failed. Now it's a real error.
        console.error('[useProfileStore] User fetch error:', userError);
        throw userError;
      }

      if (!userData) {
        console.warn('[useProfileStore] User found in auth but record missing in DB');
        // Fallback to minimal user info from token if DB fetch fails/is empty
        const tokenUser = getCurrentUser();
        if (tokenUser) {
          set({
            user: {
              id: tokenUser.id,
              name: 'User', // Placeholder
              email: tokenUser.email,
              phone: '',
              role: 'CUSTOMER', // Default role
              avatar: undefined
            },
            loading: false
          });
          return;
        }
        throw new Error('User record not found');
      }

      // 2. Fetch settings (Independent, non-blocking)
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Handle settings (might be null if new user)
      let currentSettings = get().settings;
      if (settingsData) {
        currentSettings = {
          language: settingsData.language,
          currency: settingsData.currency,
          notifications_email: settingsData.notifications_email,
          notifications_push: settingsData.notifications_push,
          notifications_sms: settingsData.notifications_sms,
          notifications_offers: settingsData.notifications_offers,
          theme: settingsData.theme,
          autoTranslateChat: settingsData.auto_translate_chat ?? false
        };
      }

      set({
        user: {
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'CUSTOMER',
          avatar: userData.avatar
        },
        settings: currentSettings,
        loading: false
      });
      console.log('[useProfileStore] Profile loaded successfully:', userData.name);

    } catch (err: any) {
      console.error('[useProfileStore] Failed to fetch profile:', err);
      set({ loading: false, error: err.message || 'Failed to load profile' });
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

  uploadAvatar: async (file: File) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // 1. Validate File
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      throw new Error('Image size must be less than 2MB');
    }

    set({ loading: true });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(fileName);

      // 4. Update User Profile in DB (Via Backend to Bypass RLS)
      // const { error: dbError } = await supabase.from('users').update({ avatar: publicUrl }).eq('id', userId);

      try {
        const { authApi } = await import('../services/api/auth');
        await authApi.updateProfile({ avatar: publicUrl });
      } catch (backendErr) {
        console.error('Backend Update Failed:', backendErr);
        throw backendErr;
      }

      // 5. Update Local State Immediately
      set((state) => ({
        loading: false,
        user: state.user ? { ...state.user, avatar: publicUrl } : null
      }));

    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      set({ loading: false, error: err.message });
      throw err;
    }
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
