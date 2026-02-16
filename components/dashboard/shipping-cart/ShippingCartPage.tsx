
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CartItem } from './CartItem';
import { GlassCard } from '../../ui/GlassCard';
import { useCartStore } from '../../../stores/useCartStore';

export const ShippingCartPage: React.FC = () => {
    const { t } = useLanguage();
    const { items, loading, fetchCartItems, removeFromCart, shippingMode, setShippingMode, shippingCost } = useCartStore();

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const handleRemove = (id: string) => {
        removeFromCart(id);
    };

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + shippingCost;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShoppingBag className="text-gold-500" size={32} />
                        {t.dashboard.menu.shippingCart}
                    </h1>
                    <p className="text-white/50 mt-2">{t.dashboard.shippingCart.subtitle}</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white/60 text-sm">{t.dashboard.shippingCart.itemsInCart}: </span>
                    <span className="text-gold-500 font-bold ml-1">{items.length}</span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Items List */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <CartItem item={item} onRemove={handleRemove} />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && !loading && (
                        <GlassCard className="text-center py-20 border border-dashed border-white/10">
                            <ShoppingBag className="mx-auto mb-4 text-white/20" size={48} />
                            <p className="text-white/50 font-medium mb-2">{t.dashboard.shippingCart.empty}</p>
                            <p className="text-white/30 text-sm max-w-md mx-auto">
                                {t.dashboard.shippingCart.emptyDesc || 'Items will appear here after accepting an offer from a vendor. Browse your orders and accept offers to add items to your cart.'}
                            </p>
                        </GlassCard>
                    )}
                </div>

                {/* Summary Panel */}
                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6 sticky top-24">
                        <h3 className="text-xl font-bold text-white">{t.dashboard.shippingCart.summary}</h3>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <div className="flex justify-between text-white/60">
                                <span>{t.dashboard.shippingCart.subtotal}</span>
                                <span>{subtotal.toFixed(2)} SAR</span>
                            </div>

                            {/* Shipping Toggle */}
                            <div className="py-3">
                                <label className="flex items-center justify-between cursor-pointer mb-2">
                                    <span className="text-sm text-white/80 font-medium">{t.dashboard.shippingCart.modes?.title || 'Shipping Mode'}</span>
                                    <div className="flex bg-white/10 rounded-lg p-1">
                                        <button
                                            onClick={() => setShippingMode('separate')}
                                            className={`px-3 py-1 text-xs rounded-md transition-all ${shippingMode === 'separate' ? 'bg-gold-500 text-black font-bold' : 'text-white/50 hover:text-white'}`}
                                        >
                                            {t.dashboard.shippingCart.modes?.faster || 'Faster'}
                                        </button>
                                        <button
                                            onClick={() => setShippingMode('combined')}
                                            className={`px-3 py-1 text-xs rounded-md transition-all ${shippingMode === 'combined' ? 'bg-gold-500 text-black font-bold' : 'text-white/50 hover:text-white'}`}
                                        >
                                            {t.dashboard.shippingCart.modes?.cheaper || 'Cheaper'}
                                        </button>
                                    </div>
                                </label>
                                <p className="text-xs text-white/40 mb-2">
                                    {shippingMode === 'separate'
                                        ? (t.dashboard.shippingCart.modes?.fasterDesc || 'Items shipped as they arrive (Faster)')
                                        : (t.dashboard.shippingCart.modes?.cheaperDesc || 'Items shipped together in one box (Ecofriendly & Cheaper)')}
                                </p>
                            </div>

                            <div className="flex justify-between text-white/60">
                                <span>{t.dashboard.shippingCart.shippingEst}</span>
                                <span className={shippingMode === 'combined' ? 'text-green-400' : 'text-gold-500'}>
                                    {shippingCost.toFixed(2)} SAR
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                            <span>{t.dashboard.shippingCart.total}</span>
                            <span>{total.toFixed(2)} SAR</span>
                        </div>

                        <button
                            disabled={items.length === 0}
                            className="w-full py-4 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {t.dashboard.shippingCart.proceed}
                            <ArrowRight size={20} />
                        </button>

                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p>{t.dashboard.shippingCart.timerNote}</p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
