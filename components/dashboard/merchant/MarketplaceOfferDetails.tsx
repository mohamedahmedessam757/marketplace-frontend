import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import {
    ArrowLeft, ArrowRight, Clock, MapPin, Package, Settings, Monitor, ShieldCheck, FileText, CheckCircle2, ChevronDown, MessageCircle, AlertTriangle, Search, Car, Box, Calendar, Truck, User, DollarSign, Weight, Shield, Edit3, XCircle, Loader2, ExternalLink
} from 'lucide-react';
import { CountdownTimer } from '../OrderDetails';
import { WarrantyProtectionCard } from '../../ui/WarrantyProtectionCard';
import { SubmitOfferModal } from './SubmitOfferModal';
import { GlassCard } from '../../ui/GlassCard';
import { Badge, StatusType } from '../../ui/Badge';
import { offersApi } from '../../../services/api/offers';
import { ordersApi } from '../../../services/api/orders';
import { shipmentsApi } from '../../../services/api/shipments.api';
import { StatusTimeline } from '../../ui/StatusTimeline';
import { supabase } from '../../../services/supabase';
import { VerificationForm } from './VerificationForm';
import { OrderInvoicesPanel } from '../shared/OrderInvoicesPanel';
import { OrderWaybillsPanel } from '../shared/OrderWaybillsPanel';
import { useShipmentsStore } from '../../../stores/useShipmentsStore';
import { ShipmentTracker } from '../shipments/ShipmentTracker';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { ShippingPaymentCard } from '../resolution/ShippingPaymentCard';

const MarketplaceDetailsSkeleton = ({ isAr }: { isAr: boolean }) => (
    <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-white/10 rounded-lg" />
                    <div className="h-4 w-48 bg-white/5 rounded-lg" />
                </div>
            </div>
            <div className="h-12 w-48 bg-white/5 rounded-xl border border-white/10" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
            </div>
            <div className="space-y-6">
                <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
            </div>
        </div>

        {/* Parts Skeleton */}
        <div className="space-y-4">
            <div className="h-8 w-40 bg-white/10 rounded-lg" />
            {[1, 2].map(i => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/10" />
            ))}
        </div>
    </div>
);

interface MarketplaceOfferDetailsProps {
    orderId: string;
    onBack: () => void;
}

export const MarketplaceOfferDetails: React.FC<MarketplaceOfferDetailsProps> = ({ orderId, onBack }) => {
    const { t, language } = useLanguage();
    const { orders, addOfferToOrder } = useOrderStore(); // We'll need to fetch the exact order from API in real app
    const { storeId } = useVendorStore();
    const { shipments, fetchShipments } = useShipmentsStore();
    const { cases, fetchCases } = useResolutionStore();
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ArrowRight : ArrowLeft;

    // Translation helpers matching OfferCard
    const offersT = (t.dashboard as any)?.offers || (t.offers as any);

    const getConditionText = (val: string) => {
        if (!val) return '';
        const lowerVal = val.toLowerCase().trim();
        return offersT?.conditions?.[lowerVal] || offersT?.conditions?.[val.trim()] || val;
    };

    const getWarrantyText = (val: string | boolean) => {
        if (val === undefined || val === null) return offersT?.warranties?.no || 'No Warranty';
        const strictVal = typeof val === 'boolean' ? (val ? 'yes' : 'no') : val.toLowerCase().trim().replace(/\s/g, '');
        
        // Custom 2026 fallbacks
        if (strictVal === '15days') return isAr ? '15 يوم' : '15 Days';
        if (strictVal === '1month') return isAr ? 'شهر' : '1 Month';
        if (strictVal === '3months') return isAr ? '3 أشهر' : '3 Months';
        if (strictVal === '12months') return isAr ? '12 شهر' : '12 Months';
        if (strictVal === 'custom') return val.toString(); // Fallback to raw string value entered by user
        
        return offersT?.warranties?.[strictVal] || val.toString();
    };

    const getDeliveryText = (val: string) => {
        if (!val) return '';
        const key = val.trim();
        if (offersT?.delivery?.[key]) return offersT?.delivery?.[key];
        if (key.match(/^d\d+_\d+$/)) {
            const [min, max] = key.substring(1).split('_');
            return isAr ? `من ${min} إلى ${max} أيام` : `${min}-${max} Days`;
        }
        return key;
    };

    const [order, setOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Bidding State
    const [isBidding, setIsBidding] = useState(false);
    const [biddingPart, setBiddingPart] = useState<any | null>(null);

    // Real offers from API (persistent across page reloads)
    const [myOffers, setMyOffers] = useState<any[]>([]);

    // Offer Lock/Cancel States
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [offerToCancel, setOfferToCancel] = useState<any | null>(null);
    // Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'waybills'>('overview');

    // Preparation States
    const [isPrepareDialogOpen, setIsPrepareDialogOpen] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);

    // Shipping Request State
    const [isRequestingShipping, setIsRequestingShipping] = useState(false);

    // Fetch merchant's real offers from API on mount and after submissions
    const fetchMyOffers = useCallback(async () => {
        if (!orderId) return;
        try {
            const offers = await offersApi.findMyOffers(String(orderId));
            const mappedOffers = (offers || []).map((o: any) => ({
                ...o,
                storeCode: o.store?.storeCode || o.storeCode,
                submittedAt: o.createdAt || o.submittedAt,
                weight: o.weightKg || o.weight,
                deliveryTime: o.deliveryDays || o.deliveryTime,
                warranty: o.hasWarranty ? o.warrantyDuration : o.warranty || 'No',
            }));
            setMyOffers(mappedOffers);
        } catch (err) {
            // If API fails (e.g. not logged in), fallback to store offers
            if (order?.offers) {
                const fallback = order.offers.filter((o: any) =>
                    o.storeId === 'my-store-session'
                );
                setMyOffers(fallback);
            }
        }
    }, [orderId, order?.offers]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const foundOrder = orders.find(o => o.id.toString() === orderId.toString());
            setOrder(foundOrder);
            
            // Wait for both order and myOffers
            await fetchMyOffers();
            await fetchShipments();
            
            // Artificial smoothing delay (optional, but 200ms feels premium)
            setTimeout(() => setIsLoading(false), 200);
        };

        fetchInitialData();
    }, [orderId, fetchMyOffers, orders]);

    useEffect(() => {
        if (orderId) {
            fetchCases('merchant');
        }
    }, [orderId]);

    const activeShippingCase = cases.find(c => 
        c.orderId === orderId && 
        c.shippingPaymentStatus === 'PENDING' && 
        !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(c.status)
    );

    // Real-time Subscriptions
    useEffect(() => {
        if (!orderId) return;

        // 1. Subscribe to order changes (status, parts, etc.)
        let orderSubscription: any;
        if (order?.id) { // Use order.id for the channel if available, otherwise orderId
            orderSubscription = supabase.channel(`order_details_${order.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `id=eq.${order.id}`
                    },
                    (payload) => {
                        console.log('Real-time order update:', payload);
                        setOrder((prev: any) => ({ ...prev, ...payload.new }));
                    }
                )
                .subscribe();
        }

        // 2. Subscribe to offers changes (competition levels, accepted offers)
        const offersSubscription = supabase
            .channel(`order_offers_${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'offers',
                    filter: `order_id=eq.${orderId}`
                },
                (payload: any) => {
                    console.log('Real-time offer update:', payload.eventType, payload);
                    
                    const newOffer = payload.new as any;
                    // Re-calculate or re-fetch to ensure consistency
                    // If it's the merchant's own offer, re-fetch myOffers
                    if (newOffer && (String(newOffer.storeId || '') === String(storeId) || String(newOffer.store_id || '') === String(storeId))) {
                        fetchMyOffers();
                    }

                    // Update order.offers locally for competition counts
                    setOrder((prev: any) => {
                        if (!prev) return prev;
                        const existingOffers = prev.offers || [];
                        let nextOffers = [...existingOffers];

                        if (payload.eventType === 'INSERT') {
                            nextOffers.push(payload.new);
                        } else if (payload.eventType === 'UPDATE') {
                            nextOffers = nextOffers.map(o => (o.id === payload.new.id ? payload.new : o));
                        } else if (payload.eventType === 'DELETE') {
                            nextOffers = nextOffers.filter(o => o.id !== payload.old.id);
                        }

                        return { ...prev, offers: nextOffers };
                    });
                }
            )
            .subscribe();

        return () => {
            if (orderSubscription) supabase.removeChannel(orderSubscription);
            if (offersSubscription) supabase.removeChannel(offersSubscription);
        };
    }, [orderId, storeId, fetchMyOffers, order?.id]);

    // Map partId -> count of ALL offers (from all merchants)
    const offersPerPart = useMemo(() => {
        const counts = new Map<string, number>();
        if (order?.offers) {
            order.offers.forEach((o: any) => {
                const pId = o.orderPartId || o.order_part_id;
                if (pId) {
                    counts.set(pId, (counts.get(pId) || 0) + 1);
                }
            });
        }
        return counts;
    }, [order?.offers]);

    // Map partId -> MY offer data for per-part indicator
    const myOffersByPart = useMemo(() => {
        const map = new Map<string, any>();
        myOffers.forEach((o: any) => {
            const partId = o.orderPartId || o.order_part_id;
            if (partId) map.set(partId, o);
        });
        return map;
    }, [myOffers]);

    // Map partId -> check if awarded to ANOTHER merchant
    const awardedToOthers = useMemo(() => {
        const map = new Map<string, boolean>();
        if (order?.parts && order?.offers) {
            order.parts.forEach((p: any) => {
                const isAwardedToOther = order.offers.some((of: any) => 
                    (of.orderPartId === p.id || of.order_part_id === p.id) && 
                    of.status === 'accepted' && 
                    String(of.storeId) !== String(storeId)
                );
                map.set(p.id, isAwardedToOther);
            });
        }
        return map;
    }, [order?.parts, order?.offers, storeId]);

    // Competition Level Helper based on User Thresholds:
    // 0-4: Low, 5-7: Medium, 8-9: High, 10: Full
    const getCompetitionLevel = (count: number) => {
        if (count >= 10) return { label: isAr ? 'مكتمل' : 'Full', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', level: 'full' };
        if (count >= 8) return { label: isAr ? 'عالي' : 'High', color: 'text-red-400 bg-red-500/10 border-red-500/20', level: 'high' };
        if (count >= 5) return { label: isAr ? 'متوسط' : 'Medium', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', level: 'medium' };
        return { label: isAr ? 'منخفض' : 'Low', color: 'text-green-400 bg-green-500/10 border-green-500/20', level: 'low' };
    };

    const hasSubmittedAny = myOffers.length > 0;

    const getOfferDeadline = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    };

    const getPaymentDeadline = (dateStr?: string) => {
        if (order?.paymentDeadlineAt) return order.paymentDeadlineAt;
        const base = dateStr || order?.offerAcceptedAt || order?.updatedAt;
        const d = new Date(base);
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    };

    const getPreparationDeadline = (dateStr?: string) => {
        const paymentDates = order?.payments?.map((p: any) => new Date(p.createdAt || p.paidAt).getTime()).filter(Boolean) || [];
        const paidAt = paymentDates.length > 0 ? new Date(Math.min(...paymentDates)).toISOString() : null;
        const base = paidAt || dateStr || order?.updatedAt;
        const d = new Date(base);
        d.setHours(d.getHours() + 48);
        return d.toISOString();
    };

    const isOrderExpired = (dateStr: string) => {
        const deadline = new Date(getOfferDeadline(dateStr)).getTime();
        return new Date().getTime() > deadline;
    };

    const handleOpenLightbox = (images: string[], index: number) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const handleCancelOffer = async () => {
        if (!offerToCancel) return;
        setIsCancelling(true);
        try {
            await offersApi.cancel(offerToCancel.id);
            await fetchMyOffers();
            setIsCancelDialogOpen(false);
            setOfferToCancel(null);
        } catch (err) {
            console.error('Failed to cancel offer:', err);
            alert(isAr ? 'فشل الغاء العرف، قد يكون تم قبول العرض بالفعل.' : 'Failed to cancel offer.');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleMarkPrepared = async () => {
        setIsPreparing(true);
        try {
            await ordersApi.markPrepared(String(orderId));
            setOrder((prev: any) => ({ ...prev, status: 'PREPARED' }));
            setIsPrepareDialogOpen(false);
        } catch (err) {
            console.error('Failed to mark prepared:', err);
            alert(isAr ? 'فشل تأكيد التجهيز، يرجى المحاولة لاحقاً.' : 'Failed to confirm preparation.');
        } finally {
            setIsPreparing(false);
        }
    };

    const handleRequestShipping = async () => {
        setIsRequestingShipping(true);
        try {
            await shipmentsApi.createStoreShipment(String(orderId));
            setOrder((prev: any) => ({ ...prev, status: 'READY_FOR_SHIPPING' }));
            alert(isAr ? 'تم طلب الشحن بنجاح!' : 'Shipping requested successfully!');
        } catch (err) {
            console.error('Failed to request shipping:', err);
            alert(isAr ? 'فشل طلب الشحن، يرجى المحاولة لاحقاً.' : 'Failed to request shipping.');
        } finally {
            setIsRequestingShipping(false);
        }
    };

    if (isLoading) {
        return <MarketplaceDetailsSkeleton isAr={isAr} />;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{isAr ? 'الطلب غير موجود' : 'Order Not Found'}</h3>
                <p className="text-white/60 mb-8 max-w-sm">
                    {isAr ? 'لم نتمكن من العثور على هذا الطلب، قد يكون تم حذفه أو تم اغلاق تقديم العروض له.' : 'We could not find this order. It may have been deleted or closed for bidding.'}
                </p>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                    <ArrowIcon size={18} />
                    {isAr ? 'العودة للسوق' : 'Back to Marketplace'}
                </button>
            </div>
        );
    }

    if (showVerificationForm) {
        return (
            <div className="pt-6">
                <VerificationForm
                    orderId={order.id}
                    isCorrection={order.status === 'CORRECTION_PERIOD' || order.status === 'NON_MATCHING'}
                    existingData={order.verificationDocuments?.[0]} 
                    onSubmit={async (payload) => {
                        try {
                            if (order.status === 'CORRECTION_PERIOD' || order.status === 'NON_MATCHING') {
                                await ordersApi.submitCorrectionVerification(order.id, payload);
                            } else {
                                await ordersApi.submitVerification(order.id, payload);
                            }
                            setShowVerificationForm(false);
                            // Real-time subscription will update the UI state
                        } catch (err) {
                            console.error(err);
                            throw err; // VerificationForm will catch and show error
                        }
                    }}
                    onCancel={() => setShowVerificationForm(false)}
                />
            </div>
        );
    }

    const expired = isOrderExpired(order.createdAt || order.date);
    const shipment = shipments.find(s => s.orderId === (orderId || ''));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 lg:pb-0">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                    >
                        <ArrowIcon size={20} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {isAr ? 'تفاصيل طلب العميل' : 'Customer Request Details'}
                            </h1>
                            <Badge status={order.status} />
                            {order.warranty_end_at && (
                                <WarrantyProtectionCard 
                                    order={order} 
                                    variant="compact"
                                    role="merchant"
                                />
                            )}
                            {shipment && !['CANCELLED', 'AWAITING_OFFERS', 'AWAITING_PAYMENT'].includes(order.status) && (
                                <Badge status={shipment.status as StatusType} className="animate-in fade-in zoom-in duration-500" />
                            )}
                            <span className="px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-mono">
                                #{order.id}
                            </span>
                        </div>
                        <p className="text-white/50 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {order.date}</span>
                            <span className="text-white/20 px-2">•</span>
                            <span className="flex items-center gap-1 font-mono tracking-wide text-gold-400 text-xs bg-gold-400/5 px-2 py-0.5 rounded-md border border-gold-400/10">
                                <User size={12} className="text-white/50" /> 
                                {order.customer?.customerCode || (order.customer?.id ? `CUS-${order.customer.id.substring(0, 6).toUpperCase()}` : (isAr ? 'عميل إي-تشليح' : 'E-Tashleh Customer'))}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Status Badge & Timer */}
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-full md:w-auto">
                    {(() => {
                        const progressiveStates = ['AWAITING_PAYMENT', 'PREPARATION', 'DELAYED_PREPARATION', 'PREPARED', 'VERIFICATION', 'VERIFICATION_SUCCESS', 'READY_FOR_SHIPPING', 'NON_MATCHING', 'CORRECTION_PERIOD', 'CORRECTION_SUBMITTED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'WARRANTY_ACTIVE', 'WARRANTY_EXPIRED'];
                        const isProgressive = progressiveStates.includes(order.status);
                        
                        // If order is active and time hasn't expired
                        if (order.status === 'AWAITING_OFFERS' && !expired) {
                            return (
                                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                    <span className="text-sm text-white/60">{isAr ? 'الوقت المتبقي لتقديم عرض:' : 'Time left to offer:'}</span>
                                    <CountdownTimer targetDate={getOfferDeadline(order.createdAt || order.date)} compact={true} />
                                </div>
                            );
                        }
                        
                        if (order.status === 'AWAITING_PAYMENT') {
                            return (
                                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                    <span className="text-sm text-white/60">{isAr ? 'الوقت المتبقي لإتمام العميل الدفع:' : 'Time left for client pay:'}</span>
                                    <CountdownTimer targetDate={getPaymentDeadline(order.offerAcceptedAt || order.updatedAt)} compact={true} />
                                </div>
                            );
                        }

                        if (order.status === 'PREPARATION') {
                            return (
                                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                    <span className="text-sm text-white/60">{isAr ? 'مهلة التجهيز المتبقية:' : 'Time left for preparation:'}</span>
                                    <CountdownTimer targetDate={getPreparationDeadline(order.updatedAt)} compact={true} />
                                </div>
                            );
                        }

                        if (order.status === 'DELAYED_PREPARATION') {
                            return (
                                <div className="flex items-center justify-between w-full md:w-auto gap-4 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                    <span className="text-sm font-bold text-red-500 animate-pulse flex items-center gap-1.5"><AlertTriangle size={16} /> {isAr ? 'عاجل: وقت إضافي أخير للتجهيز' : 'URGENT: Final penalty grace period'}</span>
                                    <div className="text-red-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-red-500/30">
                                         <CountdownTimer targetDate={order.delayedPreparationDeadlineAt || getOfferDeadline(order.updatedAt)} compact={true} />
                                    </div>
                                </div>
                            );
                        }

                        // CORRECTION_PERIOD: show urgent countdown timer (48h)
                        if (order.status === 'CORRECTION_PERIOD') {
                            const correctionDeadline = order.correctionDeadlineAt || 
                                new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString();
                            return (
                                <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl animate-pulse">
                                    <AlertTriangle size={16} className="text-orange-400 shrink-0" />
                                    <span className="text-orange-400 font-bold text-sm">{isAr ? '⚠️ مهلة التصحيح:' : '⚠️ Correction:'}</span>
                                    <CountdownTimer targetDate={correctionDeadline} compact hideExpiredText={false} />
                                </div>
                            );
                        }

                        // NON_MATCHING: preparing to enter correction period
                        if (order.status === 'NON_MATCHING') {
                            return (
                                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                                    <AlertTriangle size={16} className="animate-pulse" />
                                    <span className="font-bold text-sm">{isAr ? 'غير مطابق - مطلوب تصحيح' : 'Non-Matching - Action Required'}</span>
                                </div>
                            );
                        }

                        // VERIFICATION: pending admin review
                        if (order.status === 'VERIFICATION' || order.status === 'CORRECTION_SUBMITTED') {
                            return (
                                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                                    <CheckCircle2 size={16} />
                                    <span className="font-bold text-sm">{isAr ? 'قيد مراجعة الإدارة' : 'Under Admin Review'}</span>
                                </div>
                            );
                        }

                        // VERIFICATION_SUCCESS: approved, awaiting shipment
                        if (order.status === 'VERIFICATION_SUCCESS') {
                            return (
                                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                                    <CheckCircle2 size={16} />
                                    <span className="font-bold text-sm">{isAr ? 'تمت المطابقة - جاهز للشحن' : 'Verified - Ready to Ship'}</span>
                                </div>
                            );
                        }

                        // WARRANTY_ACTIVE: Show protection status
                        if (order.status === 'WARRANTY_ACTIVE') {
                            return (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                    <Shield size={16} className="animate-pulse" />
                                    <span className="font-bold text-sm">{isAr ? 'حماية الضمان نشطة' : 'Warranty Protection Active'}</span>
                                </div>
                            );
                        }

                        // If the order has progressed to checkout/shipping
                        if (isProgressive) {
                            // Check if the merchant has at least one accepted offer on this order
                            const hasAccepted = myOffers.some(o => o.status === 'accepted');
                            return (
                                <div className={`flex items-center gap-2 ${hasAccepted ? 'text-green-400' : 'text-white/60'}`}>
                                    {hasAccepted ? (order.status === 'PREPARED' ? <Package size={16} /> : <CheckCircle2 size={16} />) : <AlertTriangle size={16} />}
                                    <span className="font-bold">
                                        {hasAccepted 
                                            ? (order.status === 'PREPARED' 
                                                ? (isAr ? 'جاهز للتوثيق والتسليم' : 'Ready - Upload Documents') 
                                                : (isAr ? 'قيد التنفيذ (مبروك!)' : 'In Progress (You Won!)'))
                                            : (isAr ? 'مغلق (تم الترسية)' : 'Closed (Awarded)')
                                        }
                                    </span>
                                </div>
                            );
                        }


                        // Otherwise it's genuinely expired or cancelled
                        return (
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle size={16} />
                                <span className="font-bold">{isAr ? 'الطلب منتهي' : 'Order Expired'}</span>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Request Intel */}
                <div className="lg:col-span-2 space-y-6">
                    {activeShippingCase && (
                        <ShippingPaymentCard 
                            caseRecord={activeShippingCase} 
                            role="MERCHANT" 
                            onSuccess={() => fetchCases('merchant')}
                        />
                    )}

                    {/* Tab Navigation */}
                    <div className="flex gap-4 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
                                activeTab === 'overview' ? 'bg-gold-500 text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {isAr ? 'نظرة عامة' : 'Overview'}
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                                activeTab === 'invoices' ? 'bg-gold-500 text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <FileText size={16} />
                            {isAr ? 'الفواتير' : 'Invoices'}
                        </button>
                        {['VERIFICATION_SUCCESS', 'READY_FOR_SHIPPING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'RETURNED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'REFUNDED', 'WARRANTY_ACTIVE', 'WARRANTY_EXPIRED'].includes(order.status) && (
                            <button
                                onClick={() => setActiveTab('waybills')}
                                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === 'waybills' ? 'bg-gold-500 text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Truck size={16} />
                                {isAr ? 'البوليصة' : 'Waybills'}
                            </button>
                        )}
                    </div>

                    <div className={activeTab === 'invoices' ? 'block' : 'hidden'}>
                        <OrderInvoicesPanel 
                            orderId={order.id} 
                            role="MERCHANT" 
                            initialData={order.invoices} 
                        />
                    </div>
                    <div className={activeTab === 'waybills' ? 'block' : 'hidden'}>
                        {['VERIFICATION_SUCCESS', 'READY_FOR_SHIPPING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'RETURNED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'REFUNDED', 'WARRANTY_ACTIVE', 'WARRANTY_EXPIRED'].includes(order.status) && (
                            <OrderWaybillsPanel 
                                orderId={order.id} 
                                orderStatus={order.status} 
                                role="MERCHANT" 
                                initialData={order.shippingWaybills}
                            />
                        )}
                    </div>

                    <div className={activeTab === 'overview' ? 'space-y-6' : 'hidden'}>

                    {/* Premium Warranty Protection Hub (2026) */}
                    {order.status === 'WARRANTY_ACTIVE' && order.warranty_end_at && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <WarrantyProtectionCard order={order} role="merchant" />
                        </motion.div>
                    )}

                    {/* ★ Order Progress Tracker (Mirror of Customer View) */}
                    <GlassCard className="p-0 overflow-hidden bg-[#1A1814] border-white/5">
                        <div className="p-6">
                            <StatusTimeline currentStatus={order.status} />
                        </div>
                        {['SHIPPED', 'PREPARATION', 'READY_FOR_SHIPPING', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'RETURNED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'REFUNDED', 'WARRANTY_ACTIVE', 'WARRANTY_EXPIRED'].includes(order.status) && shipment && (
                            <div className="border-t border-white/5 pt-6 mt-2 px-6 pb-6 shadow-inner">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Truck className="text-gold-500" size={20} />
                                    {isAr ? 'تتبع الشحنة' : 'Shipment Tracking'}
                                </h3>
                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                                    <div>
                                        <p className="text-sm text-white/50">{isAr ? 'رقم التتبع' : 'Tracking Num'}</p>
                                        <p className="font-mono font-bold text-lg text-gold-400">{shipment.trackingNumber || 'PENDING'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/50">{isAr ? 'الشركة الناقلة' : 'Carrier'}</p>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            <Truck size={16} />
                                            {shipment.carrier || (isAr ? 'تشليح السريعة' : 'Tashleh Express')}
                                        </p>
                                    </div>
                                    {shipment.trackingLink && (
                                        <a 
                                            href={shipment.trackingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-black border border-gold-500/20 rounded-lg font-bold text-sm transition-all"
                                        >
                                            <ExternalLink size={16} />
                                            {isAr ? 'تتبع' : 'Track'}
                                        </a>
                                    )}
                                </div>
                                <ShipmentTracker status={shipment.status} />
                            </div>
                        )}
                    </GlassCard>

                    {/* Vehicle Information Card */}
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Car className="text-gold-500" size={24} />
                            {isAr ? 'تفاصيل المركبة' : 'Vehicle Information'}
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5">
                                <p className="text-white/40 text-xs mb-1">{isAr ? 'الشركة المصنعة' : 'Make'}</p>
                                <p className="text-white font-bold">{order.vehicle?.make || order.car}</p>
                            </div>
                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5">
                                <p className="text-white/40 text-xs mb-1">{isAr ? 'الموديل' : 'Model'}</p>
                                <p className="text-white font-bold">{order.vehicle?.model || '-'}</p>
                            </div>
                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5">
                                <p className="text-white/40 text-xs mb-1">{isAr ? 'سنة الصنع' : 'Year'}</p>
                                <p className="text-white font-bold">{order.vehicle?.year || '-'}</p>
                            </div>
                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5">
                                <p className="text-white/40 text-xs mb-1 font-mono">VIN</p>
                                <p className="text-white font-bold font-mono text-sm">{order.vehicle?.vin || order.vin || '-'}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Preferences & Delivery Form */}
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Settings className="text-gold-500" size={24} />
                            {isAr ? 'تفضيلات العميل' : 'Customer Preferences'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                                    <Monitor size={18} />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs mb-0.5">{isAr ? 'حالة القطعة' : 'Condition'}</p>
                                    <p className="text-sm font-bold text-white">{order.conditionPref === 'new' ? (isAr ? 'جديد (وكالة)' : 'New Only') : (isAr ? 'مستعمل (تشليح)' : 'Used Only')}</p>
                                </div>
                            </div>

                            <div className="bg-[#151310] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs mb-0.5">{isAr ? 'طريقة الشحن' : 'Shipping'}</p>
                                    <p className="text-sm font-bold text-white">
                                        {order.shippingType === 'combined'
                                            ? (isAr ? '(عدة قطع) تجميع الطلبات' : '(Multiple) Combined')
                                            : ((order.parts && order.parts.length > 1) || order.requestType === 'multiple'
                                                ? (isAr ? '(عدة قطع) كل طلب فى شحنه لوحده' : '(Multiple) Separate')
                                                : (isAr ? '(قطعة واحدة) شحن كل قطعة لوحدها' : '(Single) Separate')
                                            )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Store Instructions Section */}
                    <GlassCard className="p-6 overflow-hidden relative border-gold-500/10 bg-[#1A1814]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-gold-500/50 to-green-500/50" />
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-gold-500" size={24} />
                            {t.dashboard.merchant.marketplace.instructions.title}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Forbidden Section */}
                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                    <XCircle size={20} />
                                    <span>{t.dashboard.merchant.marketplace.instructions.forbidden.title}</span>
                                </div>
                                <ul className="space-y-3">
                                    {t.dashboard.merchant.marketplace.instructions.forbidden.items.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mandatory Section */}
                            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                                    <CheckCircle2 size={20} />
                                    <span>{t.dashboard.merchant.marketplace.instructions.mandatory.title}</span>
                                </div>
                                <ul className="space-y-3">
                                    {t.dashboard.merchant.marketplace.instructions.mandatory.items.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Parts List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Box className="text-gold-500" size={24} />
                            {isAr ? 'القطع المطلوبة' : 'Requested Parts'}
                        </h2>

                        {order.parts && order.parts.length > 0 ? (
                            order.parts.map((part: any, idx: number) => {
                                    const partOffer = myOffersByPart.get(part.id);
                                    const hasOffer = !!partOffer;
                                    const isAwardedToOther = awardedToOthers.get(part.id);

                                    return (
                                        <GlassCard key={part.id} className={`p-6 relative overflow-hidden transition-all ${hasOffer ? 'border-green-500/30 bg-green-500/[0.02]' : ''} ${isAwardedToOther ? 'opacity-75 grayscale-[0.5]' : 'hover:border-gold-500/20'}`}>
                                            {isAwardedToOther && (
                                                <div className="absolute top-2 right-2 z-20">
                                                    <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold backdrop-blur-md animate-in zoom-in duration-300 uppercase tracking-tighter">
                                                        {isAr ? 'تم الاختيار من تاجر آخر' : 'Awarded to Another'}
                                                    </div>
                                                </div>
                                            )}
                                        {/* Numerator */}
                                        <div className={`absolute top-0 ${isAr ? 'right-0 rounded-bl-xl' : 'left-0 rounded-br-xl'} ${hasOffer ? 'bg-green-500/10' : 'bg-white/5'} px-3 py-1 border-b ${isAr ? 'border-l' : 'border-r'} ${hasOffer ? 'border-green-500/20' : 'border-white/10'} text-xs font-mono ${hasOffer ? 'text-green-400' : 'text-white/40'}`}>
                                            {hasOffer ? <CheckCircle2 size={14} className="inline mr-1" /> : null}{idx + 1}
                                        </div>

                                        {/* Offer Status Badge */}
                                        {hasOffer && (
                                            <div className={`absolute top-0 ${isAr ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} bg-green-500/10 px-3 py-1 border-b ${isAr ? 'border-r' : 'border-l'} border-green-500/20`}>
                                                <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                                    <CheckCircle2 size={12} />
                                                    {isAr ? 'عرض مقدم' : 'Offer Submitted'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-col md:flex-row gap-6">

                                            {/* Media Preview Area */}
                                            <div className="w-full md:w-48 shrink-0">
                                                {part.video ? (
                                                    <div className="aspect-video md:aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 relative group">
                                                        <video
                                                            src={part.video}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                            controls
                                                            controlsList="nodownload"
                                                        />
                                                    </div>
                                                ) : (part.images && part.images.length > 0) ? (
                                                    <div
                                                        onClick={() => handleOpenLightbox(part.images, 0)}
                                                        className="aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 relative group cursor-pointer"
                                                    >
                                                        <img src={part.images[0]} alt={part.name || 'Part image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        {part.images.length > 1 && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-md">
                                                                    +{part.images.length - 1} {isAr ? 'صور أخرى' : 'more'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/20">
                                                        <Box size={32} className="mb-2" />
                                                        <span className="text-xs">{isAr ? 'لا توجد صور' : 'No images'}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-2">{part.name || order.part}</h3>
                                                <p className="text-white/60 text-sm mb-4 leading-relaxed">{part.description || order.description || (isAr ? 'لا توجد تفاصيل إضافية للقطعة المحددة.' : 'No additional details provided.')}</p>

                                                {/* Your Offer Summary for this part */}
                                                {hasOffer && (
                                                    <div className="mt-3 p-3 bg-green-500/5 rounded-xl border border-green-500/15">
                                                        <h4 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1.5">
                                                            <DollarSign size={14} />
                                                            {isAr ? 'عرضك على هذه القطعة' : 'Your Offer on this Part'}
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                            <div className="bg-black/20 rounded-lg px-2 py-1.5">
                                                                <span className="text-[10px] text-white/40 block">{isAr ? 'رقم العرض' : 'Offer No.'}</span>
                                                                <span className="text-sm font-bold text-white font-mono tracking-tight">{partOffer.offerNumber || '---'}</span>
                                                            </div>
                                                            <div className="bg-black/20 rounded-lg px-2 py-1.5">
                                                                <span className="text-[10px] text-white/40 block">{isAr ? 'رقم المتجر' : 'Store ID'}</span>
                                                                <span className="text-sm font-bold text-white font-mono tracking-tight">{partOffer.storeCode || '---'}</span>
                                                            </div>
                                                            <div className="bg-black/20 rounded-lg px-2 py-1.5">
                                                                <span className="text-[10px] text-white/40 block">{isAr ? 'تاريخ التقديم' : 'Submitted'}</span>
                                                                <span className="text-sm font-bold text-white">
                                                                    {partOffer.submittedAt ? new Date(partOffer.submittedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' }) : '---'}
                                                                </span>
                                                            </div>
                                                            <div className="bg-black/20 rounded-lg px-2 py-1.5">
                                                                <span className="text-[10px] text-white/40 block">{isAr ? 'السعر للعميل' : 'Customer Price'}</span>
                                                                <span className="text-sm font-bold text-gold-400">AED {
                                                                    (() => {
                                                                        const base = Number(partOffer.unitPrice || 0);
                                                                        const shipping = Number(partOffer.shippingCost || 0);
                                                                        const percentCommission = Math.round(base * 0.25);
                                                                        const commission = base > 0 ? Math.max(percentCommission, 100) : 0;
                                                                        return (base + shipping + commission).toLocaleString();
                                                                    })()
                                                                }</span>
                                                            </div>
                                                            {partOffer.condition && (
                                                                <div className="bg-black/20 rounded-lg px-2 py-1.5">
                                                                    <span className="text-[10px] text-white/40 block">{isAr ? 'الحالة' : 'Condition'}</span>
                                                                    <span className="text-sm font-bold text-white uppercase">{getConditionText(partOffer.condition)}</span>
                                                                </div>
                                                            )}
                                                            {partOffer.weight && (
                                                                <div className="bg-black/20 rounded-lg px-2 py-1.5 truncate">
                                                                    <span className="text-[10px] text-white/40 block">{isAr ? 'الوزن' : 'Weight'}</span>
                                                                    <span className="text-sm font-bold text-white">{partOffer.weight} {offersT?.units?.kg || 'kg'}</span>
                                                                </div>
                                                            )}
                                                            {partOffer.partType && (
                                                                <div className="bg-black/20 rounded-lg px-2 py-1.5 truncate">
                                                                    <span className="text-[10px] text-white/40 block">{isAr ? 'النوع' : 'Type'}</span>
                                                                    <span className="text-sm font-bold text-white">{offersT?.partTypes?.[(partOffer.partType || 'Original').toLowerCase()] || partOffer.partType || 'Original'}</span>
                                                                </div>
                                                            )}
                                                            {partOffer.warranty && (
                                                                <div className="bg-black/20 rounded-lg px-2 py-1.5 truncate">
                                                                    <span className="text-[10px] text-white/40 block">{isAr ? 'الضمان' : 'Warranty'}</span>
                                                                    <span className="text-sm font-bold text-white">{getWarrantyText(partOffer.warranty)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Cancel / Lock Trigger Button */}
                                                        {order.status === 'AWAITING_OFFERS' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setOfferToCancel(partOffer); setIsCancelDialogOpen(true); }}
                                                                className="mt-3 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                                                            >
                                                                <AlertTriangle size={14} className="animate-pulse" />
                                                                {isAr ? 'إلغاء هذا العرض لغرض التعديل' : 'Cancel Offer to Edit'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })
                        ) : (
                            <GlassCard className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-2">{order.part}</h3>
                                        <p className="text-white/60 text-sm mb-4 leading-relaxed">{order.description || (isAr ? 'لا توجد تفاصيل إضافية للقطعة المحددة.' : 'No additional details provided.')}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                    </div> {/* End overview tab */}

                </div>

                {/* RIGHT COLUMN: Sidebar (Bidding Action & Intelligence) */}
                <div className="space-y-6">

                    {/* Market Intelligence Widget */}
                    <GlassCard className="p-6 border-gold-500/30 bg-gold-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-[50px] rounded-full pointer-events-none" />

                        <h3 className="text-gold-400 font-bold mb-4 flex items-center gap-2">
                            <Monitor size={18} />
                            {isAr ? 'معلومات السوق' : 'Market Intelligence'}
                        </h3>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {(order.parts && order.parts.length > 0) ? (
                                order.parts.map((p: any, i: number) => {
                                    const count = offersPerPart.get(p.id) || 0;
                                    const comp = getCompetitionLevel(count);
                                    return (
                                        <div key={p.id} className={`pb-3 space-y-2 ${i < order.parts.length - 1 ? 'border-b border-white/5' : ''}`}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-white font-medium text-sm truncate flex-1">{p.name}</span>
                                                <div className="flex items-center gap-2" dir="ltr">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border border-current ${comp.color.split(' ').filter(c => !c.startsWith('border-')).join(' ')}`}>
                                                        {comp.label}
                                                    </span>
                                                    <div className="flex items-center text-white font-bold text-sm">
                                                        <span>{count}</span>
                                                        <span className="text-[10px] text-white/40 mx-1">/</span>
                                                        <span className="text-[10px] text-white/40">10</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max((count / 10) * 100, 2)}%` }} // Show at least a sliver if 0
                                                    className={`h-full ${count >= 10 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : count >= 8 ? 'bg-red-500' : count >= 5 ? 'bg-yellow-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                    <span className="text-white/60 text-sm">{isAr ? 'عروض القطعة' : 'Part Bids'}</span>
                                    <div className="flex items-center gap-3" dir="ltr">
                                        {(() => {
                                            const count = order._count?.offers || order.offersCount || 0;
                                            const comp = getCompetitionLevel(count);
                                            return (
                                                <>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap border border-current ${comp.color.split(' ').filter(c => !c.startsWith('border-')).join(' ')}`}>
                                                        {comp.label}
                                                    </span>
                                                    <div className="flex items-center text-white font-bold text-lg">
                                                        <span>{count}</span>
                                                        <span className="text-sm text-white/40 mx-1">/</span>
                                                        <span className="text-sm text-white/40">10</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Merchant's Own Offer Status */}
                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-white/40 text-[11px] uppercase tracking-wider">{isAr ? 'حالة عروضك' : 'Your Status'}</span>
                                {hasSubmittedAny ? (
                                    <span className="text-green-400 text-[11px] font-bold bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                        <CheckCircle2 size={12} />
                                        <div className="flex items-center" dir="ltr">
                                            <span>{myOffers.length}</span>
                                            <span className="opacity-40 mx-0.5">/</span>
                                            <span>{order.parts?.length || 1}</span>
                                        </div>
                                        <span className="ml-0.5">{isAr ? 'قطع' : 'parts'}</span>
                                    </span>
                                ) : (
                                    <span className="text-white/30 text-sm bg-white/5 px-2 py-1 rounded">{isAr ? 'لم يتم التقديم' : 'Not Submitted'}</span>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Dynamic Context Card (Bidding vs Action) */}
                    <GlassCard className="p-6 sticky top-24">
                        {(order.status === 'PREPARATION' || order.status === 'DELAYED_PREPARATION') ? (
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${order.status === 'DELAYED_PREPARATION' ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-blue-500/10 border-blue-500/20'}`}>
                                    <Package size={28} className={order.status === 'DELAYED_PREPARATION' ? "text-red-500 animate-pulse" : "text-blue-400"} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${order.status === 'DELAYED_PREPARATION' ? 'text-red-400' : 'text-white'}`}>
                                    {isAr ? 'خطوة التجهيز' : 'Preparation Phase'}
                                </h3>
                                <p className="text-white/60 text-sm px-4 mb-6 leading-relaxed">
                                    {isAr 
                                        ? 'العميل بانتظار تجهيزك للطلب بالكامل في كرتون محكم الغلق. إضغط "تم التجهيز" لتأكيد جاهزيته لشركة التوصيل.' 
                                        : 'The customer is waiting for you to prepare the order in a tightly sealed box. Click the button once packed.'}
                                </p>
                                <button
                                    onClick={() => setIsPrepareDialogOpen(true)}
                                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 ${order.status === 'DELAYED_PREPARATION' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'}`}
                                >
                                    <CheckCircle2 size={20} />
                                    <span>{isAr ? 'تأكيد: تم التجهيز' : 'Confirm Preparation'}</span>
                                </button>
                                {order.status === 'DELAYED_PREPARATION' && (
                                    <p className="text-xs text-red-400/80 mt-3 font-bold">{isAr ? '* يجب إنهاء هذه الخطوة فوراً لتجنب غرامة التأخير أو إلغاء الطلب.' : '* Must be completed immediately to avoid penalty.'}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                {(() => {
                                    const display = (() => {
                                        const s = (t.dashboard as any)?.merchant?.marketplace?.statusBox;
                                        if (!s) return null;

                                        switch (order.status) {
                                            case 'AWAITING_PAYMENT':
                                                return {
                                                    icon: <DollarSign size={28} className="text-orange-500" />,
                                                    title: isAr ? s.AWAITING_PAYMENT.title : s.AWAITING_PAYMENT.enTitle,
                                                    desc: isAr ? s.AWAITING_PAYMENT.desc : s.AWAITING_PAYMENT.enDesc,
                                                    bgColor: 'bg-orange-500/10',
                                                    borderColor: 'border-orange-500/20'
                                                };
                                            case 'PREPARATION':
                                            case 'DELAYED_PREPARATION':
                                                return {
                                                    icon: <Package size={28} className="text-blue-400" />,
                                                    title: isAr ? s.PREPARATION.title : s.PREPARATION.enTitle,
                                                    desc: isAr ? s.PREPARATION.desc : s.PREPARATION.enDesc,
                                                    bgColor: 'bg-blue-500/10',
                                                    borderColor: 'border-blue-500/20'
                                                };
                                            case 'PREPARED':
                                                return {
                                                    icon: <ShieldCheck size={28} className="text-amber-500" />,
                                                    title: isAr ? s.PREPARED.title : s.PREPARED.enTitle,
                                                    desc: isAr ? s.PREPARED.desc : s.PREPARED.enDesc,
                                                    bgColor: 'bg-amber-500/10',
                                                    borderColor: 'border-amber-500/20'
                                                };
                                            case 'VERIFICATION':
                                            case 'CORRECTION_SUBMITTED':
                                                return {
                                                    icon: <Clock size={28} className="text-amber-500" />,
                                                    title: isAr ? s.VERIFICATION.title : s.VERIFICATION.enTitle,
                                                    desc: isAr ? s.VERIFICATION.desc : s.VERIFICATION.enDesc,
                                                    bgColor: 'bg-amber-500/10',
                                                    borderColor: 'border-amber-500/20'
                                                };
                                            case 'VERIFICATION_SUCCESS':
                                                return {
                                                    icon: <CheckCircle2 size={28} className="text-green-400" />,
                                                    title: isAr ? s.VERIFICATION_SUCCESS.title : s.VERIFICATION_SUCCESS.enTitle,
                                                    desc: isAr ? s.VERIFICATION_SUCCESS.desc : s.VERIFICATION_SUCCESS.enDesc,
                                                    bgColor: 'bg-green-500/10',
                                                    borderColor: 'border-green-500/20'
                                                };
                                            case 'READY_FOR_SHIPPING':
                                                return {
                                                    icon: <Truck size={28} className="text-blue-400" />,
                                                    title: isAr ? s.READY_FOR_SHIPPING.title : s.READY_FOR_SHIPPING.enTitle,
                                                    desc: isAr ? s.READY_FOR_SHIPPING.desc : s.READY_FOR_SHIPPING.enDesc,
                                                    bgColor: 'bg-blue-500/10',
                                                    borderColor: 'border-blue-500/20'
                                                };
                                            case 'NON_MATCHING':
                                            case 'CORRECTION_PERIOD':
                                                return {
                                                    icon: <AlertTriangle size={28} className="text-red-400" />,
                                                    title: isAr ? s.NON_MATCHING.title : s.NON_MATCHING.enTitle,
                                                    desc: isAr ? s.NON_MATCHING.desc : s.NON_MATCHING.enDesc,
                                                    bgColor: 'bg-red-500/10',
                                                    borderColor: 'border-red-500/20'
                                                };
                                            case 'SHIPPED':
                                                return {
                                                    icon: <Truck size={28} className="text-cyan-400" />,
                                                    title: isAr ? s.SHIPPED.title : s.SHIPPED.enTitle,
                                                    desc: isAr ? s.SHIPPED.desc : s.SHIPPED.enDesc,
                                                    bgColor: 'bg-cyan-500/10',
                                                    borderColor: 'border-cyan-500/20'
                                                };
                                            case 'DELIVERED':
                                            case 'COMPLETED':
                                                return {
                                                    icon: <Package size={28} className="text-green-400" />,
                                                    title: isAr ? s.DELIVERED.title : s.DELIVERED.enTitle,
                                                    desc: isAr ? s.DELIVERED.desc : s.DELIVERED.enDesc,
                                                    bgColor: 'bg-green-500/10',
                                                    borderColor: 'border-green-500/20'
                                                };
                                            default:
                                                if (hasSubmittedAny) {
                                                    return {
                                                        icon: <CheckCircle2 size={28} className="text-green-400" />,
                                                        title: isAr ? s.AWAITING_OFFERS.title : s.AWAITING_OFFERS.enTitle,
                                                        desc: isAr ? s.AWAITING_OFFERS.desc : s.AWAITING_OFFERS.enDesc,
                                                        bgColor: 'bg-green-500/10',
                                                        borderColor: 'border-green-500/20'
                                                    };
                                                }
                                                return {
                                                    icon: <FileText size={28} className="text-gold-500" />,
                                                    title: isAr ? 'هل لديك القطع المطلوبة؟' : 'Have the parts?',
                                                    desc: isAr ? 'أرسل تسعيرتك الآن، المشتري ينتظر!' : 'Submit your pricing now, the buyer is waiting!',
                                                    bgColor: 'bg-gold-500/10',
                                                    borderColor: 'border-gold-500/20'
                                                };
                                        }
                                    })();

                                    if (!display) return null;

                                    return (
                                        <motion.div 
                                            key={order.status}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center mb-6"
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border transition-colors duration-500 ${display.bgColor} ${display.borderColor}`}>
                                                {display.icon}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {display.title}
                                            </h3>
                                            <p className="text-white/50 text-sm px-4">
                                                {display.desc}
                                            </p>
                                        </motion.div>
                                    );
                                })()}

                                {(() => {
                                    const progressiveStates = ['AWAITING_PAYMENT', 'PREPARATION', 'DELAYED_PREPARATION', 'PREPARED', 'VERIFICATION', 'VERIFICATION_SUCCESS', 'READY_FOR_SHIPPING', 'NON_MATCHING', 'CORRECTION_PERIOD', 'CORRECTION_SUBMITTED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED'];
                                    const isProgressive = progressiveStates.includes(order.status);

                                    if (order.status === 'PREPARED') {
                                        return (
                                            <button
                                                onClick={() => setShowVerificationForm(true)}
                                                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 group relative overflow-hidden active:scale-98 animate-pulse"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                                                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span>{isAr ? 'توثيق حالة القطعة والتسليم' : 'Document Part & Handover'}</span>
                                            </button>
                                        );
                                    }

                                    if (order.status === 'VERIFICATION' || order.status === 'CORRECTION_SUBMITTED') {
                                        return (
                                            <button disabled className="w-full py-4 rounded-xl font-bold text-amber-500/80 bg-amber-500/10 cursor-not-allowed border border-amber-500/20">
                                                {isAr ? 'في انتظار مراجعة الإدارة' : 'Pending Admin Review'}
                                            </button>
                                        );
                                    }

                                    // VERIFICATION_SUCCESS: approved, user must manually hit ready for shipping
                                    if (order.status === 'VERIFICATION_SUCCESS') {
                                        return (
                                            <button 
                                                onClick={handleRequestShipping}
                                                disabled={isRequestingShipping}
                                                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 group relative overflow-hidden active:scale-98"
                                            >
                                                {isRequestingShipping ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Truck className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                )}
                                                <span>{isAr ? 'طلب تسليم الشحنة للإدارة' : 'Request delivery of the shipment to management'}</span>
                                            </button>
                                        );
                                    }

                                    if (order.status === 'READY_FOR_SHIPPING') {
                                        return (
                                            <button 
                                                disabled
                                                className="w-full py-4 rounded-xl font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all flex flex-col items-center justify-center gap-1 group shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 inline group-hover:translate-x-1 transition-transform" />
                                                    <span>{isAr ? 'بانتظار بوليصة الشحن' : 'Awaiting Waybill'}</span>
                                                </div>
                                            </button>
                                        );
                                    }

                                    if (order.status === 'NON_MATCHING' || order.status === 'CORRECTION_PERIOD') {
                                        const doc = order.verificationDocuments?.[0];
                                        return (
                                            <div className="space-y-4">
                                                {doc?.adminRejectionReason && (
                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                                                        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                                            <XCircle size={16} /> 
                                                            {isAr ? 'سبب الرفض المسجّل من الإدارة' : 'Admin Rejection Reason'}
                                                        </h4>
                                                        <p className="text-white/80 text-sm whitespace-pre-wrap">{doc.adminRejectionReason}</p>
                                                        
                                                        {doc.adminRejectionImages?.length > 0 && (
                                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                                {doc.adminRejectionImages.map((img: string, i: number) => (
                                                                    <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                                                                       className="aspect-square rounded-xl overflow-hidden border border-red-500/20 block hover:border-red-400 transition-colors">
                                                                        <img src={img} alt="Rejection reason" className="w-full h-full object-cover" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {doc.adminRejectionVideo && (
                                                            <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-red-500/20">
                                                                <video src={doc.adminRejectionVideo} controls className="w-full h-full bg-black/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => setShowVerificationForm(true)}
                                                    className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse flex items-center justify-center gap-2"
                                                >
                                                    <AlertTriangle size={18} />
                                                    {isAr ? 'غير مطابق - اضغط لإعادة التوثيق' : 'Non-Matching - Click to Re-verify'}
                                                </button>
                                            </div>
                                        );
                                    }

                                    if (isProgressive || (order.status !== 'AWAITING_OFFERS' && order.status !== 'CANCELLED')) {
                                        return (
                                            <button
                                                disabled
                                                className="w-full py-4 rounded-xl font-bold text-white/50 bg-white/5 cursor-not-allowed border border-white/10"
                                            >
                                                {isAr ? 'تم إغلاق باب التقديم' : 'Bidding Closed'}
                                            </button>
                                        );
                                    }

                                    if (expired || order.status === 'CANCELLED') {
                                        return (
                                            <button
                                                disabled
                                                className="w-full py-4 rounded-xl font-bold text-red-400/50 bg-red-500/5 cursor-not-allowed border border-red-500/10"
                                            >
                                                {isAr ? 'انتهت فترة تقديم العروض' : 'Offer Period Ended'}
                                            </button>
                                        );
                                    }

                                    // check if ALL parts have reached the 10-offer limit
                                    const allPartsFull = order.parts && order.parts.length > 0 && order.parts.every((p: any) => (offersPerPart.get(p.id) || 0) >= 10);
                                    const globalFull = (order._count?.offers || order.offersCount || 0) >= 10;

                                    if (allPartsFull || (!order.parts && globalFull)) {
                                        return (
                                            <button
                                                disabled
                                                className="w-full py-4 rounded-xl font-bold text-red-400/50 bg-red-500/5 cursor-not-allowed border border-red-500/10 flex flex-col items-center justify-center gap-1 leading-tight"
                                            >
                                                <span>{isAr ? 'تم الوصول للحد الأقصى للعروض' : 'Maximum Offers Reached'}</span>
                                            </button>
                                        );
                                    }

                                    const hasSubmittedAll = order.parts ? myOffers.length >= order.parts.length : myOffers.length > 0;

                                    if (hasSubmittedAll) {
                                        return (
                                            <button
                                                disabled
                                                className="w-full py-4 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 leading-tight text-white/50 bg-white/5 cursor-not-allowed border border-white/10"
                                            >
                                                <span>{isAr ? 'تم تقديم عروضك المتوفرة' : 'All Offers Submitted'}</span>
                                                <span className="text-xs font-normal opacity-70 flex items-center gap-1"><ShieldCheck size={12}/> {isAr ? 'الأسعار مقفلة، قم بالإلغاء للتعديل' : 'Prices locked, cancel to edit'}</span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={() => setIsBidding(true)}
                                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group ${hasSubmittedAny
                                                ? 'bg-white/5 hover:bg-white/10 text-gold-400 border border-gold-500/20 hover:border-gold-500/40'
                                                : 'bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]'
                                                }`}
                                        >
                                            <span>{hasSubmittedAny ? (isAr ? 'إضافة عرض لقطعة أخرى' : 'Add offer for another part') : (isAr ? 'تقديم عرض الآن' : 'Submit Offer')}</span>
                                            {!hasSubmittedAny && <ArrowIcon size={18} className={`transition-transform ${isAr ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />}
                                        </button>
                                    );
                                })()}
                            </>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* LIGHTBOX IMPLEMENTATION */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    >
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div className="w-full max-w-5xl px-4 flex items-center justify-between gap-4">
                            <button
                                onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
                                disabled={lightboxIndex === 0}
                                className="w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
                            >
                                <ChevronDown size={24} className="rotate-90" />
                            </button>

                            <div className="relative aspect-square md:aspect-video w-full max-h-[80vh] flex items-center justify-center">
                                <img
                                    src={lightboxImages[lightboxIndex]}
                                    alt="Enlarged view"
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>

                            <button
                                onClick={() => setLightboxIndex(Math.min(lightboxImages.length - 1, lightboxIndex + 1))}
                                disabled={lightboxIndex === lightboxImages.length - 1}
                                className="w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
                            >
                                <ChevronDown size={24} className="-rotate-90" />
                            </button>
                        </div>

                        {lightboxImages.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-md">
                                {lightboxImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === lightboxIndex ? 'bg-gold-500 w-6' : 'bg-white/30 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CANCEL OFFER WARNING DIALOG */}
            <AnimatePresence>
                {isCancelDialogOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#1A1814] border border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />
                            
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                    <AlertTriangle size={32} className="animate-bounce" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {isAr ? 'تنبيه: إلغاء العرض ومسحه؟' : 'Warning: Cancel & Delete Offer?'}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed px-2">
                                    {isAr 
                                        ? 'سيتم حذف هذا العرض المسعر نهائياً من العميل ولا يمكن التراجع. إذا أردت تعديل السعر أو المواصفات، يجب حذفه ثم تقديم عرض جديد تماماً.' 
                                        : 'This offer will be permanently deleted and removed from the customer list. To edit, you must cancel and issue a fresh offer.'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={handleCancelOffer}
                                    disabled={isCancelling}
                                    className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all shadow-lg hover:shadow-red-500/20 active:scale-98 flex items-center justify-center gap-2"
                                >
                                    {isCancelling ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <AlertTriangle size={18} />
                                    )}
                                    <span>{isAr ? 'تأكيد الإلغاء والحذف' : 'Confirm Cancellation'}</span>
                                </button>
                                <button
                                    onClick={() => { setIsCancelDialogOpen(false); setOfferToCancel(null); }}
                                    disabled={isCancelling}
                                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold transition-colors border border-white/5"
                                >
                                    {isAr ? 'تراجع (الاحتفاظ بالعرض)' : 'Keep Offer'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PREPARATION CONFIRMATION DIALOG */}
            <AnimatePresence>
                {isPrepareDialogOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#1A1814] border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                            
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {isAr ? 'تأكيد التجهيز النهائي' : 'Confirm Final Preparation'}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed px-2">
                                    {isAr 
                                        ? 'هل القطع محفوظة ومغلفة بشكل محكم وتامة الجاهزية للتسليم لمندوب الشحن؟ سيتم إعلام العميل بانتهاء التجهيز.' 
                                        : 'Are the products securely packed and fully ready to be picked up by the courier? The customer will be instantly notified.'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={handleMarkPrepared}
                                    disabled={isPreparing}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-98 flex items-center justify-center gap-2"
                                >
                                    {isPreparing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} />
                                    )}
                                    <span>{isAr ? 'نعم، الشحنة جاهزة للتسليم' : 'Yes, Ready for Pickup'}</span>
                                </button>
                                <button
                                    onClick={() => setIsPrepareDialogOpen(false)}
                                    disabled={isPreparing}
                                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold transition-colors border border-white/5"
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EMBEDDED SUBMIT OFFER MODAL FORM */}
            <SubmitOfferModal
                isOpen={isBidding}
                onClose={() => setIsBidding(false)}
                requestDetails={order}
                existingOffers={myOffers} // Pass offers back so modal enforces locks
                onSubmit={() => {
                    setIsBidding(false);
                    // Re-fetch my offers to update indicators after submission
                    fetchMyOffers();
                }}
            />
        </div>
    );
};
