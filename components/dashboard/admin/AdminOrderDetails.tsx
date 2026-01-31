
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useOrderStore, SLA_LIMITS } from '../../../stores/useOrderStore';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge, StatusType } from '../../ui/Badge';
import { StatusTimeline } from '../../ui/StatusTimeline';
import { ChevronLeft, ChevronRight, User, Store, DollarSign, Settings2, ShieldAlert, AlertTriangle, Clock, PlayCircle } from 'lucide-react';

interface AdminOrderDetailsProps {
    orderId: number;
    onBack: () => void;
}

// Internal Component: Risk Timer
const RiskTimer = ({ updatedAt, limitHours }: { updatedAt: string, limitHours: number }) => {
    const { t } = useLanguage();
    const [elapsed, setElapsed] = useState(0); // hours

    useEffect(() => {
        const update = () => {
            const diff = Date.now() - new Date(updatedAt).getTime();
            setElapsed(diff / (1000 * 60 * 60));
        };
        update();
        const interval = setInterval(update, 60000); // Update every min
        return () => clearInterval(interval);
    }, [updatedAt]);

    const progress = Math.min((elapsed / limitHours) * 100, 100);
    const isOverdue = elapsed > limitHours;

    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                <span className={isOverdue ? 'text-red-400' : 'text-white/60'}>{t.admin.riskTimer.sla}</span>
                <span className={isOverdue ? 'text-red-400' : 'text-gold-400'}>
                    {elapsed.toFixed(1)}{t.admin.riskTimer.hours} / {limitHours}{t.admin.riskTimer.hours}
                </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {isOverdue && (
                <div className="flex items-center gap-1 text-red-400 text-xs mt-1 font-bold animate-pulse">
                    <AlertTriangle size={12} /> {t.admin.riskTimer.overdue} {(elapsed - limitHours).toFixed(1)}{t.admin.riskTimer.hours}
                </div>
            )}
        </div>
    );
};

export const AdminOrderDetails: React.FC<AdminOrderDetailsProps> = ({ orderId, onBack }) => {
    const { t, language } = useLanguage();
    const { getOrder, transitionOrder, forceStatus, getValidTransitions } = useOrderStore();
    const { currentAdmin, commissionRate } = useAdminStore();

    const order = getOrder(orderId);
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ChevronRight : ChevronLeft;

    // Permissions
    const isAdmin = currentAdmin?.role === 'ADMIN' || currentAdmin?.role === 'SUPER_ADMIN';
    const isSuper = currentAdmin?.role === 'SUPER_ADMIN';

    if (!order) return <div className="text-white p-8">{t.admin.orderDetails.notFound}</div>;

    // Financial Calc
    const rawPrice = order.price ? parseFloat(order.price.replace(/[^0-9.]/g, '')) : 0;
    const shipping = 50;
    const commissionVal = rawPrice * (commissionRate / 100);
    const totalCustomer = rawPrice + shipping;

    const validTransitions = getValidTransitions(order.status);
    const slaLimit = SLA_LIMITS[order.status];

    const handleTransition = async (target: StatusType) => {
        const result = await transitionOrder(orderId, target, currentAdmin?.role || 'ADMIN');
        if (!result.success) alert(result.message);
    };

    const handleForce = (target: StatusType) => {
        if (confirm(t.admin.actions.forceWarningDialog)) {
            forceStatus(orderId, target, "Admin Manual Override via Dashboard");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Top Bar */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                    <ArrowIcon size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {t.admin.orderDetails.title} <span className="text-gold-400 font-mono">#{order.id}</span>
                    </h1>
                    <div className="text-xs text-white/40">{t.admin.orderDetails.lastUpdated}: {new Date(order.updatedAt).toLocaleString()}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Col 1: Status & Actions */}
                <div className="lg:col-span-1 space-y-6">

                    {/* 1. Current Status & Risk Timer */}
                    <GlassCard className="p-6 bg-[#151310] border-gold-500/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex justify-between">
                            <span>{t.admin.orderDetails.currentStatus}</span>
                            {slaLimit && <Clock size={16} className="text-white/40" />}
                        </h3>

                        <div className="mb-6 flex flex-col gap-4">
                            <Badge status={order.status} className="w-full py-3 text-sm" />

                            {slaLimit && (
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <RiskTimer updatedAt={order.updatedAt} limitHours={slaLimit} />
                                </div>
                            )}
                        </div>

                        <div className="scale-90 origin-top">
                            <StatusTimeline currentStatus={order.status} />
                        </div>
                    </GlassCard>

                    {/* 2. Allowed Actions (Standard Flow) */}
                    {isAdmin && validTransitions.length > 0 && (
                        <GlassCard className="p-6 bg-green-900/5 border-green-500/20">
                            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <PlayCircle size={16} />
                                {t.admin.orderDetails.availableActions}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {validTransitions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleTransition(status)}
                                        className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex justify-between items-center"
                                    >
                                        <span>{t.admin.actions.move} {t.common.status[status]}</span>
                                        <ChevronRight size={14} />
                                    </button>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* 3. Force Actions (Super Admin Only) */}
                    <GlassCard className="p-6 bg-red-900/5 border-red-500/10 opacity-80 hover:opacity-100 transition-opacity">
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert size={16} />
                            {t.admin.actions.danger}
                        </h3>

                        {!isSuper ? (
                            <div className="text-xs text-white/30 italic">{t.admin.actions.superReq}</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {['CANCELLED', 'RETURNED', 'DISPUTED', 'COMPLETED'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleForce(s as StatusType)}
                                        disabled={order.status === s}
                                        className="px-2 py-2 rounded-lg text-[10px] font-bold border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                                    >
                                        {t.admin.actions.force} {t.common.status[s as StatusType]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Col 2: Part Details */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            {order.part}
                        </h3>
                        <div className="flex-1 space-y-4">
                            <div className="aspect-video bg-black/40 rounded-xl border border-white/10 flex items-center justify-center text-white/20 overflow-hidden relative">
                                {order.partImages && order.partImages.length > 0 ? (
                                    <img
                                        src={order.partImages[0]}
                                        alt={order.part}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{t.admin.orderDetails.noImage}</span>
                                )}
                                {order.partImages && order.partImages.length > 1 && (
                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                                        +{order.partImages.length - 1}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/40">{t.admin.orderDetails.car}</span>
                                    <span className="text-white font-medium">{order.car}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/40">{t.admin.orderDetails.vin}</span>
                                    <span className="text-white font-mono">{order.vin || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/40">{t.admin.orderDetails.offersCount}</span>
                                    <span className="text-gold-400 font-bold">{order.offersCount}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Col 3: Participants & Financials */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Participants */}
                    <GlassCard className="p-6 bg-[#1A1814]">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            {t.admin.orderDetails.participants}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-400"><User size={16} /></div>
                                <div>
                                    <div className="text-[10px] text-white/40">{t.admin.orderDetails.customerInfo}</div>
                                    <div className="text-sm font-bold text-white">{order.customer?.name || `Customer`}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="p-2 rounded-full bg-gold-500/10 text-gold-400"><Store size={16} /></div>
                                <div>
                                    <div className="text-[10px] text-white/40">{t.admin.orderDetails.merchantInfo}</div>
                                    <div className="text-sm font-bold text-white">{order.merchantName || 'Pending'}</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Financials */}
                    <GlassCard className="p-6 bg-gradient-to-br from-[#1A1814] to-green-900/10 border-green-500/20">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                            <DollarSign size={16} className="text-green-400" />
                            {t.admin.orderDetails.financials}
                        </h3>

                        {order.price ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-white/60">
                                    <span>{t.admin.orderDetails.basePrice}</span>
                                    <span>{rawPrice}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>{t.admin.orderDetails.shipping}</span>
                                    <span>{shipping}</span>
                                </div>
                                <div className="h-px bg-white/10 my-2" />
                                <div className="flex justify-between font-bold text-white">
                                    <span>{t.admin.orderDetails.total}</span>
                                    <span className="text-gold-400">{totalCustomer} SAR</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-dashed border-white/10">
                                    <div className="flex justify-between text-green-400 text-xs">
                                        <span>{t.admin.orderDetails.commission} ({commissionRate}%)</span>
                                        <span>+{commissionVal.toFixed(2)} SAR</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-white/30 text-xs py-4">{t.admin.orderDetails.pendingFinancials}</div>
                        )}
                    </GlassCard>
                </div>

            </div>

            {/* 4. Offers Section (New) */}
            <GlassCard className="p-6 bg-[#1A1814] border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                    {t.dashboard.merchant.submittedOffers || 'Received Offers'} ({order.offersCount})
                </h3>
                {order.offers && order.offers.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {order.offers.map((offer: any) => (
                            <div key={offer.id} className="bg-white/5 rounded-xl p-4 border border-white/5 flex gap-4">
                                {/* Image if available */}
                                {offer.offerImage && (
                                    <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                                        <img src={offer.offerImage} alt="Offer" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-white">{offer.merchantName}</div>
                                        <span className="text-gold-400 font-bold font-mono">{offer.price} SAR</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] text-white/50 mb-2">
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{offer.condition}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{offer.warranty}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{offer.deliveryTime}</span>
                                    </div>
                                    {offer.notes && <div className="text-[10px] text-white/40 italic">"{offer.notes}"</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/30 text-sm py-4">No offers received yet.</div>
                )}
            </GlassCard>

        </div>
    );
};
