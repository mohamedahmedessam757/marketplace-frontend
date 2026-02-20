
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore, ReturnPhase } from '../../../stores/useResolutionStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ChevronRight, ChevronLeft, User, Store, DollarSign, Scale, RefreshCcw, FileText, CheckCircle2, AlertTriangle, Truck, Package, Clock, ShieldCheck, XCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminDisputeDetailsProps {
    caseId: string;
    onBack: () => void;
}

export const AdminDisputeDetails: React.FC<AdminDisputeDetailsProps> = ({ caseId, onBack }) => {
    const { t, language } = useLanguage();
    const { getCaseById, adminVerdict, updateReturnPhase } = useResolutionStore();
    const { getOrder, forceStatus } = useOrderStore();
    const { addNotification } = useNotificationStore();

    const [adminNotes, setAdminNotes] = useState('');
    const [verdictType, setVerdictType] = useState<'refund' | 'deny' | 'partial' | null>(null);

    const dispute = getCaseById(caseId);
    const order = dispute ? getOrder(dispute.orderId) : undefined;

    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ChevronRight : ChevronLeft;

    if (!dispute || !order) return <div className="text-white">Case not found</div>;

    const handleVerdict = (type: 'refund' | 'deny' | 'partial') => {
        setVerdictType(type);
    };

    const confirmVerdict = () => {
        if (!verdictType) return;

        adminVerdict(dispute.id, verdictType, 0, adminNotes);

        if (verdictType === 'refund') {
            forceStatus(dispute.orderId, 'RETURNED', 'Admin Refund Verdict');
        } else if (verdictType === 'deny') {
            forceStatus(dispute.orderId, 'COMPLETED', 'Admin Deny Verdict');
        }

        // Notify Customer
        if (order.customer?.id) {
            addNotification({
                recipientId: order.customer.id,
                recipientRole: 'CUSTOMER',
                type: 'dispute',
                titleKey: 'adminAlert',
                message: `Admin Verdict: ${verdictType === 'refund' ? 'Refund Approved' : 'Dispute Denied'} for Case #${dispute.id}`,
                orderId: dispute.orderId,
                linkTo: 'dispute-details',
                priority: 'urgent',
                channels: ['app', 'email']
            });
        }

        // Notify Merchant
        if (order.merchantId) {
            addNotification({
                recipientId: order.merchantId,
                recipientRole: 'MERCHANT',
                type: 'dispute',
                titleKey: 'adminAlert',
                message: `Admin Verdict: ${verdictType === 'refund' ? 'Refund Approved' : 'Dispute Denied'} for Case #${dispute.id}`,
                orderId: dispute.orderId,
                linkTo: 'dispute-details',
                priority: 'urgent',
                channels: ['app', 'email']
            });
        }

        onBack();
    };

    const orderPrice = parseFloat(order.price?.replace(/[^0-9.]/g, '') || '0');

    const returnSteps: { id: ReturnPhase, label: string, icon: any }[] = [
        { id: 'REQUESTED', label: t.admin.disputeManager.steps.requested, icon: FileText },
        { id: 'APPROVED_BY_STORE', label: t.admin.disputeManager.steps.approved, icon: CheckCircle2 },
        { id: 'WAYBILL_ISSUED', label: t.admin.disputeManager.steps.waybill, icon: Truck },
        { id: 'STORE_RECEIVED', label: t.admin.disputeManager.steps.received, icon: Package },
        { id: 'REFUND_PROCESSED', label: t.admin.disputeManager.steps.refunded, icon: DollarSign },
    ];

    const currentStepIndex = dispute.returnPhase ? returnSteps.findIndex(s => s.id === dispute.returnPhase) : -1;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">

            {/* Header & Status Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                        <ArrowIcon size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            {t.admin.disputeManager.title} <span className="text-gold-400 font-mono">#{dispute.id}</span>
                        </h1>
                        <div className="text-xs text-white/40">{new Date(dispute.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#151310] px-4 py-2 rounded-xl border border-white/10">
                    <div className={`w-3 h-3 rounded-full ${dispute.status === 'RESOLVED' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className="font-bold text-white uppercase">{dispute.status}</span>
                </div>
            </div>

            {/* 7-Step Return Lifecycle */}
            {dispute.returnPhase && (
                <GlassCard className="p-6 bg-[#1A1814] overflow-x-auto border-gold-500/10">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">{t.admin.disputeManager.returnLifecycle}</h3>
                    <div className="flex items-center justify-between min-w-[600px] relative">
                        <div className="absolute top-5 left-0 w-full h-1 bg-white/10 -z-0 rounded-full" />
                        <motion.div
                            className="absolute top-5 left-0 h-1 bg-gold-500 -z-0 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStepIndex / (returnSteps.length - 1)) * 100}%` }}
                        />

                        {returnSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 cursor-default group">
                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-[#1A1814] border-gold-500 text-gold-500' : 'bg-[#1A1814] border-white/20 text-white/20'
                                        } ${isCurrent ? 'scale-110 shadow-[0_0_15px_rgba(168,139,62,0.5)]' : ''}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className={`text-[10px] font-bold ${isCompleted ? 'text-white' : 'text-white/30'}`}>{step.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </GlassCard>
            )}

            <div className="grid lg:grid-cols-3 gap-6">

                {/* LEFT COL: Financial Context */}
                <div className="space-y-6">
                    <GlassCard className="p-6 bg-[#151310] border-gold-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 bg-gold-500/10 rounded-bl-2xl">
                            <Lock size={16} className="text-gold-400" />
                        </div>

                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            {t.admin.disputeManager.heldAmount}
                        </h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-mono font-bold text-white">{orderPrice.toLocaleString()} SAR</div>
                                <div className="text-[10px] text-white/40">FROZEN IN ESCROW</div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Order</span>
                                <span className="text-white font-bold">#{order.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Reason</span>
                                <span className="text-red-400 font-bold">{dispute.reason.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Opened</span>
                                <span className="text-white">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                        <div className="text-xs text-blue-200">
                            <strong>Policy:</strong> Funds are locked until a final verdict is reached. Refund deducts from merchant wallet.
                        </div>
                    </div>
                </div>

                {/* MIDDLE COL: Evidence Comparison (Split View) */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-0 h-full flex flex-col bg-[#1A1814] overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Scale size={16} className="text-gold-500" />
                                {t.admin.disputeManager.evidence}
                            </h3>
                        </div>

                        <div className="flex-1 flex flex-col divide-y divide-white/10">

                            {/* Customer Section */}
                            <div className="p-6 relative bg-red-500/5">
                                <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">Customer</div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><User size={16} /></div>
                                    <div className="text-sm font-bold text-white">{dispute.customerName}</div>
                                </div>
                                <p className="text-sm text-white/70 italic mb-3 bg-black/20 p-3 rounded-lg border border-white/5">"{dispute.description}"</p>
                                <div className="flex gap-2 mt-2">
                                    {dispute.customerEvidence?.map((img, i) => (
                                        <div key={i} className="w-16 h-16 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center text-xs text-white/30 cursor-pointer hover:border-white/30">Img {i + 1}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Merchant Section */}
                            <div className="p-6 relative bg-blue-500/5 flex-1">
                                <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Merchant</div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Store size={16} /></div>
                                    <div className="text-sm font-bold text-white">{dispute.merchantName}</div>
                                </div>

                                {dispute.merchantResponse ? (
                                    <>
                                        <p className="text-sm text-white/70 italic mb-3 bg-black/20 p-3 rounded-lg border border-white/5">"{dispute.merchantResponse.text}"</p>
                                        {dispute.merchantResponse.acceptedReturn && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold border border-green-500/20">
                                                <CheckCircle2 size={12} /> Merchant Accepted Return
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2">
                                        <Clock size={20} className="animate-spin-slow" />
                                        Waiting for response...
                                        <div className="text-xs text-red-400 font-mono">
                                            Time Left: 24h 12m
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT COL: Verdict Action */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6 bg-[#1A1814] h-full flex flex-col border-gold-500/20">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-gold-500" />
                            {t.admin.disputeManager.verdict}
                        </h3>

                        {dispute.status === 'RESOLVED' || dispute.status === 'REFUNDED' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Case Closed</h3>
                                <p className="text-white/50 text-sm">Verdict: <span className="text-white font-bold">{dispute.adminDecision?.verdict.toUpperCase()}</span></p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-4">
                                <button
                                    onClick={() => handleVerdict('refund')}
                                    className={`p-4 rounded-xl border text-left transition-all group ${verdictType === 'refund' ? 'bg-red-500/20 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                        <span className="font-bold">{t.admin.disputeManager.refundCustomer}</span>
                                    </div>
                                    <div className="text-xs opacity-60 ml-8">Full amount returned to customer wallet. Order cancelled.</div>
                                </button>

                                <button
                                    onClick={() => handleVerdict('deny')}
                                    className={`p-4 rounded-xl border text-left transition-all ${verdictType === 'deny' ? 'bg-green-500/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <Store size={18} />
                                        <span className="font-bold">{t.admin.disputeManager.releaseFunds}</span>
                                    </div>
                                    <div className="text-xs opacity-60 ml-8">Dispute rejected. Funds released to merchant. Order completed.</div>
                                </button>

                                <div className="mt-auto pt-6 border-t border-white/10">
                                    <label className="block text-xs text-white/40 mb-2">{t.admin.disputeManager.adminNotes}</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500 h-24 resize-none mb-4 placeholder-white/20"
                                        placeholder="Enter legal reasoning for verdict..."
                                    />

                                    <button
                                        onClick={confirmVerdict}
                                        disabled={!verdictType}
                                        className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Scale size={18} />
                                        {t.admin.disputeManager.confirmVerdict}
                                    </button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
