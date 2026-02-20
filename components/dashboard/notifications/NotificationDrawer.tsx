
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Truck, CheckCircle2, DollarSign, MessageSquare, AlertTriangle, Package, Mail, Smartphone } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNotificationStore, NotificationType } from '../../../stores/useNotificationStore';
import { getCurrentUserId } from '../../../utils/auth';

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string, id?: number) => void;
    role: 'customer' | 'merchant' | 'admin' | string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onNavigate, role }) => {
    const { t, language } = useLanguage();
    const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

    const getIcon = (type: NotificationType | string) => {
        switch (type) {
            case 'OFFER': return <MessageSquare size={18} className="text-blue-400" />;
            case 'ORDER': return <CheckCircle2 size={18} className="text-green-400" />;
            case 'PAYMENT': return <DollarSign size={18} className="text-gold-400" />;
            case 'SHIPPING': return <Truck size={18} className="text-purple-400" />;
            case 'DELIVERED': return <Package size={18} className="text-emerald-400" />;
            case 'RATE': return <Bell size={18} className="text-yellow-400" />;
            case 'DISPUTE': return <AlertTriangle size={18} className="text-red-400" />;
            case 'DOC_EXPIRY': return <AlertTriangle size={18} className="text-orange-400" />;
            case 'SECURITY': return <AlertTriangle size={18} className="text-red-500" />;
            default: return <Bell size={18} />;
        }
    };

    const getTitle = (key: string) => {
        return (t.dashboard.notifications as any)[key] || key;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: language === 'ar' ? '-100%' : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: language === 'ar' ? '-100%' : '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed top-0 bottom-0 ${language === 'ar' ? 'left-0' : 'right-0'} w-full max-w-sm bg-[#1A1814]/95 border-x border-white/10 backdrop-blur-xl z-[70] shadow-2xl flex flex-col`}
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="text-gold-500" size={20} />
                                <h3 className="font-bold text-white text-lg">{t.dashboard.notifications.title}</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-3 border-b border-white/5 bg-white/5 flex justify-end">
                            <button
                                onClick={() => {
                                    const uid = getCurrentUserId();
                                    if (uid) markAllAsRead(uid, role);
                                }}
                                className="text-xs text-gold-400 hover:text-gold-300 font-medium"
                            >
                                {t.dashboard.notifications.markAllRead}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-white/30">
                                    <Bell size={40} className="mb-4 opacity-20" />
                                    <p>{t.dashboard.notifications.empty}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                const uid = getCurrentUserId();
                                                if (uid) markAsRead(notif.id, uid);

                                                if (notif.link) {
                                                    const parts = notif.link.split('/');
                                                    const id = parts[parts.length - 1]; // naive check
                                                    // better:
                                                    onNavigate(notif.link); // DashboardLayout handles path?
                                                    // onNavigate takes (path, id).
                                                    // If link is /dashboard/orders/123
                                                    // path = 'order-details', id = 123
                                                    // I'll parse it or just rely on 'order-details' and orderId from metadata.
                                                    if (notif.metadata?.orderId) {
                                                        onNavigate('order-details', notif.metadata.orderId);
                                                    } else if (notif.link) {
                                                        // If link is just a path name
                                                        onNavigate(notif.link.replace('/', ''));
                                                    }
                                                    onClose();
                                                }
                                            }}
                                            className={`p-4 hover:bg-white/5 cursor-pointer transition-colors relative ${!notif.isRead ? 'bg-gold-500/5' : ''}`}
                                        >
                                            {!notif.isRead && (
                                                <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-2 h-2 rounded-full bg-gold-500`} />
                                            )}
                                            <div className="flex gap-3">
                                                <div className="mt-1 p-2 rounded-full bg-[#0F0E0C] border border-white/10 h-fit">
                                                    {getIcon(notif.type as NotificationType)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-bold mb-1 ${!notif.isRead ? 'text-white' : 'text-white/70'}`}>
                                                        {language === 'ar' ? notif.titleAr : notif.titleEn}
                                                    </h4>
                                                    <p className="text-xs text-white/50 leading-relaxed mb-2">
                                                        {language === 'ar' ? notif.messageAr : notif.messageEn}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] text-white/30 font-mono">
                                                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
