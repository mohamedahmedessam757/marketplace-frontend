

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Box, Calendar, MapPin, ChevronRight, ChevronLeft, Car, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { GlassCard } from '../../ui/GlassCard';
import { SubmitOfferModal } from './SubmitOfferModal';

export const MerchantMarketplace: React.FC = () => {
    const { t, language } = useLanguage();
    const { orders, addOfferToOrder } = useOrderStore();
    const { vendorStatus, storeInfo } = useVendorStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // LICENSE CHECK
    if (vendorStatus === 'LICENSE_EXPIRED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-3">{t.dashboard.merchant.alerts.restricted}</h2>
                    <p className="text-white/60 leading-relaxed">
                        {t.dashboard.merchant.alerts.restrictedDesc}
                    </p>
                </div>
                <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <FileText size={18} />
                    {t.dashboard.merchant.alerts.updateLicense}
                </button>
            </div>
        );
    }

    const openRequests = orders.filter(o =>
        (o.status === 'AWAITING_OFFERS') &&
        (activeFilter === 'all' || o.car.toLowerCase().includes(activeFilter.toLowerCase())) &&
        (o.part.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toString().includes(searchQuery) || o.car.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

    const handleOpenOffer = (request: any) => {
        setSelectedRequest(request);
        setIsOfferModalOpen(true);
    };

    const handleSubmitOffer = (data: any) => {
        if (selectedRequest) {
            addOfferToOrder(selectedRequest.id, {
                merchantName: storeInfo.storeName || 'My Store',
                price: data.price,
                condition: data.condition,
                warranty: data.warranty,
                deliveryTime: data.deliveryTime,
                notes: data.notes
            });
        }
        setIsOfferModalOpen(false);
    };

    const filters = [
        { id: 'all', label: t.dashboard.merchant.marketplace.filters.all },
        { id: 'Toyota', label: t.dashboard.merchant.marketplace.filters.toyota },
        { id: 'Lexus', label: t.dashboard.merchant.marketplace.filters.lexus },
        { id: 'Hyundai', label: t.dashboard.merchant.marketplace.filters.hyundai },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            <SubmitOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                requestDetails={selectedRequest}
                onSubmit={handleSubmitOffer}
            />

            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{t.dashboard.merchant.marketplace.filterTitle}</h1>
                    <p className="text-white/50 text-sm">
                        {isAr ? 'تصفح طلبات العملاء وقدم عروضك المنافسة' : 'Browse customer requests and submit competitive offers'}
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.dashboard.merchant.marketplace.searchPlaceholder}
                            className="w-full bg-[#1A1814] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === f.id ? 'bg-gold-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Requests Feed */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {openRequests.length > 0 ? (
                        openRequests.map((req, idx) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlassCard className="p-5 flex flex-col justify-between h-full bg-[#151310] hover:border-gold-500/30 transition-all group relative overflow-hidden">
                                    {/* Top Border Indicator */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/20 group-hover:bg-gold-500 transition-colors" />

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-gold-400 group-hover:bg-gold-500/10 transition-colors">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gold-400 font-mono bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/10">#{req.id}</span>
                                                    <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {req.date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                                                23h {t.common.left}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{req.part}</h3>
                                        <p className="text-white/60 text-sm mb-4 flex items-center gap-2">
                                            <Car size={14} />
                                            {req.car}
                                        </p>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 p-2 rounded-lg">
                                                <MapPin size={12} />
                                                <span>{t.common.location}</span>
                                            </div>
                                            {req.vin && (
                                                <div className="text-[10px] text-white/30 font-mono px-2">
                                                    VIN: {req.vin}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenOffer(req)}
                                        className="w-full py-3 bg-white/5 hover:bg-gold-500 text-white border border-white/10 hover:border-gold-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>{t.dashboard.merchant.marketplace.makeOffer}</span>
                                        <ArrowIcon size={16} className={`transition-transform ${isAr ? 'group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                            <Box size={40} className="mx-auto mb-4 opacity-20" />
                            <p>{t.dashboard.merchant.marketplace.noRequests}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
