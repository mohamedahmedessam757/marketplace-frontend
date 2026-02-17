

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Filter, CheckCircle2, AlertTriangle, DollarSign, Package, MessageSquare, Truck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNotificationStore, NotificationType } from '../../../stores/useNotificationStore';
import { getCurrentUserId } from '../../../utils/auth';

export const MerchantNotifications: React.FC = () => {
    const { t, language } = useLanguage();
    const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
    const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

    const isAr = language === 'ar';

    const getIcon = (type: NotificationType | string) => {
        switch (type) {
            case 'PAYMENT': return <DollarSign size={20} className="text-gold-400" />;
            case 'OFFER': return <Package size={20} className="text-blue-400" />;
            case 'DISPUTE': return <AlertTriangle size={20} className="text-red-400" />;
            case 'DOC_EXPIRY': return <AlertTriangle size={20} className="text-orange-400" />;
            case 'ORDER': return <CheckCircle2 size={20} className="text-green-400" />;
            case 'SHIPPING': return <Truck size={20} className="text-purple-400" />;
            default: return <Bell size={20} className="text-white/60" />;
        }
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'alerts') return n.type === 'DISPUTE' || n.type === 'PAYMENT' || n.type === 'DOC_EXPIRY';
        return true;
    });

    const handleMarkAllRead = () => {
        const uid = getCurrentUserId();
        if (uid) markAllAsRead(uid);
    };

    const handleMarkRead = (id: string) => {
        const uid = getCurrentUserId();
        if (uid) markAsRead(id, uid);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.merchant.notifications.title}</h1>
                    <p className="text-white/50 text-sm">Stay updated with your store activities</p>
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-sm"
                >
                    <CheckCircle2 size={16} />
                    {t.dashboard.merchant.notifications.markAllRead}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: isAr ? 'الكل' : 'All' },
                    { id: 'unread', label: isAr ? 'غير مقروءة' : 'Unread' },
                    { id: 'alerts', label: isAr ? 'تنبيهات هامة' : 'Important Alerts' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === f.id ? 'bg-gold-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredNotifs.length > 0 ? (
                        filteredNotifs.map((notif) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                onClick={() => handleMarkRead(notif.id)}
                                className={`
                                p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 group
                                ${!notif.isRead
                                        ? 'bg-[#1A1814] border-gold-500/30 shadow-[inset_0_0_20px_rgba(168,139,62,0.05)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}
                            `}
                            >
                                <div className={`p-3 rounded-full bg-[#0F0E0C] border border-white/10 shrink-0 ${!notif.isRead ? 'animate-pulse' : ''}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-white' : 'text-white/60'}`}>
                                            {isAr ? notif.titleAr : notif.titleEn}
                                        </h4>
                                        <span className="text-[10px] text-white/30 font-mono whitespace-nowrap">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/80 mb-1">
                                        {isAr ? notif.messageAr : notif.messageEn}
                                    </p>
                                    {notif.metadata?.orderId && (
                                        <p className="text-xs text-white/40 line-clamp-1">
                                            {isAr ? `رقم الطلب #${notif.metadata.orderId}` : `Order #${notif.metadata.orderId}`}
                                        </p>
                                    )}
                                </div>
                                {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 shrink-0" />
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                            <Bell size={40} className="mx-auto mb-4 opacity-20" />
                            <p>{t.dashboard.merchant.notifications.empty}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};
