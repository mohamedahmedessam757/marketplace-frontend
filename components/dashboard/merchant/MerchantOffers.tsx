

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Eye, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { GlassCard } from '../../ui/GlassCard';
import { useOrderStore } from '../../../stores/useOrderStore';
import { Badge } from '../../ui/Badge';

export const MerchantOffers: React.FC = () => {
    const { language } = useLanguage();
    const { orders } = useOrderStore(); // Connect to real store
    const isAr = language === 'ar';

    const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

    // Logic to categorize offers from the global orders list
    // Filter orders where this vendor has submitted an offer (offersCount > 0)
    // The backend already filters to only return orders relevant to this vendor
    const myOffers = orders.filter(o =>
        // Orders where we have at least one offer submitted (my store made an offer)
        o.offersCount > 0 ||
        // OR orders that are past the offer stage (meaning we were involved)
        ['AWAITING_PAYMENT', 'PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status)
    );

    const filteredOffers = myOffers.filter(o => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return o.status === 'AWAITING_PAYMENT' || (o.status === 'AWAITING_OFFERS' && o.offersCount > 0);
        if (activeTab === 'ACCEPTED') return ['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status);
        if (activeTab === 'REJECTED') return ['CANCELLED', 'REJECTED'].includes(o.status);
        return true;
    });

    const tabs = [
        { id: 'ALL', label: isAr ? 'الكل' : 'All' },
        { id: 'PENDING', label: isAr ? 'بانتظار الدفع' : 'Pending Payment' },
        { id: 'ACCEPTED', label: isAr ? 'مقبولة' : 'Accepted' },
        { id: 'REJECTED', label: isAr ? 'مرفوضة/ملغاة' : 'Rejected' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{isAr ? 'سجل المبيعات والعروض' : 'Sales & Offers History'}</h1>
                    <p className="text-white/50 text-sm">{isAr ? 'تتبع حالة العروض التي قدمتها للعملاء' : 'Track the status of offers submitted to customers'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                    relative px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap
                    ${activeTab === tab.id ? 'text-gold-400' : 'text-white/40 hover:text-white'}
                `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabOffer"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
                            />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="popLayout">
                <div className="grid gap-4">
                    {filteredOffers.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <p className="text-white/40">{isAr ? 'لا توجد عروض في هذه القائمة' : 'No offers found in this category'}</p>
                        </div>
                    ) : (
                        filteredOffers.map((offer) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className="p-0 overflow-hidden bg-[#151310] border-white/5 hover:border-gold-500/20 transition-all group">
                                    <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-6">

                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(offer.status)
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                    : offer.status === 'AWAITING_PAYMENT'
                                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                {['PREPARATION', 'SHIPPED'].includes(offer.status) ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white">{offer.part}</h3>
                                                    <span className="text-[10px] text-white/30 bg-white/5 px-1.5 rounded">#{offer.id}</span>
                                                </div>
                                                <p className="text-sm text-white/50">{offer.car}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                            <div className="text-center md:text-right">
                                                <div className="text-xs text-white/40 mb-1">{isAr ? 'عرضك' : 'Your Offer'}</div>
                                                <div className="font-mono font-bold text-gold-400 text-lg">{offer.price}</div>
                                            </div>

                                            <div className="text-center md:text-right min-w-[100px]">
                                                <div className="text-xs text-white/40 mb-1">{isAr ? 'الحالة' : 'Status'}</div>
                                                <Badge status={offer.status} />
                                            </div>

                                            {/* Action Button (Placeholder) */}
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </div>

                                    </div>

                                    {/* Contextual Footer Info */}
                                    {offer.status === 'AWAITING_PAYMENT' && (
                                        <div className="bg-yellow-500/5 px-5 py-2 flex items-center gap-2 text-xs text-yellow-500/80 border-t border-yellow-500/10">
                                            <Clock size={12} />
                                            <span>{isAr ? 'بانتظار دفع العميل... تنتهي الصلاحية خلال 23 ساعة' : 'Waiting for customer payment... Expires in 23h'}</span>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </AnimatePresence>

        </div>
    );
};
