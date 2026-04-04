import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Info, PackageCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CartItem } from './CartItem';
import { GlassCard } from '../../ui/GlassCard';
import { useCartStore } from '../../../stores/useCartStore';
import { getCurrentUserId } from '../../../utils/auth';

export const ShippingCartPage: React.FC = () => {
    const { t } = useLanguage();
    const { items, loading, fetchCartItems, requestShipping, requestingShipping, subscribeToRealtime, unsubscribeFromRealtime } = useCartStore();

    useEffect(() => {
        fetchCartItems();
        subscribeToRealtime(getCurrentUserId() || undefined);
        return () => unsubscribeFromRealtime();
    }, [fetchCartItems, subscribeToRealtime, unsubscribeFromRealtime]);

    const handleRequestShipping = async () => {
        if (items.length === 0) return;
        const success = await requestShipping(items.map(i => i.id));
        if (success) {
            window.history.pushState({ view: 'dashboard', dashboardPath: 'shipments' }, '', '/dashboard/shipments');
            window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'dashboard', dashboardPath: 'shipments' } }));
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-56 md:pb-48">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <PackageCheck className="text-gold-500" size={32} />
                        {t.dashboard.menu.shippingCart}
                    </h1>
                    <p className="text-white/50 mt-2">{t.dashboard.shippingCart.subtitle}</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white/60 text-sm">{t.dashboard.shippingCart.itemsInCart}: </span>
                    <span className="text-gold-500 font-bold ml-1">{items.length}</span>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            key={`${item.id}-${item.offerId}`}
                            layout
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        >
                            <CartItem item={item} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && !loading && (
                    <GlassCard className="text-center py-20 border border-dashed border-white/10">
                        <ShoppingBag className="mx-auto mb-4 text-white/20" size={48} />
                        <p className="text-white/50 font-medium mb-2">{t.dashboard.shippingCart.empty}</p>
                        <p className="text-white/30 text-sm max-w-md mx-auto">
                            {t.dashboard.shippingCart.emptyDesc}
                        </p>
                    </GlassCard>
                )}
            </div>

            {/* Bottom Floating Bar */}
            {items.length > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a]/95 backdrop-blur-2xl border-t border-white/10 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                    <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full">
                            <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs sm:text-sm text-blue-300/90 shadow-inner">
                                <Info size={20} className="shrink-0 text-blue-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-blue-200">{t.dashboard.shippingCart.timerNote}</p>
                                    <p className="opacity-80 leading-relaxed font-medium">{t.dashboard.shippingCart.autoShipNote}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestShipping}
                            disabled={requestingShipping || items.length === 0}
                            className="w-full sm:w-auto px-10 py-4 bg-gold-500 text-black font-extrabold rounded-xl hover:bg-gold-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 whitespace-nowrap shadow-[0_0_20px_rgba(168,139,62,0.3)] group"
                        >
                            <span>{requestingShipping ? t.common.loading : t.dashboard.shippingCart.requestShipping}</span>
                            {!requestingShipping && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
