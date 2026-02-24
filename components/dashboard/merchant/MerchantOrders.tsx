import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Box, Calendar, MapPin, Printer, ArrowRight, ArrowLeft, AlertTriangle, PlayCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { GlassCard } from '../../ui/GlassCard';
import { Badge } from '../../ui/Badge';
import { WaybillUploadModal } from '../../modals/WaybillUploadModal';

const CarIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
);

const ShippingTimer = ({ startDate, label, isAr }: { startDate: string, label: string, isAr: boolean }) => {
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number } | null>(null);
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!startDate) return;
            const start = new Date(startDate).getTime();
            if (isNaN(start)) return;

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
        }, 1000);

        // Initial call
        const start = new Date(startDate).getTime();
        if (!isNaN(start)) {
            const diff = start + (24 * 60 * 60 * 1000) - new Date().getTime();
            if (diff <= 0) setIsLate(true);
            else setTimeLeft({ h: Math.floor(diff / (1000 * 60 * 60)), m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) });
        }

        return () => clearInterval(interval);
    }, [startDate]);

    if (isLate) {
        return (
            <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded animate-pulse">
                <AlertTriangle size={12} />
                <span>{isAr ? 'متأخر' : 'Late'}</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    return (
        <div className="text-right flex flex-col items-end">
            <span className="block text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${timeLeft.h < 4 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                <span className="font-mono font-bold text-xs">
                    {timeLeft.h}h {timeLeft.m}m
                </span>
            </div>
        </div>
    );
};

// Warranty Timer Calculation for Delivered state
const WarrantyProgress = ({ deliveredAt, durationStr, isAr }: { deliveredAt: string, durationStr: string, isAr: boolean }) => {
    const [progress, setProgress] = useState(100);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (!deliveredAt || !durationStr) return;
        const start = new Date(deliveredAt).getTime();
        if (isNaN(start)) return;

        // Duration Mapping
        let durationDays = 0;
        if (durationStr.includes('3') && !durationStr.includes('month')) durationDays = 3;
        else if (durationStr.includes('1') && !durationStr.includes('month')) durationDays = 30;
        else if (durationStr.includes('month3')) durationDays = 90;
        else if (durationStr.includes('month6')) durationDays = 180;
        else return;

        const totalMs = durationDays * 24 * 60 * 60 * 1000;
        const end = start + totalMs;

        const update = () => {
            const now = new Date().getTime();
            const left = end - now;

            if (left <= 0) {
                setProgress(0);
                setStatusText(isAr ? 'منتهي الصلاحية' : 'Expired');
            } else {
                const percentage = Math.max(0, Math.min(100, (left / totalMs) * 100));
                setProgress(percentage);
                const daysLeft = Math.floor(left / (1000 * 60 * 60 * 24));
                if (daysLeft > 0) {
                    setStatusText(isAr ? `${daysLeft} يوم متبقي` : `${daysLeft} days left`);
                } else {
                    const hoursLeft = Math.floor(left / (1000 * 60 * 60));
                    setStatusText(isAr ? `${hoursLeft} ساعة متبقية` : `${hoursLeft} hours left`);
                }
            }
        };

        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [deliveredAt, durationStr, isAr]);

    return (
        <div className="w-full mt-3">
            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                <span className="flex items-center gap-1"><ShieldCheck size={12} /> {isAr ? 'الضمان' : 'Warranty'}</span>
                <span className={progress === 0 ? 'text-red-400' : 'text-green-400 font-bold'}>{statusText}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${progress > 20 ? 'bg-green-500' : progress > 0 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};


export const MerchantOrders: React.FC = () => {
    const { t, language } = useLanguage();
    const { orders, transitionOrder } = useOrderStore();
    const { addNotification } = useNotificationStore();
    const isAr = language === 'ar';

    const [activeWaybillModal, setActiveWaybillModal] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'ALL' | 'PREPARATION' | 'SHIPPED' | 'DELIVERED'>('PREPARATION');

    // Using strictly filtered orders that are in active transit states.
    const activeOrders = orders.filter(o => ['PREPARATION', 'SHIPPED', 'DELIVERED'].includes(o.status));
    const preparation = activeOrders.filter(o => o.status === 'PREPARATION');
    const shipped = activeOrders.filter(o => o.status === 'SHIPPED');
    const delivered = activeOrders.filter(o => o.status === 'DELIVERED');

    const handleMarkDelivered = async (orderId: any) => {
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
        } else {
            alert(isAr ? "فشل تأكيد التوصيل: " + result.message : "Unable to mark delivered: " + result.message);
        }
    };

    // Robust field extractor
    const extractOrderInfo = (order: any) => {
        const primaryPart = order.parts?.[0]?.name || order.partName || order.part || (isAr ? 'قطعة غير محددة' : 'Unknown Part');
        const extrasCount = order.parts?.length > 1 ? order.parts.length - 1 : 0;
        const partTitle = extrasCount > 0 ? `${primaryPart} + ${extrasCount} ${t.common.others || (isAr ? 'أخرى' : 'others')}` : primaryPart;

        const hasMedia = order.parts?.some((p: any) => p.video || (p.images && p.images.length > 0)) || order.partVideo;
        const vehicle = order.vehicle ? `${order.vehicle.make} ${order.vehicle.model} ${order.vehicle.year}` : (order.vehicleMake ? `${order.vehicleMake} ${order.vehicleModel} ${order.vehicleYear}` : (order.car || (isAr ? 'مركبة غير محددة' : 'Unknown Vehicle')));

        const priceNum = order.acceptedOffer
            ? Number(order.acceptedOffer.unitPrice || 0) + Number(order.acceptedOffer.shippingCost || 0)
            : Number(order.totalAmount || order.price || 0);

        const formattedPrice = isNaN(priceNum) ? '0.00' : priceNum.toLocaleString();

        return { partTitle, hasMedia, vehicle, formattedPrice };
    };

    const tabs = [
        { id: 'ALL', label: isAr ? 'الكل' : 'All', count: activeOrders.length },
        { id: 'PREPARATION', label: t.dashboard.merchant.home.readyShip || (isAr ? 'جاهزة للشحن' : 'Ready for Shipping'), count: preparation.length },
        { id: 'SHIPPED', label: t.dashboard.merchant.home.inTransit || (isAr ? 'جاري التوصيل' : 'In Transit'), count: shipped.length },
        { id: 'DELIVERED', label: t.dashboard.merchant.home.delivered || (isAr ? 'تم التسليم' : 'Delivered'), count: delivered.length },
    ];


    const renderPreparation = () => (
        <div className="bg-[#151310] border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                    <span className="absolute w-4 h-4 rounded-full bg-blue-500 animate-ping opacity-75" />
                    <span className="relative w-3 h-3 rounded-full bg-blue-400" />
                </div>
                {t.dashboard.merchant.home.readyShip || (isAr ? 'جاهزة للشحن' : 'Ready for Shipping')}
            </h3>

            <AnimatePresence mode="popLayout">
                {preparation.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 border-2 border-dashed border-white/5 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                        <Box size={32} className="text-white/20" />
                        <p className="text-white/40 text-sm">{t.dashboard.merchant.shipping.noReady || (isAr ? 'لا توجد طلبات في مرحلة التحضير حالياً.' : 'No orders currently in preparation.')}</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {preparation.map(order => {
                            const info = extractOrderInfo(order);
                            return (
                                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={order.id}>
                                    <GlassCard className="p-5 border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent" />

                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                    <Box size={24} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-gold-400 font-mono font-bold">#{order.orderNumber || order.id}</span>
                                                    </div>
                                                    <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                                                        <span className="line-clamp-1">{info.partTitle}</span>
                                                        {info.hasMedia && <PlayCircle size={14} className="text-gold-400 shrink-0" />}
                                                    </h3>
                                                    <p className="text-sm text-white/50 flex items-center gap-2">
                                                        <CarIcon size={14} className="shrink-0" />
                                                        <span className="line-clamp-1">{info.vehicle}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 min-w-[140px] pl-4 sm:pl-0 sm:border-l border-white/5">
                                                <div className="text-left sm:text-right">
                                                    <span className="block text-xs text-white/40 uppercase">{t.dashboard.merchant.home.paidAmount || (isAr ? 'المبلغ' : 'Amount')}</span>
                                                    <span className="block text-lg font-bold text-white font-mono">{info.formattedPrice} <span className="text-xs text-gold-400">SAR</span></span>
                                                </div>
                                                {order.acceptedOffer?.submittedAt || order.createdAt ? (
                                                    <ShippingTimer startDate={order.acceptedOffer?.submittedAt || order.createdAt} label={t.dashboard.merchant.timers.shipping_deadline || (isAr ? 'موعد الشحن' : 'Shipping Deadline')} isAr={isAr} />
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                                            <button
                                                onClick={() => setActiveWaybillModal(order.id)}
                                                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Printer size={16} />
                                                {t.dashboard.merchant.shipping.generate || (isAr ? 'إصدار بوليصة ورقم تتبع' : 'Generate Waybill')}
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderShipped = () => (
        <div className="bg-[#151310] border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Truck className="text-purple-400" size={24} />
                {t.dashboard.merchant.home.inTransit || (isAr ? 'جاري التوصيل' : 'In Transit')}
            </h3>

            <AnimatePresence mode="popLayout">
                {shipped.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 border-2 border-dashed border-white/5 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                        <Truck size={32} className="text-white/20" />
                        <p className="text-white/40 text-sm">{t.dashboard.merchant.shipping.noShipments || (isAr ? 'لا توجد شحنات في الطريق حالياً.' : 'No shipments currently in transit.')}</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {shipped.map(order => {
                            const info = extractOrderInfo(order);
                            return (
                                <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={order.id}>
                                    <GlassCard className="p-5 border border-white/5 hover:border-purple-500/30 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent" />

                                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                                    <Truck size={24} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-gold-400 font-mono font-bold">#{order.orderNumber || order.id}</span>
                                                    </div>
                                                    <h3 className="font-bold text-white mb-1 line-clamp-1">{info.partTitle}</h3>
                                                    <div className="flex items-center gap-2 mt-2 bg-white/5 px-2 py-1 rounded w-fit">
                                                        <Box size={12} className="text-white/40" />
                                                        <span className="text-xs text-white/60 font-mono tracking-wider">{order.courier || 'DHL'} - {order.waybillNumber || '7823490123'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-4">
                                            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[60%] animate-pulse" />
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex gap-2">
                                            <button
                                                onClick={() => handleMarkDelivered(order.id)}
                                                className="flex-1 py-2.5 bg-white/5 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                <CheckCircle2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                {isAr ? 'تأكيد التسليم اليدوي للعميل' : 'Manual Confirm Delivery'}
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderDelivered = () => (
        <div className="pt-2 mt-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={24} />
                {t.dashboard.merchant.home.delivered || (isAr ? 'تم التسليم (فترة الضمان)' : 'Delivered (Warranty Period)')}
            </h3>

            <AnimatePresence mode="popLayout">
                {delivered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 border-2 border-dashed border-white/5 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                        <CheckCircle2 size={32} className="text-white/20" />
                        <p className="text-white/40 text-sm">{isAr ? 'لم تقم بتسليم أي طلبات حديثاً.' : 'No items delivered recently.'}</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {delivered.map(order => {
                            const info = extractOrderInfo(order);
                            // Safe fallback to updated at if deliveredAt missing
                            const deliveredAt = order.deliveredAt || order.updatedAt;
                            const warrantyStr = order.acceptedOffer?.warranty || 'days3';

                            return (
                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} key={order.id}>
                                    <GlassCard className="p-4 bg-[#151310] border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <span className="text-gold-400 text-xs font-mono block mb-1">#{order.orderNumber || order.id}</span>
                                                <span className="font-bold text-white text-sm line-clamp-1">{info.partTitle}</span>
                                            </div>
                                            <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded shrink-0">{t.dashboard.merchant.status.completed || (isAr ? 'مكتمل' : 'Completed')}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono mb-1">
                                            <Calendar size={12} />
                                            {isAr ? 'سلمت يوم:' : 'Delivered:'} {new Date(deliveredAt).toLocaleDateString()}
                                        </div>

                                        {order.acceptedOffer?.warranty && order.acceptedOffer.warranty !== 'none' ? (
                                            <WarrantyProgress deliveredAt={deliveredAt} durationStr={warrantyStr} isAr={isAr} />
                                        ) : (
                                            <div className="mt-3 text-[10px] text-white/30 text-center bg-white/5 py-1.5 rounded">{isAr ? 'بدون ضمان' : 'No Warranty'}</div>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {activeWaybillModal && (
                <WaybillUploadModal
                    isOpen={!!activeWaybillModal}
                    onClose={() => setActiveWaybillModal(null)}
                    orderId={activeWaybillModal}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">{t.dashboard.merchant.headers.activeOrders || (isAr ? 'الطلبات النشطة' : 'Active Orders')}</h1>
                    <p className="text-white/50 text-sm">
                        {isAr ? 'إدارة وتتبع الشحنات الخاصة بطلبات عملائك بدقة' : 'Manage and track shipments for your customers precisely'}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-white/5 pb-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            relative px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2
                            ${activeTab === tab.id ? 'text-gold-400' : 'text-white/40 hover:text-white'}
                        `}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeTab === tab.id ? 'bg-gold-500/20 text-gold-400' : 'bg-white/10 text-white/50'}`}>
                            {tab.count}
                        </span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabOrders"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Render Tab Contents based on activeTab */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'ALL' && (
                        <div className="space-y-12">
                            {renderPreparation()}
                            {renderShipped()}
                            {renderDelivered()}
                        </div>
                    )}
                    {activeTab === 'PREPARATION' && renderPreparation()}
                    {activeTab === 'SHIPPED' && renderShipped()}
                    {activeTab === 'DELIVERED' && renderDelivered()}
                </motion.div>
            </AnimatePresence>

        </div>
    );
};
