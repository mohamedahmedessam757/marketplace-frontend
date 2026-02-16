
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { User, Star, MapPin, CreditCard, Shield, Settings } from 'lucide-react';
import { InfoTab } from './tabs/InfoTab';
import { SecurityTab } from './tabs/SecurityTab';
import { AddressesTab } from './tabs/AddressesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { BillingTab } from './tabs/BillingTab';
import { LoyaltyTab } from './tabs/LoyaltyTab';

import { SavedCards } from '../wallet/SavedCards';

export const ProfileView: React.FC = () => {
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'addresses' | 'methods' | 'reviews' | 'settings' | 'billing' | 'loyalty'>('info');

    // Consolidated Tabs Configuration
    const tabs = [
        { id: 'info', icon: User, label: t.dashboard.profile.tabs.info },
        { id: 'loyalty', icon: Star, label: t.dashboard.menu.loyalty },
        { id: 'addresses', icon: MapPin, label: t.dashboard.profile.tabs.addresses },
        { id: 'methods', icon: CreditCard, label: t.dashboard.billing?.wallet || 'Payment Methods' }, // New Tab
        { id: 'security', icon: Shield, label: t.dashboard.profile.tabs.security },
        { id: 'settings', icon: Settings, label: t.dashboard.profile.tabs.settings },
    ];

    const handleNavigate = (path: string, id?: any) => {
        console.log("Navigation requested", path, id);
    };

    return (
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${activeTab === tab.id ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}
                  `}
                    >
                        <tab.icon size={18} />
                        <span className="font-bold text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                <GlassCard className="min-h-[500px] p-6 md:p-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'info' && <InfoTab />}
                        {activeTab === 'loyalty' && <LoyaltyTab />}
                        {activeTab === 'addresses' && <AddressesTab />}
                        {activeTab === 'methods' && (
                            <motion.div key="methods" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <SavedCards />
                            </motion.div>
                        )}
                        {activeTab === 'security' && <SecurityTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </AnimatePresence>
                </GlassCard>
            </div>
        </div>
    );
};

