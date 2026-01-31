
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Badge, StatusType } from '../ui/Badge';
import { Search, Filter, Calendar, Box, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOrderStore } from '../../stores/useOrderStore';

interface MyOrdersProps {
    onNavigate: (path: string, id?: number) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { orders } = useOrderStore(); // Use global store
    const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const ArrowIcon = language === 'ar' ? ChevronLeft : ChevronRight;

    const tabs = [
        { id: 'ALL', label: t.dashboard.orders.tabs.all },
        { id: 'ACTIVE', label: t.dashboard.orders.tabs.active },
        { id: 'COMPLETED', label: t.dashboard.orders.tabs.completed },
        { id: 'CANCELLED', label: t.dashboard.orders.tabs.cancelled },
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.part.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);

        if (!matchesSearch) return false;

        if (activeTab === 'ALL') return true;
        if (activeTab === 'ACTIVE') return ['AWAITING_OFFERS', 'AWAITING_PAYMENT', 'PREPARATION', 'SHIPPED', 'DISPUTED'].includes(order.status);
        if (activeTab === 'COMPLETED') return ['COMPLETED', 'DELIVERED'].includes(order.status);
        if (activeTab === 'CANCELLED') return ['CANCELLED', 'RETURNED'].includes(order.status);
        return true;
    });

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.menu.orders}</h1>
                    <p className="text-white/50 text-sm">{t.dashboard.orders.manageTitle}</p>
                </div>

                <div className="flex items-center gap-3 bg-[#1A1814] p-1.5 rounded-xl border border-white/10">
                    <div className="relative">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={(t.dashboard.orders as any).searchPlaceholder}
                            className="bg-transparent py-2 pl-10 pr-4 text-sm text-white focus:outline-none w-40 md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/5">
                <div className="flex items-center gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                        relative py-4 text-sm font-bold transition-colors
                        ${activeTab === tab.id ? 'text-gold-400' : 'text-white/40 hover:text-white/70'}
                    `}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabLine"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onNavigate('order-details', order.id)}
                            >
                                <GlassCard className={`
                            p-6 cursor-pointer hover:border-gold-500/30 transition-all group bg-[#151310]
                            ${language === 'ar' ? 'border-r-4' : 'border-l-4'}
                            ${order.status === 'COMPLETED' ? 'border-r-green-500' : order.status === 'AWAITING_PAYMENT' ? 'border-r-orange-500' : order.status === 'AWAITING_OFFERS' ? 'border-r-yellow-500' : order.status === 'CANCELLED' ? 'border-r-gray-600' : 'border-r-gold-500'}
                        `}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                <Box size={24} className="text-white/30 group-hover:text-gold-400 transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-mono text-xs text-white/40">#{order.id}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span className="text-xs text-white/40 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {order.date}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-white text-lg">{order.part}</h3>
                                                <p className="text-sm text-white/60">{order.car}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge status={order.status as StatusType} />
                                                {order.status === 'AWAITING_PAYMENT' && (
                                                    <span className="text-xs text-gold-400 animate-pulse font-medium">
                                                        {order.offersCount} {t.dashboard.orders.newOffers}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-gold-500 transition-all">
                                                <ArrowIcon size={16} />
                                            </div>
                                        </div>

                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Box size={24} className="text-white/20" />
                            </div>
                            <h3 className="text-white font-bold mb-1">{t.dashboard.orders.notFound}</h3>
                            <p className="text-white/40 text-sm">{t.dashboard.orders.notFoundDesc}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
