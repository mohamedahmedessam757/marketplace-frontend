
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { Badge, StatusType } from '../../ui/Badge';
import { RefreshCw, RotateCcw, AlertTriangle, ChevronRight, ChevronLeft, Box, FileText, Upload, Package } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useReturnsStore } from '../../../stores/useReturnsStore';
import { Order } from '../../../types';

interface ReturnsExchangePageProps {
    onNavigate: (path: string) => void;
}

export const ReturnsExchangePage: React.FC<ReturnsExchangePageProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { returns, disputes, loading, fetchReturnsAndDisputes, cancelReturn } = useReturnsStore();
    const [activeTab, setActiveTab] = useState<'returns' | 'disputes' | 'guidelines'>('returns');

    useEffect(() => {
        fetchReturnsAndDisputes();
    }, [fetchReturnsAndDisputes]);

    const ArrowIcon = language === 'ar' ? ChevronLeft : ChevronRight;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.menu.returns}</h1>
                <p className="text-white/50">{t.dashboard.returns.subtitle}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('returns')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'returns'
                        ? 'bg-gold-500 text-black font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <RotateCcw size={18} />
                    {t.dashboard.returns.tabs.activeReturns}
                    {returns.length > 0 && (
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {returns.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('disputes')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'disputes'
                        ? 'bg-red-500 text-white font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <AlertTriangle size={18} />
                    {t.dashboard.returns.tabs.disputes}
                    {disputes.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {disputes.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('guidelines')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'guidelines'
                        ? 'bg-blue-500 text-white font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Package size={18} />
                    {t.dashboard.returns.tabs.guidelines}
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="text-center py-20">
                        <RefreshCw className="animate-spin mx-auto text-gold-500 mb-4" size={32} />
                        <p className="text-white/50">Loading...</p>
                    </div>
                ) : activeTab === 'returns' ? (
                    <motion.div
                        key="returns"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {returns.length > 0 ? (
                            returns.map((order) => (
                                <ReturnCard key={order.id} order={order} type="return" onCancel={cancelReturn} t={t} language={language} ArrowIcon={ArrowIcon} />
                            ))
                        ) : (
                            <EmptyState
                                icon={RotateCcw}
                                title={t.dashboard.returns.noReturns}
                                desc={t.dashboard.returns.noReturnsDesc}
                            />
                        )}
                    </motion.div>
                ) : activeTab === 'disputes' ? (
                    <motion.div
                        key="disputes"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {disputes.length > 0 ? (
                            disputes.map((order) => (
                                <ReturnCard key={order.id} order={order} type="dispute" t={t} language={language} ArrowIcon={ArrowIcon} />
                            ))
                        ) : (
                            <EmptyState
                                icon={AlertTriangle}
                                title={t.dashboard.returns.noDisputes}
                                desc={t.dashboard.returns.noDisputesDesc}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="guidelines"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Box className="text-gold-500" />
                                {t.dashboard.resolution.guidelines?.packaging || 'Packaging Instructions'}
                            </h3>
                            <ul className="space-y-3 text-white/70">
                                {t.dashboard.resolution.guidelines?.steps?.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="text-gold-500" />
                                {t.dashboard.resolution.guidelines?.title || 'Return Policy Highlights'}
                            </h3>
                            <ul className="space-y-3 text-white/70">
                                {t.dashboard.resolution.guidelines?.highlights?.map((highlight: string, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Components

const ReturnCard = ({ order, type, onCancel, t, language, ArrowIcon }: any) => (
    <GlassCard className={`p-6 border-l-4 ${type === 'dispute' ? 'border-l-red-500' : 'border-l-gold-500'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${type === 'dispute' ? 'bg-red-500/10 text-red-500' : 'bg-gold-500/10 text-gold-500'}`}>
                    {type === 'dispute' ? <AlertTriangle size={24} /> : <RotateCcw size={24} />}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-white/40">#{order.order_number}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-xs text-white/40">{new Date(order.updated_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg">{order.part_name}</h3>
                    <p className="text-sm text-white/60">{order.vehicle_make} {order.vehicle_model}</p>
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                <div className="text-right">
                    <Badge status={order.status} />
                    <p className="text-xs text-white/30 mt-2">
                        {type === 'dispute' ? 'Under Review' : 'Return Requested'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {type === 'return' && onCancel && order.status === 'RETURN_REQUESTED' && (
                        <button
                            onClick={() => onCancel(order.id)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
                        >
                            Cancel Return
                        </button>
                    )}
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500 hover:text-black transition-colors">
                        <ArrowIcon size={18} />
                    </button>
                </div>
            </div>
        </div>
    </GlassCard>
);

const EmptyState = ({ icon: Icon, title, desc }: any) => (
    <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon size={24} className="text-white/20" />
        </div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-white/40 text-sm max-w-sm mx-auto">{desc}</p>
    </div>
);

// Add missing icon
import { CheckCircle } from 'lucide-react';
