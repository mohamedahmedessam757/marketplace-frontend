import React from 'react';
import { Settings } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { SettingsTab } from '../profile/tabs/SettingsTab';
import { useLanguage } from '../../../contexts/LanguageContext';

export const PreferencesPage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="text-gold-500" size={32} />
                        {t.dashboard.profile.tabs.settings || 'Preferences & Notifications'}
                    </h1>
                    <p className="text-white/50 mt-2">
                        {t.dashboard.profile.tabs.settingsDesc || 'Manage your account settings, notifications, and language preferences'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <GlassCard className="p-6 md:p-10">
                <SettingsTab />
            </GlassCard>
        </div>
    );
};
