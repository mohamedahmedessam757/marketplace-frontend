import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import {
    ArrowLeft, ArrowRight, Clock, MapPin, Package, Settings, Monitor, ShieldCheck, FileText, CheckCircle2, ChevronDown, MessageCircle, AlertTriangle, Search, Car, Box, Calendar, Truck, User
} from 'lucide-react';
import { CountdownTimer } from '../OrderDetails';
import { SubmitOfferModal } from './SubmitOfferModal';
import { GlassCard } from '../../ui/GlassCard';

interface MarketplaceOfferDetailsProps {
    orderId: string;
    onBack: () => void;
}

export const MarketplaceOfferDetails: React.FC<MarketplaceOfferDetailsProps> = ({ orderId, onBack }) => {
    const { t, language } = useLanguage();
    const { orders, addOfferToOrder } = useOrderStore(); // We'll need to fetch the exact order from API in real app
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ArrowRight : ArrowLeft;

    const [order, setOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Bidding State
    const [isBidding, setIsBidding] = useState(false);

    useEffect(() => {
        // Find the specific order from the store or fetch it.
        const foundOrder = orders.find(o => o.id.toString() === orderId.toString());
        setOrder(foundOrder);
        setIsLoading(false);
    }, [orderId, orders]);

    const getOfferDeadline = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setHours(d.getHours() + 24);
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-white/50">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
        );
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

    const expired = isOrderExpired(order.createdAt || order.date);

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
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {isAr ? 'تفاصيل طلب العميل' : 'Customer Request Details'}
                            </h1>
                            <span className="px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-mono">
                                #{order.id}
                            </span>
                        </div>
                        <p className="text-white/50 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {order.date}</span>
                            <span className="text-white/20 px-2">•</span>
                            <span className="flex items-center gap-1"><User size={14} /> {order.customer?.name || (isAr ? 'عميل إي-تشليح' : 'E-Tashleh Customer')}</span>
                        </p>
                    </div>
                </div>

                {/* Status Badge & Timer */}
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-full md:w-auto">
                    {expired || order.status !== 'AWAITING_OFFERS' ? (
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={16} />
                            <span className="font-bold">{isAr ? 'مغلق للعروض' : 'Closed for Bidding'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <span className="text-sm text-white/60">{isAr ? 'الوقت المتبقي لتقديم عرض:' : 'Time left to offer:'}</span>
                            <CountdownTimer targetDate={getOfferDeadline(order.createdAt || order.date)} compact={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Request Intel */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Vechile Infomation Card */}
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
                                    <p className="text-sm font-bold text-white">{order.conditionPref === 'new' ? (isAr ? 'جديد (وكالة)' : 'New Only') : order.conditionPref === 'used' ? (isAr ? 'مستعمل (تشليح)' : 'Used Only') : (isAr ? 'غير محدد' : 'Not Specified')}</p>
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

                    {/* Parts List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Box className="text-gold-500" size={24} />
                            {isAr ? 'القطع المطلوبة' : 'Requested Parts'}
                        </h2>

                        {order.parts && order.parts.length > 0 ? (
                            order.parts.map((part: any, idx: number) => (
                                <GlassCard key={idx} className="p-6 relative overflow-hidden">
                                    {/* Numerator */}
                                    <div className={`absolute top-0 ${isAr ? 'right-0 rounded-bl-xl' : 'left-0 rounded-br-xl'} bg-white/5 px-3 py-1 border-b ${isAr ? 'border-l' : 'border-r'} border-white/10 text-xs font-mono text-white/40`}>
                                        {idx + 1}
                                    </div>
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
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
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

                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <span className="text-white/60 text-sm">{isAr ? 'العروض الحالية من التجار المعتمدين' : 'Current Active Bids'}</span>
                                <span className="text-white font-bold text-lg">{order._count?.offers || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <span className="text-white/60 text-sm">{isAr ? 'مدى المنافسة' : 'Competition Level'}</span>
                                {(!order._count?.offers || order._count?.offers === 0) ? (
                                    <span className="text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded">{isAr ? 'منخفض' : 'Low'}</span>
                                ) : order._count?.offers < 3 ? (
                                    <span className="text-yellow-400 text-sm font-bold bg-yellow-500/10 px-2 py-1 rounded">{isAr ? 'متوسط' : 'Medium'}</span>
                                ) : (
                                    <span className="text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">{isAr ? 'عالي' : 'High'}</span>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Bidding Card */}
                    <GlassCard className="p-6 sticky top-24">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                                <FileText size={28} className="text-gold-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {isAr ? 'هل لديك القطع المطلوبة؟' : 'Have the parts?'}
                            </h3>
                            <p className="text-white/50 text-sm px-4">
                                {isAr ? 'أرسل تسعيرتك الآن، المشتري ينتظر!' : 'Submit your pricing now, the buyer is waiting!'}
                            </p>
                        </div>

                        {expired || order.status !== 'AWAITING_OFFERS' ? (
                            <button
                                disabled
                                className="w-full py-4 rounded-xl font-bold text-white/50 bg-white/5 cursor-not-allowed border border-white/10"
                            >
                                {isAr ? 'العطاء مغلق' : 'Bidding Closed'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsBidding(true)}
                                className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 group"
                            >
                                <span>{isAr ? 'تقديم عرض السعر الآن' : 'Submit Pricing Offer'}</span>
                                <ArrowIcon size={18} className={`transition-transform ${isAr ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                            </button>
                        )}

                        <p className="text-center text-xs text-white/30 mt-4">
                            {isAr ? 'تقديم العرض يعتبر التزام قانوني' : 'Submitting an offer forms a legal commitment'}
                        </p>
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

            {/* EMBEDDED SUBMIT OFFER MODAL FORM */}
            <SubmitOfferModal
                isOpen={isBidding}
                onClose={() => setIsBidding(false)}
                requestDetails={order}
                onSubmit={() => {
                    setIsBidding(false);
                    onBack(); // Route back to marketplace after successful submit
                }}
            />

        </div>
    );
};
