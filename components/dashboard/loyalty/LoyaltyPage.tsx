import React from 'react';
import { Star } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { LoyaltyTab } from '../profile/tabs/LoyaltyTab';
import { useLanguage } from '../../../contexts/LanguageContext';

export const LoyaltyPage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Star className="text-gold-500" size={32} />
                        {t.dashboard.menu.loyalty || 'Loyalty & Rewards'}
                    </h1>
                    <p className="text-white/50 mt-2">
                        {t.dashboard.loyalty?.subtitle || 'Earn points and redeem exclusive rewards'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <GlassCard className="p-6 md:p-10">
                <LoyaltyTab />
            </GlassCard>
        </div>
    );
};
