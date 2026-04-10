import React from 'react';
import { MessageSquare } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { LoyaltyTab } from '../profile/tabs/LoyaltyTab';
import { useLanguage } from '../../../contexts/LanguageContext';

export const LoyaltyPage: React.FC = () => {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MessageSquare className="text-gold-500" size={32} />
                        {isAr ? 'مركز التقييمات' : 'Reviews Center'}
                    </h1>
                    <p className="text-white/50 mt-2">
                        {isAr ? 'إدارة تقييماتك للمتاجر والاطلاع على حالة النشر لكل تقييم.' : 'Manage your store reviews and check the publishing status of each review.'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <GlassCard className="p-6 md:p-10 border-white/5">
                <LoyaltyTab />
            </GlassCard>
        </div>
    );
};
