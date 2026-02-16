
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowLeft } from 'lucide-react';
import { ShipmentCard } from './ShipmentCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useShipmentsStore } from '../../../stores/useShipmentsStore';
import { useEffect } from 'react';

export const ShipmentsPage: React.FC = () => {
    const { t } = useLanguage();

    const { shipments, loading, fetchShipments } = useShipmentsStore();

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Truck className="text-gold-500" size={32} />
                        {t.dashboard.menu.shipments}
                    </h1>
                    <p className="text-white/50 mt-2">{t.dashboard.shipments.subtitle}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {shipments.map((shipment, index) => (
                    <motion.div
                        key={shipment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ShipmentCard shipment={shipment} />
                    </motion.div>
                ))}

                {shipments.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <Truck className="mx-auto text-white/20 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white/50">{t.dashboard.shipments.noShipments}</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
