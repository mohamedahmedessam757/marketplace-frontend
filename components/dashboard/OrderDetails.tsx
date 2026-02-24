

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge, StatusType } from '../ui/Badge';
import { StatusTimeline } from '../ui/StatusTimeline';
import { OfferCard } from './OfferCard';
import { ChevronRight, ChevronLeft, Calendar, FileText, Package, Clock, Shield, Truck, Search, MapPin, Star, AlertTriangle, RefreshCcw, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCheckoutStore } from '../../stores/useCheckoutStore';
import { useChatStore } from '../../stores/useChatStore';
import { useOrderStore, Order } from '../../stores/useOrderStore';
import { useOrderChatStore } from '../../stores/useOrderChatStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { TrackingView } from './tracking/TrackingView';
import { ReviewModal } from './reviews/ReviewModal';
import { ReturnRequestModal } from './resolution/ReturnRequestModal';
import { DisputeModal } from './resolution/DisputeModal';
import { OrderExpiredModal } from './OrderExpiredModal';

interface OrderDetailsProps {
    orderId: string | null;
    onBack: () => void;
    onNavigate: (path: string, id?: any) => void;
}

export const CountdownTimer = ({ targetDate, label, compact = false }: { targetDate: string, label?: string, compact?: boolean }) => {
    const { t } = useLanguage();
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

    if (!timeLeft) return <span className="text-red-500 font-bold text-xs">{t.dashboard.common?.expired || 'Expired'}</span>;

    return (
        <div className={`flex ${compact ? 'flex-row items-center gap-2' : 'flex-col items-end'}`}>
            {label && <span className={`${compact ? 'text-xs text-white/60' : 'text-[10px] text-white/40 mb-1'}`}>{label}</span>}
            <div className={`flex gap-1 text-gold-400 font-mono font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
                {compact && <Clock size={12} className="text-white/40 mr-1" />}
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
    const [isLoadingSupport, setIsLoadingSupport] = useState(false);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Fetch Order
    const order = getOrder(orderId || '');

    // Show Expired Modal Logic
    useEffect(() => {
        if (!order || order.status !== 'CANCELLED') return;

        // Only show if it was cancelled AND has no offers (indicating it expired via cron job 24h limit)
        const hasNoOffers = !order.offers || order.offers.length === 0;
        if (!hasNoOffers) return;

        const storageKey = `expired_modal_seen_${order.id}`;
        if (!localStorage.getItem(storageKey)) {
            // Small timeout to allow transition to finish
            const timer = setTimeout(() => setShowExpiredModal(true), 500);
            return () => clearTimeout(timer);
        }
    }, [order]);

    const handleCloseExpiredModal = (dontShowAgain: boolean) => {
        if (dontShowAgain && order) {
            localStorage.setItem(`expired_modal_seen_${order.id}`, 'true');
        }
        setShowExpiredModal(false);
    };

    // Timer Check & Data Refresh
    useEffect(() => {
        // Ensure fresh data on mount (Fixes the "Missing Offers" issue)
        useOrderStore.getState().fetchOrders();
        checkSLA();
    }, [orderId]);

    if (!order) return <div className="text-white text-center py-10">{t.dashboard.common?.notFound || 'Order not found'}</div>;

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
        openChatForOrder(String(order.id), offer.merchantName, order.part);
        onNavigate('chats');
    };

    const handleSupportClick = async () => {
        setIsLoadingSupport(true);
        try {
            const subject = `${language === 'ar' ? 'طلب رقم' : 'Order'} #${order.id}`;
            const message = `${language === 'ar' ? 'أحتاج مساعدة بخصوص طلبي' : 'I need help with my order'} (${order.part})`;

            // Launch directly via unified chat store
            await useOrderChatStore.getState().createSupportChat(subject, message, String(order.id));

            onNavigate('chats');
        } catch (err) {
            console.error('Failed to launch support chat', err);
        } finally {
            setIsLoadingSupport(false);
        }
    };

    // Helper to calculate deadlines
    const getOfferDeadline = () => {
        const d = new Date(order.createdAt || order.date); // Fallback to date if createdAt missing
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    };

    const isOrderExpired = () => {
        if (order.status === 'CANCELLED') return true;
        if (order.status !== 'AWAITING_OFFERS') return false;
        const deadline = new Date(getOfferDeadline()).getTime();
        return new Date().getTime() > deadline;
    };

    const isExpired = isOrderExpired();

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

            <OrderExpiredModal
                isOpen={showExpiredModal}
                orderId={order.id}
                onClose={handleCloseExpiredModal}
            />

            {/* Lightbox Viewer */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={lightboxImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox Viewer */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={lightboxImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

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
                                <h1 className="text-2xl font-bold text-white">
                                    {(order.parts && order.parts.length > 1)
                                        ? (language === 'ar' ? `طلبية متعددة (${order.parts.length} قطع)` : `Multi-Part Order (${order.parts.length} items)`)
                                        : order.part}
                                </h1>
                                <Badge status={order.status} />
                            </div>
                            <div className="text-white/60 text-sm flex items-center gap-2">
                                <span>{(t.dashboard.orders as any).orderId} {order.id}</span>
                                <span>•</span>
                                <span>{order.car}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">

                            {/* Simulation buttons removed for production/customer view */}


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

                            {/* Return Button (SHIPPED or DELIVERED) */}
                            {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
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

                    {/* Requested Parts List */}
                    {(order.parts && order.parts.length > 0) && (
                        <div className="space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-gold-500 rounded-full" />
                                {language === 'ar' ? 'القطع المطلوبة' : 'Requested Parts'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {order.parts.map((p, idx) => (
                                    <GlassCard key={p.id || idx} className="p-4 border-white/5 bg-[#1A1814] flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-white">{p.name}</h4>
                                                <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">Part {idx + 1}</span>
                                            </div>
                                            {p.description && <p className="text-white/60 text-sm mb-3 line-clamp-2">{p.description}</p>}
                                        </div>

                                        {p.images && p.images.length > 0 && (
                                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mt-2">
                                                {p.images.map((img: any, i: number) => {
                                                    const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => setLightboxImage(src)}
                                                            className="shrink-0 relative group rounded-lg overflow-hidden border border-white/10 hover:border-gold-500/50 transition-colors cursor-zoom-in"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={p.name}
                                                                className="w-16 h-16 object-cover transition-transform group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <Search size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STATE: AWAITING OFFERS */}
                    {order.status === 'AWAITING_OFFERS' && !isExpired && (
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

                    {/* STATE: EXPIRED */}
                    {isExpired && (
                        <GlassCard className="flex flex-col items-center justify-center text-center py-16 border border-red-500/20 bg-red-500/5">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                <AlertTriangle size={32} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{language === 'ar' ? 'انتهت صلاحية الطلب' : 'Request Expired'}</h3>
                            <p className="text-white/50 max-w-md mx-auto mb-8">
                                {language === 'ar'
                                    ? 'لم يتم استلام عروض خلال 24 ساعة. يرجى إنشاء طلب جديد.'
                                    : 'No offers received within 24 hours. Please create a new request.'}
                            </p>
                        </GlassCard>
                    )}

                    {/* STATE: AWAITING PAYMENT (Show Offers) */}
                    {(order.status === 'AWAITING_PAYMENT' || ((order.status === 'AWAITING_OFFERS' || order.status === 'CANCELLED') && order.offers.length > 0)) && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-gold-500 rounded-full" />
                                    {(t.dashboard.orders as any).receivedOffers}
                                </h3>
                                {isExpired && (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded border border-red-500/20">
                                        {language === 'ar' ? 'منتهى الصلاحية' : 'EXPIRED'}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Render Real Offers from Store */}
                                {order.offers.map((offer) => {
                                    // Check if specific offer is expired (>24h) OR Order is expired/cancelled
                                    const offerTime = new Date(offer.submittedAt).getTime();
                                    const isOfferOld = (new Date().getTime() - offerTime) > (24 * 60 * 60 * 1000);
                                    const isOfferExpired = isExpired || order.status === 'CANCELLED' || isOfferOld;

                                    return (
                                        <div key={offer.id} className="relative">
                                            {isOfferExpired && (
                                                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center cursor-not-allowed border border-white/5">
                                                    <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 text-white/50 text-xs font-bold flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {language === 'ar' ? 'عرض منتهي' : 'Offer Expired'}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={isOfferExpired ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}>
                                                <OfferCard
                                                    id={offer.id}
                                                    storeName={offer.merchantName}
                                                    rating={(offer as any).storeRating || 0}
                                                    reviewCount={(offer as any).storeReviewCount || 0}
                                                    storeLogo={(offer as any).storeLogo}
                                                    storeCity={(offer as any).storeCity}
                                                    notes={offer.notes}
                                                    isShippingIncluded={(offer as any).isShippingIncluded}
                                                    weight={(offer as any).weight}
                                                    partType={(offer as any).partType}
                                                    price={offer.price}
                                                    unitPrice={(offer as any).unitPrice || offer.price}
                                                    condition={offer.condition}
                                                    warranty={offer.warranty}
                                                    deliveryTime={offer.deliveryTime}
                                                    offerImage={(offer as any).offerImage}
                                                    isSelected={selectedOffer === offer.id}
                                                    onAccept={() => {
                                                        if (isOfferExpired) return;
                                                        setSelectedOfferId(offer.id);
                                                        handleAcceptOffer(offer);
                                                    }}
                                                    onChat={() => {
                                                        if (isOfferExpired) return;
                                                        handleChat(offer);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

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
                            {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                        </h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">{language === 'ar' ? 'القطع المطلوبة' : 'Requested Parts'}</div>
                                    <div className="text-white font-medium">
                                        {(order.parts && order.parts.length > 1)
                                            ? (language === 'ar' ? `طلبية متعددة (${order.parts.length} قطع)` : `Multi-Part Order (${order.parts.length} items)`)
                                            : order.part}
                                    </div>
                                    <div className="text-xs text-white/40 mt-1">
                                        {language === 'ar' ? 'الحالة: ' : 'Condition: '}
                                        <span className="text-white border px-1.5 py-0.5 rounded border-white/10 ml-1">
                                            {order.preferences?.condition === 'new'
                                                ? (language === 'ar' ? 'جديد' : 'New')
                                                : (language === 'ar' ? 'مستعمل' : 'Used')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">{language === 'ar' ? 'المركبة المعنية' : 'Target Vehicle'}</div>
                                    <div className="text-white font-medium">{order.car}</div>
                                    <div className="text-xs text-white/30 font-mono mt-1">VIN: {order.vin || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-1">{language === 'ar' ? 'التسليم والدفع' : 'Delivery & Payment'}</div>
                                    <div className="text-white text-sm">
                                        {language === 'ar' ? 'الطلب: ' : 'Request: '}
                                        <span className="font-bold text-gold-400">
                                            {order.requestType === 'multiple' ? (language === 'ar' ? 'عدة قطع' : 'Multiple Parts') : (language === 'ar' ? 'قطعة واحدة' : 'Single Part')}
                                        </span>
                                    </div>
                                    <div className="text-white/60 text-xs mt-1 mb-2">
                                        {language === 'ar' ? 'الشحن: ' : 'Shipping: '}
                                        <span>
                                            {order.shippingType === 'combined'
                                                ? (language === 'ar' ? '(عدة قطع) تجميع الطلبات' : '(Multiple) Combined Delivery')
                                                : (order.requestType === 'multiple'
                                                    ? (language === 'ar' ? '(عدة قطع) كل طلب فى شحنه لوحده' : '(Multiple) Separate Delivery')
                                                    : (language === 'ar' ? '(قطعة واحدة) شحن كل قطعة لوحدها' : '(Single) Direct Delivery')
                                                )
                                            }
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${order.status === 'AWAITING_OFFERS' || order.status === 'AWAITING_PAYMENT' || order.status === 'CANCELLED' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                        <span className={`text-xs font-bold ${order.status === 'AWAITING_OFFERS' || order.status === 'AWAITING_PAYMENT' || order.status === 'CANCELLED' ? 'text-red-400' : 'text-green-400'}`}>
                                            {order.status === 'AWAITING_OFFERS' || order.status === 'AWAITING_PAYMENT' || order.status === 'CANCELLED'
                                                ? (language === 'ar' ? 'لم يتم الدفع' : 'Not Paid')
                                                : (language === 'ar' ? 'تم الدفع بنجاح' : 'Paid Successfully')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <button
                        onClick={handleSupportClick}
                        disabled={isLoadingSupport}
                        className="w-full text-start bg-gradient-to-br from-[#1A1814] to-gold-900/10 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 group-hover:bg-gold-500/20 group-hover:text-gold-400 transition-colors">
                            {isLoadingSupport ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors">{(t.dashboard.orders as any).supportTitle}</div>
                            <div className="text-xs text-white/40">{(t.dashboard.orders as any).supportDesc}</div>
                        </div>
                    </button>
                </div>
            </div>

        </div >
    );
};