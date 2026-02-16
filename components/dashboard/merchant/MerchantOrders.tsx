
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Box, Calendar, MapPin, Printer, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/Badge';
import { WaybillUploadModal } from '../../modals/WaybillUploadModal';

const CarIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
);

const ShippingTimer = ({ startDate, label, t }: { startDate: string, label: string, t: any }) => {
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number } | null>(null);
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const start = new Date(startDate).getTime();
            const deadline = start + (24 * 60 * 60 * 1000); // 24 Hours Shipping SLA
            const now = new Date().getTime();
            const diff = deadline - now;

            if (diff <= 0) {
                setIsLate(true);
                setTimeLeft(null);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ h, m });
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [startDate]);

    if (isLate) {
        return (
            <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">
                <AlertTriangle size={12} />
                <span>{t.common.late}</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    return (
        <div className="text-right">
            <span className="block text-[10px] text-white/40">{label}</span>
            <span className={`font-mono font-bold text-xs ${timeLeft.h < 4 ? 'text-red-400' : 'text-green-400'}`}>
                {timeLeft.h}h {timeLeft.m}m
            </span>
        </div>
    );
};

const OrderCard = memo(({ order, action, t, label }: { order: any; action?: React.ReactNode; t: any; label?: string }) => {
    return (
        <GlassCard className="p-5 mb-4 border border-white/5 bg-[#151310] hover:border-gold-500/20 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Box size={24} className="text-white/40" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gold-400 font-mono font-bold">#{order.id}</span>
                            <Badge status={order.status} />
                        </div>
                        <h3 className="font-bold text-white mb-1">
                            {order.parts && order.parts.length > 0
                                ? (order.parts.length > 1 ? `${order.parts[0].name} + ${order.parts.length - 1} ${t.common.others || 'others'}` : order.parts[0].name)
                                : order.part}
                            {/* Video Indicator */}
                            {(order.parts?.some((p: any) => p.video) || order.partVideo) && (
                                <span className="ml-2 inline-flex items-center justify-center p-1 rounded-full bg-gold-500/10 text-gold-500" title="Video Available">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-white/50 flex items-center gap-2">
                            <CarIcon size={14} />
                            {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model} ${order.vehicle.year}` : order.car}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {t.common.location}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {order.date}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between items-end min-w-[150px]">
                    <div className="text-right">
                        <span className="block text-sm text-white/60">{t.dashboard.merchant.home.paidAmount}</span>
                        <span className="block text-xl font-bold text-white font-mono">{order.price}</span>
                    </div>

                    <div className="mt-2 w-full flex flex-col items-end gap-2">
                        {order.status === 'PREPARATION' && order.offerAcceptedAt && (
                            <ShippingTimer startDate={order.offerAcceptedAt} label={label || ''} t={t} />
                        )}
                        {action}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
});

export const MerchantOrders: React.FC = () => {
    const { t, language } = useLanguage();
    const { orders, transitionOrder } = useOrderStore(); // Use transitionOrder
    const { addNotification } = useNotificationStore();
    const isAr = language === 'ar';

    const [activeWaybillModal, setActiveWaybillModal] = useState<number | null>(null);

    const activeOrders = orders.filter(o => ['PREPARATION', 'SHIPPED', 'DELIVERED'].includes(o.status));
    const preparation = activeOrders.filter(o => o.status === 'PREPARATION');
    const shipped = activeOrders.filter(o => o.status === 'SHIPPED');
    const delivered = activeOrders.filter(o => o.status === 'DELIVERED');

    const handleMarkDelivered = async (orderId: any) => {
        // Use FSM transition
        const oId = Number(orderId);
        const result = await transitionOrder(oId, 'DELIVERED', 'MERCHANT');

        if (result.success) {
            addNotification({
                type: 'delivery',
                titleKey: 'delivered',
                message: isAr
                    ? `تم تسليم طلبك #${orderId} بنجاح. نرجو فحص القطعة.`
                    : `Your order #${orderId} has been delivered successfully. Please inspect the item.`,
                orderId: orderId,
                linkTo: 'order-details',
                priority: 'urgent',
                channels: ['app', 'whatsapp']
            });

            // Request Rating
            setTimeout(() => {
                addNotification({
                    type: 'rate',
                    titleKey: 'rateRequest',
                    message: isAr
                        ? `كيف كانت تجربتك مع الطلب #${orderId}؟ شاركنا تقييمك.`
                        : `How was your experience with order #${orderId}? Please rate us.`,
                    orderId: orderId,
                    linkTo: 'order-details',
                    priority: 'normal',
                    channels: ['app']
                });
            }, 5000);
        } else {
            alert("Unable to mark delivered: " + result.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {activeWaybillModal && (
                <WaybillUploadModal
                    isOpen={!!activeWaybillModal}
                    onClose={() => setActiveWaybillModal(null)}
                    orderId={activeWaybillModal}
                />
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{t.dashboard.merchant.headers.activeOrders}</h1>
                    <p className="text-white/50 text-sm">
                        {t.dashboard.merchant.shipping?.noReady === 'لا توجد طلبات جاهزة للشحن' // Fallback check if key missing? No, assume keys exist from previous step.
                            ? (isAr ? 'إدارة الشحن والتوصيل للطلبات المدفوعة' : 'Manage shipping and fulfillment for paid orders')
                            : (isAr ? 'إدارة الشحن والتوصيل للطلبات المدفوعة' : 'Manage shipping and fulfillment for paid orders')}
                    </p>
                </div>
            </div>

            {/* 1. PREPARATION STAGE */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    {t.dashboard.merchant.home.readyShip}
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/60">{preparation.length}</span>
                </h3>

                {preparation.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-white/30 text-sm">
                        {t.dashboard.merchant.shipping.noReady}
                    </div>
                ) : (
                    preparation.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            t={t}
                            label={t.dashboard.merchant.timers.shipping_deadline}
                            action={
                                <button
                                    onClick={() => setActiveWaybillModal(order.id)}
                                    className="w-full md:w-auto px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-gold-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer size={16} />
                                    {t.dashboard.merchant.shipping.generate}
                                </button>
                            }
                        />
                    ))
                )}
            </div>

            {/* 2. SHIPPED STAGE */}
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Truck className="text-purple-400" size={20} />
                    {t.dashboard.merchant.home.inTransit}
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/60">{shipped.length}</span>
                </h3>

                {shipped.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-white/30 text-sm">
                        {t.dashboard.merchant.shipping.noShipments}
                    </div>
                ) : (
                    shipped.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            t={t}
                            action={
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-white/40 font-mono tracking-wider">{order.courier || t.dashboard.merchant.shipping.couriers.dhl} - {order.waybillNumber}</div>
                                    <button
                                        onClick={() => handleMarkDelivered(order.id)}
                                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-400 border border-green-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                        <CheckCircle2 size={14} />
                                        {isAr ? 'تأكيد التوصيل' : 'Mark Delivered'}
                                    </button>
                                </div>
                            }
                        />
                    ))
                )}
            </div>

            {/* 3. DELIVERED */}
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-green-400" size={20} />
                    {t.dashboard.merchant.home.delivered}
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/60">{delivered.length}</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {delivered.map(order => (
                        <GlassCard key={order.id} className="p-4 bg-white/5 border-transparent">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-white">{order.part}</span>
                                <span className="text-xs text-green-400 font-mono">{t.dashboard.merchant.status.completed}</span>
                            </div>
                            <div className="text-xs text-white/40 mb-3">
                                {t.dashboard.tracking.steps.delivered}: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Unknown'}
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-green-500 w-[80%]" />
                            </div>
                            <div className="flex justify-between text-[10px] text-white/30 mt-1">
                                <span>{t.dashboard.merchant.home.warrantyActive}</span>
                                <span>38h {t.common.left}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

        </div>
    );
};
