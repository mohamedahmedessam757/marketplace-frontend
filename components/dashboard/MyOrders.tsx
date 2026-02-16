
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Badge, StatusType } from '../ui/Badge';
import { Search, Filter, Calendar, Box, ChevronRight, ChevronLeft, RefreshCw, XCircle, Trash2, CreditCard, Tag, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOrdersStore } from '../../stores/useOrdersStore';
import { Order } from '../../types';

// Timer Component for 24h Expiration
const OrderTimer = ({ createdAt, status }: { createdAt: string, status: string }) => {
    const { language } = useLanguage();
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (status !== 'AWAITING_OFFERS') {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const created = new Date(createdAt).getTime();
            const now = new Date().getTime();
            const expiresAt = created + (24 * 60 * 60 * 1000); // 24 hours in ms
            const diff = expiresAt - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTimeLeft(); // Initial call
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [createdAt, status]);

    if (status !== 'AWAITING_OFFERS') return null;

    if (isExpired) {
        return (
            <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                <AlertCircle size={12} />
                <span>{language === 'ar' ? 'منتهى' : 'Expired'}</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-2 text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full text-xs font-mono font-bold border border-gold-500/20">
            <Clock size={12} />
            <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

interface MyOrdersProps {
    onNavigate: (path: string, id?: number) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { orders, loading, fetchOrders, cancelOrder, deleteOrder, renewOrder, canCancelOrder } = useOrdersStore();

    // Filters State
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [offersFilter, setOffersFilter] = useState<string>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const ArrowIcon = language === 'ar' ? ChevronLeft : ChevronRight;

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Helper for Expiration
    const isOrderExpired = (order: Order) => {
        if (order.status !== 'AWAITING_OFFERS') return false;
        const created = new Date(order.created_at).getTime();
        const now = new Date().getTime();
        return (now - created) > (24 * 60 * 60 * 1000);
    };

    // Filtering Logic (Matching Vue implementation)
    const filteredOrders = orders.filter(order => {
        // 1. Search
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            order.part_name.toLowerCase().includes(searchLower) ||
            order.vehicle_make.toLowerCase().includes(searchLower) ||
            order.order_number.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // 2. Status Filter
        if (statusFilter !== 'ALL') {
            const expired = isOrderExpired(order);

            if (statusFilter === 'ACTIVE') {
                // Must NOT be expired
                if (expired) return false;
                if (!['AWAITING_OFFERS', 'AWAITING_PAYMENT', 'PREPARATION', 'SHIPPED', 'DISPUTED'].includes(order.status)) return false;
            } else if (statusFilter === 'COMPLETED') {
                if (!['COMPLETED', 'DELIVERED'].includes(order.status)) return false;
            } else if (statusFilter === 'EXPIRED') {
                // Must be 'AWAITING_OFFERS' AND Expired, OR explicitly 'CANCELLED'/'RETURNED' (if we want to group them, but user said change Cancelled to Expired logic)
                // User said: "Rename Cancelled to Expired and make it bring all Expired offers".
                // I will include actual logical expirations AND explicit cancellations for completeness, or just logical expirations if strictly requested. 
                // "ال فلتر على حسب الحاله محتاج أغير فيه كلمه ملغاه الى منتهى وتكون شغاله بتجيب كل العروض المنتهيه"
                // I will include both for better UX, or just Expired. Let's stick to Expired + Cancelled to be safe, or just Expired?
                // "Expired" usually implies "Time run out". "Cancelled" implies user action.
                // I will strictly check for Expired (Time) OR Cancelled (Status) to show in this tab, as "Cancelled" tab is gone.
                if (!expired && !['CANCELLED', 'RETURNED'].includes(order.status)) return false;
            } else if (statusFilter === 'PENDING') {
                if (expired) return false;
                if (order.status !== 'AWAITING_OFFERS') return false;
            }
        }

        // 3. Offers Filter
        if (offersFilter !== 'ALL') {
            const hasOffers = (order.offers?.length || 0) > 0;
            if (offersFilter === 'WITH_OFFERS' && !hasOffers) return false;
            if (offersFilter === 'WITHOUT_OFFERS' && hasOffers) return false;
        }

        // 4. Payment Filter
        if (paymentFilter !== 'ALL') {
            const isPaid = order.status !== 'AWAITING_PAYMENT' && order.status !== 'AWAITING_OFFERS' && order.status !== 'CANCELLED' && order.status !== 'RETURNED';

            if (paymentFilter === 'PAID' && !isPaid) return false;
            if (paymentFilter === 'UNPAID' && isPaid) return false;
        }

        return true;
    });

    const handleCancel = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm(t.dashboard.orders.cancelConfirm || 'Are you sure you want to cancel this order?')) {
            await cancelOrder(id);
        }
    };

    // Removed handleDelete as per requirements

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.menu.orders}</h1>
                        <p className="text-white/50 text-sm">{t.dashboard.orders.manageTitle}</p>
                    </div>
                    <div>
                        <button
                            onClick={() => fetchOrders()}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={`text-gold-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                            <input
                                type="text"
                                placeholder={(t.dashboard.orders as any).searchPlaceholder || (language === 'ar' ? 'بحث عن الطلبات...' : 'Search orders...')}
                                className="bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50 w-full placeholder:text-white/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        {/* Status Select */}
                        <div className="relative">
                            <Filter size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:border-white/20"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="ALL" className="text-black bg-white">{t.dashboard.orders.tabs.all}</option>
                                <option value="ACTIVE" className="text-black bg-white">{t.dashboard.orders.tabs.active}</option>
                                <option value="COMPLETED" className="text-black bg-white">{t.dashboard.orders.tabs.completed}</option>
                                <option value="EXPIRED" className="text-black bg-white">{language === 'ar' ? 'منتهى' : 'Expired'}</option>
                            </select>
                        </div>

                        {/* Offers Select */}
                        <div className="relative">
                            <Tag size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" />
                            <select
                                value={offersFilter}
                                onChange={(e) => setOffersFilter(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:border-white/20"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="ALL" className="text-black bg-white">{t.dashboard.orders.filterOffers || (language === 'ar' ? 'جميع العروض' : 'All Offers')}</option>
                                <option value="WITH_OFFERS" className="text-black bg-white">{t.dashboard.orders.withOffers || (language === 'ar' ? 'مع عروض' : 'With Offers')}</option>
                                <option value="WITHOUT_OFFERS" className="text-black bg-white">{t.dashboard.orders.withoutOffers || (language === 'ar' ? 'بدون عروض' : 'No Offers')}</option>
                            </select>
                        </div>

                        {/* Payment Select (NEW) */}
                        <div className="relative">
                            <CreditCard size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:border-white/20"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="ALL" className="text-black bg-white">{language === 'ar' ? 'حالة الدفع' : 'Payment Status'}</option>
                                <option value="PAID" className="text-black bg-white">{language === 'ar' ? 'مدفوع بالكامل' : 'Paid'}</option>
                                <option value="UNPAID" className="text-black bg-white">{language === 'ar' ? 'غير مدفوع' : 'Unpaid'}</option>
                            </select>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="text-center py-20">
                            <RefreshCw className="animate-spin mx-auto text-gold-500 mb-4" size={32} />
                            <p className="text-white/50">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order, idx) => {
                            const expired = isOrderExpired(order);
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => onNavigate('order-details', order.id)}
                                >
                                    <GlassCard className={`
                            p-6 cursor-pointer hover:border-gold-500/30 transition-all group bg-[#151310]
                            ${language === 'ar' ? 'border-r-4' : 'border-l-4'}
                            ${order.status === 'COMPLETED' ? 'border-r-green-500' :
                                            order.status === 'AWAITING_PAYMENT' ? 'border-r-orange-500' :
                                                expired ? 'border-r-red-500' : // Red for Expired
                                                    order.status === 'AWAITING_OFFERS' ? 'border-r-yellow-500' :
                                                        order.status === 'CANCELLED' ? 'border-r-gray-600' :
                                                            'border-r-gold-500'}
                        `}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <Box size={24} className="text-white/30 group-hover:text-gold-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-mono text-xs text-white/40">#{order.order_number}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-white text-lg">{order.part_name}</h3>
                                                    <p className="text-sm text-white/60">{order.vehicle_make} {order.vehicle_model} {order.vehicle_year}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                                <div className="flex flex-col items-end gap-2">
                                                    {expired ? (
                                                        <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                                                            <AlertCircle size={12} />
                                                            <span>{language === 'ar' ? 'منتهى' : 'Expired'}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge status={order.status as StatusType} />
                                                    )}

                                                    {!expired && (
                                                        <OrderTimer createdAt={order.created_at} status={order.status} />
                                                    )}

                                                    {(order.offers?.length || 0) > 0 && order.status === 'AWAITING_OFFERS' && (
                                                        <span className={`text-xs font-medium ${expired ? 'text-white/60' : 'text-gold-400 animate-pulse'}`}>
                                                            {order.offers?.length} {t.dashboard.orders.newOffers}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Action Buttons */}
                                                    {canCancelOrder(order.id) && !expired && (
                                                        <button
                                                            onClick={(e) => handleCancel(e, order.id)}
                                                            className="p-2 hover:bg-red-500/20 rounded-full text-white/30 hover:text-red-500 transition-colors"
                                                            title={t.dashboard.orders.cancelConfirm || "Cancel Order"}
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}

                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-gold-500 transition-all">
                                                        <ArrowIcon size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Box size={24} className="text-white/20" />
                            </div>
                            <h3 className="text-white font-bold mb-1">{t.dashboard.orders.notFound}</h3>
                            <p className="text-white/40 text-sm">{t.dashboard.orders.notFoundDesc}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
