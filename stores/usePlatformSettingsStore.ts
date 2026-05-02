import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface PlatformSettingsState {
    isAttachmentsEnabled: boolean;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    subscribeToSettings: () => () => void;
    setAttachmentsEnabled: (val: boolean) => void;
}

/**
 * 2026 High-Performance Platform Settings Store
 * Manages global system toggles with Supabase Realtime synchronization.
 */
export const usePlatformSettingsStore = create<PlatformSettingsState>((set) => ({
    isAttachmentsEnabled: true, // Default to enabled
    isLoading: true,
    setAttachmentsEnabled: (val) => set({ isAttachmentsEnabled: val }),

    fetchSettings: async () => {
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('setting_value')
                .eq('setting_key', 'CHAT_ATTACHMENTS_ENABLED')
                .single();

            if (!error && data) {
                set({ isAttachmentsEnabled: data.setting_value === 'true' || data.setting_value === true });
            }
        } catch (err) {
            console.error('[PlatformSettingsStore] Fetch failed:', err);
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeToSettings: () => {
        // Subscribe to real-time updates for the CHAT_ATTACHMENTS_ENABLED key
        const channel = supabase
            .channel('platform_settings_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'platform_settings',
                    filter: 'setting_key=eq.CHAT_ATTACHMENTS_ENABLED',
                },
                (payload) => {
                    const newValue = payload.new.setting_value === 'true' || payload.new.setting_value === true;
                    set({ isAttachmentsEnabled: newValue });
                    console.log(`[PlatformSettingsStore] Attachments toggled to: ${newValue}`);
                }
            )
            .subscribe();

        // Return cleanup function to be used in useEffect
        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
