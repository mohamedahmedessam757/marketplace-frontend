
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { Box, MapPin, Calendar, ArrowRight, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ShipmentTracker } from './ShipmentTracker';
import { AnimatePresence, motion } from 'framer-motion';

export interface Shipment {
    id: string;
    trackingNumber: string;
    carrier: string;
    carrierLogo?: string;
    status: 'received' | 'transit' | 'distribution' | 'out' | 'delivered';
    estimatedDelivery: string;
    origin: string;
    destination: string;
    items: { name: string; quantity: number; image?: string }[];
}

interface ShipmentCardProps {
    shipment: Shipment;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    return (
        <GlassCard className="relative overflow-hidden group">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* ID & Carrier */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <Box className="text-gold-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">#{shipment.trackingNumber}</h3>
                        <p className="text-sm text-white/50">{shipment.carrier}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${shipment.status === 'delivered'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-gold-500/10 border-gold-500/20 text-gold-400'
                        }`}>
                        {t.dashboard.tracking.steps[shipment.status]}
                    </div>
                </div>

                {/* Date & Action */}
                <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-white/30">{t.dashboard.tracking.estimated}</p>
                        <p className="text-sm font-medium text-white">{shipment.estimatedDelivery}</p>
                    </div>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                    >
                        {expanded ? t.dashboard.actions.hideTracking : t.dashboard.actions.viewTracking}
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 mt-6 border-t border-white/5 space-y-8">

                            {/* Visual Tracker */}
                            <ShipmentTracker status={shipment.status} />

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
                                        <MapPin size={16} className="text-gold-500" />
                                        {t.dashboard.shipments.routeDetails}
                                    </h4>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/40">{shipment.origin}</span>
                                        <ArrowRight size={14} className="text-white/20" />
                                        <span className="text-white/40">{shipment.destination}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
                                        <Package size={16} className="text-gold-500" />
                                        {t.dashboard.shipments.items}
                                    </h4>
                                    <div className="space-y-2">
                                        {shipment.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-white/60">{item.name}</span>
                                                <span className="text-white/30">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};
