import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Gavel, 
    AlertTriangle, 
    CreditCard, 
    X, 
    ExternalLink, 
    Info,
    ShieldAlert
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { GlassCard } from '../../ui/GlassCard';
import { useNotificationStore, Notification } from '../../../stores/useNotificationStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface VerdictPopUpProps {
    onNavigate?: (path: string, id?: any) => void;
}

export const VerdictPopUp: React.FC<VerdictPopUpProps> = ({ onNavigate }) => {
    const { notifications, markAsRead } = useNotificationStore();
    const { language } = useLanguage();
    const isAr = language === 'ar';
    
    const [currentPopUp, setCurrentPopUp] = useState<Notification | null>(null);

    useEffect(() => {
        // Find latest unread DISPUTE notification that hasn't been shown yet
        const unreadVerdicts = notifications.filter(n => n.type === 'DISPUTE' && !n.isRead);
        if (unreadVerdicts.length > 0 && !currentPopUp) {
            setCurrentPopUp(unreadVerdicts[0]);
        }
    }, [notifications, currentPopUp]);

    const handleClose = () => {
        if (currentPopUp) {
            markAsRead(currentPopUp.id, currentPopUp.recipientId);
            setCurrentPopUp(null);
        }
    };

    const handleAction = () => {
        if (currentPopUp?.link && onNavigate) {
            // Check if link contains an ID (e.g. "dispute-details/123")
            // The project navigation pattern usually separates path and ID
            const parts = currentPopUp.link.split('/');
            const path = parts[0];
            const id = parts[1] ? parts[1] : undefined;
            
            onNavigate(path, id);
            handleClose();
        }
    };

    if (!currentPopUp) return null;

    const isPayee = currentPopUp.metadata?.isPayee;
    const shippingCost = currentPopUp.metadata?.shippingCost;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-lg"
                >
                    <GlassCard className={`relative overflow-hidden border-2 p-8 ${isPayee ? 'border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]' : 'border-cyan-500/30'}`}>
                        {/* Status Icon */}
                        <div className={`absolute top-0 right-0 p-12 opacity-10 ${isPayee ? 'text-red-500' : 'text-cyan-500'}`}>
                            <Gavel size={160} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isPayee ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                    {isPayee ? <ShieldAlert size={14} /> : <Info size={14} />}
                                    {isAr ? 'حكم إداري نهائي' : 'Final Administrative Verdict'}
                                </div>
                                <button onClick={handleClose} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                                    {isAr ? currentPopUp.titleAr : currentPopUp.titleEn}
                                </h2>
                                <p className="text-white/60 font-medium leading-relaxed whitespace-pre-wrap">
                                    {isAr ? currentPopUp.messageAr : currentPopUp.messageEn}
                                </p>
                            </div>

                            {isPayee && shippingCost > 0 && (
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-black">
                                                <AlertTriangle size={16} />
                                            </div>
                                            <span className="text-xs font-black text-red-400 uppercase tracking-widest">
                                                {isAr ? 'مبلغ السداد المطلوب' : 'Required Payment'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-white">{shippingCost}</span>
                                            <span className="ml-1 text-[10px] font-bold text-white/40">AED</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-red-400/60 font-bold leading-relaxed uppercase">
                                        {isAr 
                                            ? 'تحذير: سيؤدي التأخر في السداد إلى تجميد مستحقاتك أو إغلاق الحساب بشكل دائم.' 
                                            : 'Warning: Delayed payment will lead to fund freezing or permanent account closure.'}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button 
                                    onClick={handleAction}
                                    className={`flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${isPayee ? 'bg-red-500 text-black hover:bg-red-400' : 'bg-white text-black hover:bg-zinc-200'}`}
                                >
                                    {isPayee ? <CreditCard size={14} className="mr-2" /> : <ExternalLink size={14} className="mr-2" />}
                                    {isAr ? 'عرض التفاصيل والسداد' : 'View Details & Pay'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleClose}
                                    className="px-8 border-white/10 text-white/40 hover:text-white hover:border-white/20 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-2xl"
                                >
                                    {isAr ? 'فهمت' : 'Understood'}
                                </Button>
                            </div>
                        </div>

                        {/* Animated Border Accent */}
                        <motion.div 
                            className={`absolute inset-0 border-2 rounded-[inherit] pointer-events-none ${isPayee ? 'border-red-500/50' : 'border-cyan-500/50'}`}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
