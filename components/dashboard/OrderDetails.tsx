

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge, StatusType } from '../ui/Badge';
import { StatusTimeline } from '../ui/StatusTimeline';
import { OfferCard } from './OfferCard';
import { ChevronRight, ChevronLeft, Calendar, FileText, Package, Clock, Shield, Truck, Search, MapPin, Star, AlertTriangle, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCheckoutStore } from '../../stores/useCheckoutStore';
import { useChatStore } from '../../stores/useChatStore';
import { useOrderStore, Order } from '../../stores/useOrderStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { TrackingView } from './tracking/TrackingView';
import { ReviewModal } from './reviews/ReviewModal';
import { ReturnRequestModal } from './resolution/ReturnRequestModal';
import { DisputeModal } from './resolution/DisputeModal';

interface OrderDetailsProps {
    orderId: number | null;
    onBack: () => void;
    onNavigate: (path: string, id?: number) => void;
}

const CountdownTimer = ({ targetDate, label }: { targetDate: string, label: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null);
                clearInterval(interval);
            } else {
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ h, m, s });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (!timeLeft) return <span className="text-red-500 font-bold text-xs">Expired</span>;

    return (
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 mb-1">{label}</span>
            <div className="flex gap-1 text-gold-400 font-mono font-bold text-sm">
                <span>{String(timeLeft.h).padStart(2, '0')}</span>:
                <span>{String(timeLeft.m).padStart(2, '0')}</span>:
                <span>{String(timeLeft.s).padStart(2, '0')}</span>
            </div>
        </div>
    );
};

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack, onNavigate }) => {
    const { t, language } = useLanguage();
    const { getOrder, checkSLA, updateOrderStatus } = useOrderStore();
    const { setSelectedOffer } = useCheckoutStore();
    const { openChatForOrder } = useChatStore();
    const { addNotification } = useNotificationStore();

    const [selectedOffer, setSelectedOfferId] = useState<number | null>(null);
    const [showTracking, setShowTracking] = useState(false);

    // Modals
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    // Fetch Order
    const order = getOrder(orderId || 0);

    // Timer Check & Data Refresh
    useEffect(() => {
        // Ensure fresh data on mount (Fixes the "Missing Offers" issue)
        useOrderStore.getState().fetchOrders();
        checkSLA();
    }, [orderId]);

    if (!order) return <div className="text-white text-center py-10">Order not found</div>;

    const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft;

    const handleAcceptOffer = (offer: any) => {
        // 1. Prepare checkout
        setSelectedOffer({
            id: offer.id,
            merchantName: offer.merchantName,
            price: offer.price,
            partName: order.part
        });
        onNavigate('checkout');
    };

    const handleChat = (offer: any) => {
        openChatForOrder(Number(order.id), offer.merchantName, order.part);
        onNavigate('chats');
    };

    // Simulate Delivery Action (Triggers Notification)
    const handleSimulateDelivery = () => {
        const oId = Number(order.id);
        updateOrderStatus(oId, 'DELIVERED');

        // TRIGGER NOTIFICATION
        addNotification({
            type: 'delivery',
            titleKey: 'delivered', // You might need to add this key to translations or use a generic one
            message: language === 'ar'
                ? `تم توصيل طلبك #${oId}. يرجى فحص القطعة وتأكيد الاستلام.`
                : `Order #${oId} has been delivered. Please inspect the part.`,
            orderId: oId,
            linkTo: 'order-details',
            priority: 'urgent'
        });
    };

    // Helper to calculate deadlines
    const getOfferDeadline = () => {
        const d = new Date(order.createdAt);
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    };

    const getPaymentDeadline = () => {
        if (!order.offerAcceptedAt) return '';
        const d = new Date(order.offerAcceptedAt);
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    };

    const getReturnDeadline = () => {
        if (!order.deliveredAt) return '';
        const d = new Date(order.deliveredAt);
        d.setHours(d.getHours() + 48);
        return d.toISOString();
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                orderId={order.id}
                merchantName={order.merchantName || 'Store'}
                partName={order.part}
            />

            <ReturnRequestModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                orderId={order.id}
                merchantName={order.merchantName || 'Store'}
                partName={order.part}
                onSuccess={() => onNavigate('resolution')}
            />

            <DisputeModal
                isOpen={showDisputeModal}
                onClose={() => setShowDisputeModal(false)}
                orderId={order.id}
                merchantName={order.merchantName || 'Store'}
                partName={order.part}
                onSuccess={() => onNavigate('resolution')}
            />

            {/* 1. Header & Timeline Section (Full Width) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                    >
                        <BackIcon size={18} className="group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">{t.dashboard.orders.backToList}</span>
                    </button>

                    {/* Timers */}
                    {order.status === 'AWAITING_OFFERS' && (
                        <CountdownTimer targetDate={getOfferDeadline()} label={t.dashboard.timers.offers_expires} />
                    )}
                    {order.status === 'AWAITING_PAYMENT' && order.offerAcceptedAt && (
                        <CountdownTimer targetDate={getPaymentDeadline()} label={t.dashboard.timers.payment_expires} />
                    )}
                    {order.status === 'DELIVERED' && order.deliveredAt && (
                        <CountdownTimer targetDate={getReturnDeadline()} label={t.dashboard.timers.return_window} />
                    )}
                </div>

                <GlassCard className="p-0 overflow-hidden bg-[#1A1814] border-white/5">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white">{order.part}</h1>
                                <Badge status={order.status} />
                            </div>
                            <div className="text-white/60 text-sm flex items-center gap-2">
                                <span>{(t.dashboard.orders as any).orderId} {order.id}</span>
                                <span>•</span>
                                <span>{order.car}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">

                            {/* Simulating Merchant Actions (For Demo Purposes) */}
                            {order.status === 'PREPARATION' && (
                                <button
                                    onClick={() => updateOrderStatus(Number(order.id), 'SHIPPED')}
                                    className="px-3 py-1 bg-white/5 text-xs rounded border border-white/10 text-white/50 hover:text-white"
                                >
                                    {t.dashboard.orders.simulateShip}
                                </button>
                            )}
                            {order.status === 'SHIPPED' && (
                                <button
                                    onClick={handleSimulateDelivery}
                                    className="px-3 py-1 bg-white/5 text-xs rounded border border-white/10 text-white/50 hover:text-white"
                                >
                                    {t.dashboard.orders.simulateDeliver}
                                </button>
                            )}


                            {/* Review Button */}
                            {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-white border border-gold-500/30 rounded-lg transition-all font-bold text-sm"
                                >
                                    <Star size={16} />
                                    {t.dashboard.reviews.writeTitle}
                                </button>
                            )}

                            {/* Return Button (Only for DELIVERED + within 48h) */}
                            {order.status === 'DELIVERED' && (
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg transition-all font-bold text-sm"
                                >
                                    <RefreshCcw size={16} />
                                    {t.dashboard.resolution.newReturn}
                                </button>
                            )}

                            {/* Dispute Button (For SHIPPED or DELIVERED) */}
                            {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                <button
                                    onClick={() => setShowDisputeModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all font-bold text-sm"
                                >
                                    <AlertTriangle size={16} />
                                    {t.dashboard.resolution.newDispute}
                                </button>
                            )}

                            <div className="text-right hidden md:block border-l border-white/10 pl-4 ml-2">
                                <div className="text-xs text-white/40 mb-1">{(t.dashboard.orders as any).requestDate}</div>
                                <div className="flex items-center gap-2 text-white/80 font-mono text-sm">
                                    <Calendar size={14} />
                                    {order.date}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extended Tracking View Trigger */}
                    {(order.status === 'SHIPPED' || order.status === 'PREPARATION') ? (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <StatusTimeline currentStatus={order.status} />
                            </div>

                            <AnimatePresence>
                                {showTracking && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-white/5 pt-6 mt-6"
                                    >
                                        <TrackingView trackingNumber="TRK-12345678" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-center mt-2">
                                <button
                                    onClick={() => setShowTracking(!showTracking)}
                                    className="flex items-center gap-2 text-gold-400 font-bold hover:text-gold-300 transition-colors text-sm"
                                >
                                    <MapPin size={16} />
                                    {showTracking ? (t.dashboard.orders as any).hideTracking : (t.dashboard.orders as any).viewTracking}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <StatusTimeline currentStatus={order.status} />
                    )}
                </GlassCard>
            </div>

            {/* 2. Main Grid: Actions/Offers (Left) vs Summary (Right) */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Main Content Area (Offers, Tracking, etc) - Spans 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* STATE: AWAITING OFFERS */}
                    {order.status === 'AWAITING_OFFERS' && (
                        <GlassCard className="flex flex-col items-center justify-center text-center py-16 border-dashed border-white/10 bg-white/5">
                            <div className="w-20 h-20 bg-[#1A1814] rounded-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-gold-500 rounded-full opacity-20 animate-ping" />
                                <Search size={32} className="text-gold-400 relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{(t.dashboard.orders as any).searching}</h3>
                            <p className="text-white/50 max-w-md mx-auto mb-8">
                                {(t.dashboard.orders as any).searchingDesc}
                            </p>
                        </GlassCard>
                    )}

                    {/* STATE: AWAITING PAYMENT (Show Offers) */}
                    {(order.status === 'AWAITING_PAYMENT' || order.offers.length > 0) && (
                        <div>
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-gold-500 rounded-full" />
                                {(t.dashboard.orders as any).receivedOffers}
                            </h3>
                            <div className="space-y-4">
                                {/* Render Real Offers from Store */}
                                {order.offers.map((offer) => (
                                    <OfferCard
                                        key={offer.id}
                                        id={offer.id}
                                        storeName={offer.merchantName}
                                        rating={4.8} // Mock for now
                                        reviewCount={120} // Mock for now
                                        price={offer.price}
                                        condition={offer.condition}
                                        warranty={offer.warranty}
                                        deliveryTime={offer.deliveryTime}
                                        offerImage={(offer as any).offerImage} // Pass Image
                                        isSelected={selectedOffer === offer.id}
                                        onAccept={() => {
                                            setSelectedOfferId(offer.id);
                                            handleAcceptOffer(offer);
                                        }}
                                        onChat={() => handleChat(offer)}
                                    />
                                ))}

                                {order.offers.length === 0 && (
                                    <div className="text-center text-white/40 py-8">{(t.dashboard.orders as any).noOffers}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary - Spans 1 col */}
                <div className="space-y-6">
                    <GlassCard className="bg-[#1A1814] border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-6 pb-2 border-b border-white/10">
                            {(t.dashboard.orders as any).vehicleDetails}
                        </h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">{(t.dashboard.orders as any).partName}</div>
                                    <div className="text-white font-medium">{order.part}</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">{(t.dashboard.orders as any).vehicle}</div>
                                    <div className="text-white font-medium">{order.car}</div>
                                    <div className="text-xs text-white/30 font-mono mt-1">{order.vin || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="bg-gradient-to-br from-[#1A1814] to-gold-900/10 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                            <Shield size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">{(t.dashboard.orders as any).supportTitle}</div>
                            <div className="text-xs text-white/40">{(t.dashboard.orders as any).supportDesc}</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};