
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { useOrderStore, Order } from '../../../stores/useOrderStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OrderSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (order: Order, type: 'return' | 'dispute') => void;
}

export const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { orders, isLoading } = useOrderStore();
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

    // Filter eligible orders: DELIVERED and within 48h
    const eligibleOrders = orders.filter(order => {
        if (order.status !== 'DELIVERED') return false;
        
        const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
        const now = new Date();
        const diffHours = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60);
        
        return diffHours <= 48;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl relative z-10"
                    >
                        <GlassCard className="p-0 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                        {t.dashboard.resolution.initiate.title}
                                    </h2>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                                        {t.dashboard.resolution.initiate.selectOrder}
                                    </p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-white/40" />
                                </button>
                            </div>

                            {/* List Content */}
                            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4 no-scrollbar">
                                {isLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center space-y-4 text-white/20">
                                        <div className="w-12 h-12 border-2 border-white/10 border-t-gold-500 rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing History...</span>
                                    </div>
                                ) : eligibleOrders.length === 0 ? (
                                    <div className="py-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                            <ShieldAlert size={32} className="text-white/20" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase">{t.dashboard.resolution.initiate.noEligible}</h3>
                                            <p className="text-white/30 text-sm max-w-xs mx-auto mt-2 leading-relaxed font-medium">
                                                {t.dashboard.resolution.initiate.noEligibleDesc}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    eligibleOrders.map((order) => (
                                        <motion.div
                                            key={order.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-gold-500/30 transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white/40 group-hover:text-gold-400 transition-colors">
                                                        <Package size={28} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">ORDER #{order.orderNumber}</span>
                                                            <div className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-black rounded-full border border-green-500/20">DELIVERED</div>
                                                        </div>
                                                        <h4 className="text-lg font-black text-white">{order.part}</h4>
                                                        <p className="text-white/40 text-[10px] font-bold uppercase flex items-center gap-2 mt-1">
                                                            <Clock size={12} /> {new Date(order.deliveredAt || order.updatedAt).toLocaleString()}
                                                        </p>
                                                        {((new Date().getTime() - new Date(order.deliveredAt || order.updatedAt).getTime()) / (1000 * 60 * 60)) <= 24 && (
                                                            <div className="mt-2 text-[8px] font-black text-green-400 uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-full inline-block border border-green-500/20">
                                                                DISPUTE ELIGIBLE (within 24h)
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => onSelect(order, 'return')}
                                                        className="px-4 py-2 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                                                    >
                                                        {t.dashboard.resolution.initiate.returnItem}
                                                    </button>
                                                    
                                                    {(() => {
                                                        const diffHours = (new Date().getTime() - new Date(order.deliveredAt || order.updatedAt).getTime()) / (1000 * 60 * 60);
                                                        const canDispute = diffHours <= 24;
                                                        
                                                        return (
                                                            <button 
                                                                onClick={() => canDispute && onSelect(order, 'dispute')}
                                                                disabled={!canDispute}
                                                                className={`
                                                                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                                                    ${canDispute 
                                                                        ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20' 
                                                                        : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed opacity-50'
                                                                    }
                                                                `}
                                                            >
                                                                {t.dashboard.resolution.initiate.openDispute}
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            
                                            {/* Decorative Background Gradient */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[60px] pointer-events-none group-hover:bg-gold-500/10 transition-all" />
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer Note */}
                            <div className="p-6 bg-black/40 border-t border-white/5">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center border border-gold-500/20">
                                        <CheckCircle2 size={20} className="text-gold-400" />
                                    </div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed">
                                        {t.dashboard.resolution.returnPolicy}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </AnimatePresence>
    );
};
