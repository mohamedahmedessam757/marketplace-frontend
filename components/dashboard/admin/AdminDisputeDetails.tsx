import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Store, 
  DollarSign, 
  Scale, 
  RefreshCcw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Package, 
  Clock, 
  ShieldCheck, 
  X, 
  Lock,
  History,
  Eye,
  Gavel,
  Activity,
  ExternalLink,
  Zap,
  ArrowUpRight,
  Users,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore, ReturnPhase } from '../../../stores/useResolutionStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface AdminDisputeDetailsProps {
    caseId: string;
    onBack: () => void;
    onNavigate?: (path: string, id?: any) => void;
}

export const AdminDisputeDetails: React.FC<AdminDisputeDetailsProps> = ({ caseId, onBack, onNavigate }) => {
    const { t, language } = useLanguage();
    const { getCaseById, adminVerdict, updateReturnPhase, updateAdminVerdict } = useResolutionStore();
    const { getOrder, forceStatus, fetchOrder } = useOrderStore();
    const { addNotification } = useNotificationStore();

    const [isFetching, setIsFetching] = useState(false);
    const [verdictStep, setVerdictStep] = useState<1 | 2 | 3>(1);

    const [adminApproval, setAdminApproval] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [adminApprovalReason, setAdminApprovalReason] = useState('');
    const [adminEvidence, setAdminEvidence] = useState<string[]>([]);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminSignature, setAdminSignature] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const [adminNotes, setAdminNotes] = useState('');
    const [verdictType, setVerdictType] = useState<'REFUND' | 'RELEASE_FUNDS' | 'DENY' | null>(null);
    const [faultParty, setFaultParty] = useState<'CUSTOMER' | 'MERCHANT' | 'BOTH' | 'SHIPPING_COMPANY' | 'PLATFORM'>('MERCHANT');
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [shippingRefund, setShippingRefund] = useState<number>(0);
    const [stripeFee, setStripeFee] = useState<number>(0);
    const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

    const dispute = getCaseById(caseId);
    const order = dispute ? getOrder(String(dispute.orderId)) : undefined;

    const isAr = language === 'ar';
    const NextIcon = isAr ? ChevronLeft : ChevronRight;
    const PrevIcon = isAr ? ChevronRight : ChevronLeft;

    useEffect(() => {
        if (dispute) {
            setRefundAmount(dispute.refundAmount || 0);
            setShippingRefund(dispute.shippingRefund || 0);
            setStripeFee(dispute.stripeFee || 0);
            if (dispute.verdictNotes) setAdminNotes(dispute.verdictNotes);
            
            // Check if order exists, if not, fetch it
            if (!order && !isFetching) {
                setIsFetching(true);
                fetchOrder(String(dispute.orderId)).finally(() => setIsFetching(false));
            }
        }
    }, [dispute, order]);

    if (!dispute) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center">
                <div className="text-center space-y-6">
                    <X className="w-16 h-16 text-red-500 mx-auto opacity-20" />
                    <p className="text-white font-black uppercase tracking-[0.3em]">{t.admin.disputeManager.verdictTerminal.selectCasePrompt}</p>
                    <Button onClick={onBack} variant="outline" className="border-white/10 text-white/60">
                        {t.common.actions.back}
                    </Button>
                </div>
            </div>
        );
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        try {
            const { storageApi } = await import('../../../services/api/storage');
            const file = e.target.files[0];
            const url = await storageApi.upload(file, 'marketplace-uploads', `admin-verdicts/${caseId}`);
            setAdminEvidence(prev => [...prev, url]);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    const confirmVerdict = async () => {
        if (!adminApproval || isExecuting) return;

        const extra = {
            faultParty,
            refundAmount: adminApproval === 'APPROVED' ? refundAmount : 0,
            shippingRefund: 0,
            stripeFee: 0,
            adminApproval,
            adminApprovalReason,
            adminEvidence,
            adminName,
            adminEmail,
            adminSignature,
            verdictIssuedAt: new Date()
        };

        const finalVerdictType = adminApproval === 'APPROVED' ? 'REFUND' : 'DENY';

        try {
            setIsExecuting(true);
            
            if (dispute.verdictIssuedAt) {
                await updateAdminVerdict(dispute.id, dispute.type, finalVerdictType, adminApprovalReason || '', extra);
            } else {
                await adminVerdict(dispute.id, dispute.type, finalVerdictType, adminApprovalReason || '', extra);
            }

            // Real-time local state synchronization (Spec §14)
            const store = useResolutionStore.getState();
            if (store.updateCaseStatus) {
                store.updateCaseStatus(dispute.id, 'RESOLVED');
            }

            // Immediate Navigation for Snappy Feel
            onBack();
            
            addNotification({
                type: 'SYSTEM',
                titleAr: 'تم تنفيذ الحكم',
                titleEn: 'Verdict Executed',
                messageAr: 'تم تنفيذ الحكم الإداري وتحديث حالة الطلب بنجاح.',
                messageEn: 'Verdict executed and order status updated successfully.',
                priority: 'normal'
            });
        } catch (error: any) {
            console.error('[ADJUDICATION_FAILURE]', error);
            addNotification({
                type: 'SECURITY',
                titleAr: 'فشل تنفيذ الحكم',
                titleEn: 'Verdict Execution Failed',
                messageAr: `عذراً، فشل تنفيذ الحكم: ${error.message}`,
                messageEn: `Verdict Execution Failed: ${error.message}`,
                priority: 'high'
            });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4">
            
            {/* 2026 COMMAND HEADER: MULTI-ENTITY TRACEABILITY */}
            <div className="relative group" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/10 to-cyan-500/10 rounded-[40px] blur-2xl opacity-50 transition duration-1000" />
                <GlassCard className="relative p-8 md:p-10 border-white/10 rounded-[40px] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="flex items-start gap-6 w-full lg:w-auto">
                        <button onClick={onBack} className={`mt-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/40 hover:text-white ${isAr ? 'rotate-180' : ''}`}>
                            <ChevronLeft size={24} />
                        </button>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                                <span 
                                    className={`px-4 py-1.5 flex items-center justify-center text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl border-none rounded-xl
                                        ${(dispute.type || '').toLowerCase() === 'dispute' 
                                            ? 'bg-red-500/20 text-red-500 shadow-red-500/20 animate-pulse' 
                                            : 'bg-cyan-500/20 text-cyan-400 shadow-cyan-500/20'}`}
                                >
                                    {(t.admin.disputeManager.types as any)[(dispute.type || '').toLowerCase()] || dispute.type}
                                </span>
                                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">v4.0.2 SECURE | {t.admin.disputeManager.intelligence.verdictProtocol}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                {t.admin.disputeManager.caseId} <span className="text-gold-500 font-mono">#{dispute.id.substring(0, 8)}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                                    <Clock size={14} className="text-white/40" />
                                    <span className="text-xs font-bold text-white/60">{new Date(dispute.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${dispute.status === 'RESOLVED' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]'}`} />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">
                                        {['AWAITING_ADMIN', 'MERCHANT_REJECTED', 'UNDER_REVIEW', 'ESCALATED'].includes(dispute.status) 
                                          ? (isAr ? 'تحت المراجعة الإدارية' : 'UNDER ADMIN REVIEW')
                                          : (t.admin.disputeManager.status as any)[(dispute.status || '').trim().toLowerCase()] || dispute.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TRACEABILITY TERMINAL */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto">
                        {[
                            { 
                                label: t.admin.disputeManager.intelligence.orderEntity, 
                                val: `#${dispute.orderNumber}`, 
                                icon: Package, 
                                color: 'gold',
                                action: () => onNavigate?.('admin-order-details', dispute.orderId)
                            },
                            { label: t.admin.disputeManager.intelligence.shipmentHub, val: dispute.shipmentId ? `#${dispute.shipmentId.substring(0, 8)}` : 'N/A', icon: Truck, color: 'cyan' },
                            { label: t.admin.disputeManager.intelligence.financialId, val: dispute.invoiceId ? `#${dispute.invoiceId.substring(0, 8)}` : 'N/A', icon: FileText, color: 'pink' }
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                onClick={item.action}
                                className={`p-4 bg-black/40 border border-white/5 rounded-3xl group/term hover:border-white/20 transition-all ${item.action ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <item.icon size={12} className={`text-${item.color}-400 opacity-40`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{item.label}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-white group-hover/term:text-gold-400 transition-colors uppercase">{item.val}</span>
                                    {item.action && <ArrowUpRight size={12} className="text-white/10 group-hover/term:text-white/40" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" dir={isAr ? 'rtl' : 'ltr'}>
                
                {/* LEFT: CASE INTELLIGENCE & FINANCIALS (3 COLUMNS) */}
                <div className="xl:col-span-3 space-y-8">
                    <GlassCard className="p-8 border-gold-500/10 space-y-8">
                        <div>
                            <div className="space-y-6">
                               {/* Customer Card */}
                               <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 overflow-hidden">
                                        {dispute.customerAvatar ? (
                                          <img src={dispute.customerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                          <Users size={20} className="text-cyan-400" />
                                        )}
                                      </div>
                                     <div className="text-right rtl:text-right overflow-hidden">
                                        <div className="text-[10px] font-black text-white/30 uppercase">{t.admin.disputeManager.intelligence.userIntegrity}</div>
                                        <div className="text-xs font-black text-white truncate max-w-[100px]">{dispute.customerName}</div>
                                     </div>
                                  </div>
                               </div>

                               {/* Merchant Card */}
                               <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20 overflow-hidden">
                                        {dispute.merchantLogo ? (
                                          <img src={dispute.merchantLogo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                          <Store size={20} className="text-gold-400" />
                                        )}
                                     </div>
                                     <div className="text-right rtl:text-right overflow-hidden">
                                        <div className="text-[10px] font-black text-white/30 uppercase">{isAr ? 'منفذ التاجر' : 'Merchant Node'}</div>
                                        <div className="text-xs font-black text-white truncate max-w-[100px]">
                                           {dispute.merchantName && dispute.merchantName !== 'Store' ? dispute.merchantName : (isAr ? 'متجر معتمد' : 'Verified Store')}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">{t.admin.disputeManager.heldAmount}</h4>
                            <div className="p-6 bg-green-500/10 rounded-[32px] border border-green-500/20 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/10 blur-3xl rounded-full transition-all group-hover:bg-green-500/20" />
                                <div className="relative z-10">
                                    <div className="text-3xl font-black text-white font-mono mb-1 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                        {isFetching && !order ? (
                                            <div className="h-9 w-32 bg-white/10 animate-pulse rounded-lg" />
                                        ) : (
                                            <>
                                                {Number(order?.price || 0).toLocaleString()} <span className="text-xs text-green-400">AED</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-400/60 uppercase">
                                       <ShieldCheck size={12} />
                                       {isAr ? 'مؤمن في الخزنة' : 'Secured in Vault'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                           <Button 
                               onClick={() => onNavigate?.('admin-order-details', dispute.orderId)}
                               className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                           >
                              <FileText size={14} />
                              {t.admin.disputeManager.intelligence.originalContract}
                           </Button>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT: COMPREHENSIVE INVESTIGATION HUB (9 COLUMNS) */}
                <div className="xl:col-span-9 space-y-8">
                    
                    {/* VISUAL INVESTIGATION LAB: SIDE-BY-SIDE 2026 HUB */}
                    <GlassCard className="p-0 border-white/10 overflow-hidden rounded-[40px] shadow-2xl shadow-black/50">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                              <Eye size={18} className="text-gold-500" />
                              {t.admin.disputeManager.intelligence.visualInvestigationLab}
                           </h3>
                           <div className="flex items-center gap-4">
                              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                                 <Activity size={12} className="text-cyan-400" />
                                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.admin.disputeManager.intelligence.comparison}</span>
                              </div>
                              <Badge variant="outline" className="border-white/10 text-white/30 font-black">
                                 {(dispute.customerEvidence?.length || 0) + (dispute.merchantResponse?.evidence?.length || 0)} {t.admin.disputeManager.intelligence.assets}
                              </Badge>
                           </div>
                        </div>
                        
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            
                            {/* CUSTOMER DEFENSE PANEL */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                   <Badge variant="gold" className="px-4 py-1.5 shadow-gold-500/20">{t.admin.disputeManager.intelligence.customerDefense}</Badge>
                                   <div className="flex gap-2">
                                      {dispute.usageCondition && (
                                         <Badge variant="cyan" className="text-[10px] py-1">
                                            {(t.admin.disputeManager.usageConditions as any)[dispute.usageCondition] || dispute.usageCondition}
                                         </Badge>
                                      )}
                                   </div>
                                </div>

                                <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5 space-y-4">
                                   <div>
                                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">{t.admin.disputeManager.intelligence.customerReason}</span>
                                      <p className="text-sm font-bold text-white/90 leading-relaxed">
                                         {(t.admin.disputeManager.reasons as any)[dispute.reason] || dispute.reason}
                                      </p>
                                   </div>
                                   <div className="pt-4 border-t border-white/5">
                                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">{isAr ? 'وصف المشكلة' : 'Problem Description'}</span>
                                      <p className="text-sm text-white/60 leading-relaxed italic">"{dispute.description}"</p>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">{t.admin.disputeManager.intelligence.evidenceCustomer}</span>
                                   <div className="grid grid-cols-2 gap-3">
                                      {dispute.customerEvidence && dispute.customerEvidence.length > 0 ? dispute.customerEvidence.map((img, i) => (
                                         <motion.div 
                                            key={i} 
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedEvidence(img)}
                                            className="aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-zoom-in group relative"
                                         >
                                            <img src={img} alt="Customer Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                               <Eye className="text-white" size={20} />
                                            </div>
                                         </motion.div>
                                      )) : (
                                         <div className="col-span-2 py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/5 flex flex-col items-center gap-2 opacity-20">
                                            <Eye size={24} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">No customer files</span>
                                         </div>
                                      )}
                                   </div>
                                </div>
                            </div>

                            {/* MERCHANT RESPONSE PANEL */}
                            <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-10">
                                <div className="flex items-center justify-between mb-2">
                                   <Badge variant="outline" className="px-4 py-1.5 shadow-2xl uppercase">
                                      {t.admin.disputeManager.intelligence.merchantResponse}
                                   </Badge>
                                   {dispute.merchantResponse && (
                                      <Badge variant={dispute.merchantResponse.acceptedReturn ? 'green' : 'red'} className="border-none text-[10px]">
                                         {dispute.merchantResponse.acceptedReturn ? (isAr ? 'وافق على الإرجاع' : 'RETURN APPROVED') : (isAr ? 'رفض الإرجاع' : 'RETURN REJECTED')}
                                      </Badge>
                                   )}
                                </div>

                                {dispute.merchantResponse ? (
                                   <div className="space-y-8">
                                      <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5 space-y-4">
                                         <div>
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">{t.admin.disputeManager.intelligence.merchantDecision}</span>
                                            <p className="text-sm font-bold text-white/90 leading-relaxed italic">"{dispute.merchantResponse.text}"</p>
                                         </div>
                                         <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 px-2 py-0.5 bg-cyan-500/5 rounded-md text-[8px] font-black text-cyan-400/60 border border-cyan-500/10 uppercase tracking-widest">
                                               <ShieldCheck size={10} />
                                               {t.admin.disputeManager.intelligence.signedHashVerified}
                                            </div>
                                            <span className="text-[9px] text-white/20 font-bold">
                                               {new Date(dispute.merchantResponse.submittedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                            </span>
                                         </div>
                                      </div>

                                      <div className="space-y-4">
                                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">{t.admin.disputeManager.intelligence.evidenceMerchant}</span>
                                         <div className="grid grid-cols-2 gap-3">
                                            {dispute.merchantResponse.evidence && dispute.merchantResponse.evidence.length > 0 ? dispute.merchantResponse.evidence.map((img, i) => (
                                               <motion.div 
                                                  key={i} 
                                                  whileHover={{ scale: 1.02 }}
                                                  onClick={() => setSelectedEvidence(img)}
                                                  className="aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-zoom-in group relative"
                                               >
                                                  <img src={img} alt="Merchant Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                     <Eye className="text-white" size={20} />
                                                  </div>
                                               </motion.div>
                                            )) : (
                                               <div className="col-span-2 py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/5 flex flex-col items-center gap-2 opacity-20">
                                                  <Store size={24} />
                                                  <span className="text-[8px] font-black uppercase tracking-widest">No merchant files</span>
                                               </div>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="h-64 bg-white/[0.01] rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-8 opacity-40">
                                      <Clock size={40} className="text-gold-500 mb-4 animate-pulse" />
                                      <p className="text-xs font-black uppercase tracking-[0.2em]">{t.admin.disputeManager.intelligence.merchantSla}</p>
                                      <p className="text-[10px] text-white/40 mt-2">{isAr ? 'في انتظار رد التاجر الرسمي' : 'Awaiting official merchant response'}</p>
                                   </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* 2026 VERDICT WIZARD TERMINAL */}
                    <GlassCard className="p-10 bg-red-500/[0.03] border-red-500/20 rounded-[40px] shadow-2xl relative overflow-hidden">
                        {/* WIZARD STEPS INDICATOR */}
                        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8 relative z-10">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center gap-4 relative">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-2xl ${verdictStep >= step ? 'bg-gradient-to-br from-gold-500 to-amber-600 text-black scale-105' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                        <span className="text-xs font-black">{step}</span>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className={`text-[7px] font-black uppercase tracking-[0.2em] mb-0.5 ${verdictStep >= step ? 'text-gold-500' : 'text-white/20'}`}>
                                            Stage 0{step}
                                        </p>
                                        <p className={`text-xs font-bold ${verdictStep >= step ? 'text-white' : 'text-white/40'}`}>
                                            {(t.admin.disputeManager.verdictTerminal as any)[`stepTitle_${step}`]}
                                        </p>
                                    </div>
                                    {step < 3 && <div className={`hidden lg:block w-16 h-px mx-4 ${verdictStep > step ? 'bg-gold-500/50' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                        </div>

                        {/* STEP CONTENT */}
                        <div className="min-h-[400px]">
                            {verdictStep === 1 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* LEFT: Decision & Reasoning */}
                                        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">1. {t.admin.disputeManager.verdictTerminal.adminApproval_APPROVED} / {t.admin.disputeManager.verdictTerminal.adminApproval_REJECTED}</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <button 
                                                        onClick={() => setAdminApproval('APPROVED')}
                                                        className={`p-6 rounded-3xl border flex items-center gap-6 transition-all ${adminApproval === 'APPROVED' ? 'bg-green-500/10 border-green-500/50 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10 opacity-60'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${adminApproval === 'APPROVED' ? 'bg-green-500 text-black' : 'bg-white/10 text-white/40'}`}>
                                                            <CheckCircle2 size={24} />
                                                        </div>
                                                        <span className="text-lg font-black text-white">{t.admin.disputeManager.verdictTerminal.adminApproval_APPROVED}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setAdminApproval('REJECTED')}
                                                        className={`p-6 rounded-3xl border flex items-center gap-6 transition-all ${adminApproval === 'REJECTED' ? 'bg-red-500/10 border-red-500/50 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10 opacity-60'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${adminApproval === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                                            <X size={24} />
                                                        </div>
                                                        <span className="text-lg font-black text-white">{t.admin.disputeManager.verdictTerminal.adminApproval_REJECTED}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{t.admin.disputeManager.verdictTerminal.adminReasonLabel}</label>
                                                <textarea 
                                                    value={adminApprovalReason}
                                                    onChange={(e) => setAdminApprovalReason(e.target.value)}
                                                    placeholder={isAr ? 'اكتب بالتفصيل أسباب قرارك الإداري...' : 'State the administrative rationale for this decision...'}
                                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-white text-sm focus:border-gold-500/50 outline-none transition-all min-h-[120px]"
                                                />
                                            </div>
                                        </div>

                                        {/* RIGHT: Asset Upload (Integrated Phase 1) */}
                                        <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{t.admin.disputeManager.intelligence.assets}</label>
                                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {adminEvidence.map((url, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-xl">
                                                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                                            <button 
                                                                onClick={() => setAdminEvidence(prev => prev.filter((_, i) => i !== idx))}
                                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className={`aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-gold-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white/5 group ${isUploading ? 'animate-pulse pointer-events-none' : ''}`}>
                                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                                        <Activity size={24} className={`${isUploading ? 'text-gold-500' : 'text-white/20 group-hover:text-gold-500'} transition-colors`} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{isUploading ? 'UPLOADING...' : 'ADD ASSET'}</span>
                                                    </label>
                                                </div>
                                                <p className="text-[9px] text-white/20 font-bold uppercase text-center leading-tight">
                                                    {isAr ? 'ارفع المستندات أو الصور الداعمة لقرارك' : 'Upload supporting documents or images for your verdict'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-white/5">
                                        <Button 
                                            onClick={() => setVerdictStep(2)}
                                            disabled={!adminApproval || !adminApprovalReason}
                                            className={`px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-gold-500/10 flex items-center gap-3 transition-all hover:translate-x-${isAr ? '[-4px]' : '[4px]'}`}
                                        >
                                            {t.common.actions.continue}
                                            <NextIcon size={16} />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {verdictStep === 2 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{t.admin.disputeManager.verdictTerminal.assignFaultParty}</label>
                                            <div className="space-y-3">
                                                {[
                                                    { id: 'MERCHANT', label: isAr ? 'التاجر (إهمال)' : 'Merchant (Negligence)', icon: Store },
                                                    { id: 'CUSTOMER', label: isAr ? 'العميل (إدعاء)' : 'Customer (Claim)', icon: User },
                                                    { id: 'SHIPPING_COMPANY', label: t.admin.disputeManager.verdictTerminal.shippingNegligence, icon: Truck }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setFaultParty(opt.id as any)}
                                                        className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all ${faultParty === opt.id ? 'bg-gold-500/10 border-gold-500/40 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${faultParty === opt.id ? 'bg-gold-500 text-black' : 'bg-white/5'}`}>
                                                                <opt.icon size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold">{opt.label}</span>
                                                        </div>
                                                        {faultParty === opt.id && <CheckCircle2 size={16} className="text-gold-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t.admin.disputeManager.verdictTerminal.financialBreakdown}</label>
                                                    <Badge className="bg-green-500/10 text-green-500 border-none font-black text-[10px] px-3 py-1">AED</Badge>
                                                </div>
                                                <div className="relative group p-10 bg-black/60 rounded-[40px] border border-white/10 flex flex-col items-center shadow-inner">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">{t.admin.disputeManager.verdictTerminal.refundAmount}</span>
                                                    <div className="flex items-center gap-3">
                                                       <input 
                                                           type="number"
                                                           value={refundAmount}
                                                           onChange={(e) => setRefundAmount(Number(e.target.value))}
                                                           className="w-full bg-transparent text-6xl font-black text-white focus:text-gold-500 outline-none transition-all text-center"
                                                           placeholder="0.00"
                                                       />
                                                       <span className="text-2xl font-black text-white/20 uppercase">AED</span>
                                                    </div>
                                                </div>
                                            </div>
                                    </div>

                                    <div className="flex justify-between pt-8 border-t border-white/5">
                                        <Button 
                                            onClick={() => setVerdictStep(1)}
                                            variant="outline"
                                            className={`px-8 py-3.5 border-white/10 text-white/40 hover:text-white flex items-center gap-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all`}
                                        >
                                            <PrevIcon size={14} />
                                            {t.common.actions.back}
                                        </Button>
                                        <Button 
                                            onClick={() => setVerdictStep(3)}
                                            className={`px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl flex items-center gap-3 transition-all hover:translate-x-${isAr ? '[-4px]' : '[4px]'}`}
                                        >
                                            {t.common.actions.continue}
                                            <NextIcon size={16} />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {verdictStep === 3 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="p-8 bg-gold-500/5 rounded-[40px] border border-gold-500/20 space-y-6">
                                                <div className="flex items-center gap-4 text-gold-500">
                                                    <ShieldCheck size={20} />
                                                    <span className="text-sm font-black uppercase tracking-widest">{t.admin.disputeManager.verdictTerminal.adminSignatureLabel}</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <input 
                                                        type="text" 
                                                        value={adminSignature}
                                                        onChange={(e) => setAdminSignature(e.target.value)}
                                                        placeholder={isAr ? 'أدخل اسمك الكامل للموافقة والتوقيع...' : 'Type full name to sign & authorize...'}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-mono text-lg focus:border-gold-500/50 outline-none transition-all block"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input 
                                                            type="text" 
                                                            value={adminName} 
                                                            onChange={(e) => setAdminName(e.target.value)}
                                                            placeholder={t.admin.disputeManager.verdictTerminal.adminNameLabel}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-gold-500/50 outline-none"
                                                        />
                                                        <input 
                                                            type="email" 
                                                            value={adminEmail} 
                                                            onChange={(e) => setAdminEmail(e.target.value)}
                                                            placeholder={t.admin.disputeManager.verdictTerminal.adminEmailLabel}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-gold-500/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-10 bg-black/60 rounded-[40px] border border-white/10 flex flex-col justify-between h-full relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-[40px] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                                            <div className="relative space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <Gavel size={24} className="text-gold-500" />
                                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{t.admin.disputeManager.verdictTerminal.executeVerdict}</h3>
                                                </div>
                                                <p className="text-xs text-white leading-relaxed">
                                                    {isAr 
                                                        ? 'من خلال النقر على تنفيذ، سيتم إرسال الإشعارات الفورية للعميل والمتجر بالقرار الإداري الرسمي.'
                                                        : 'By clicking execute, automated real-time notifications of the official administrative decision will be dispatched to both parties.'}
                                                </p>
                                            </div>
                                            <Button 
                                                onClick={confirmVerdict}
                                                isLoading={isExecuting}
                                                disabled={!adminSignature || !adminName || !adminEmail}
                                                className="relative mt-8 py-5 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-2xl shadow-gold-500/20 w-full transition-all hover:scale-[1.02]"
                                            >
                                                {t.admin.disputeManager.verdictTerminal.executeVerdict}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                                        <Button 
                                            onClick={() => setVerdictStep(2)}
                                            variant="outline"
                                            className={`px-8 py-3.5 border-white/10 text-white/40 hover:text-white flex items-center gap-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all`}
                                        >
                                            <PrevIcon size={14} />
                                            {t.common.actions.back}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* LIGHTBOX FOR EVIDENCE */}
            <AnimatePresence>
                {selectedEvidence && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvidence(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl max-h-full aspect-video z-10"
                        >
                            <img src={selectedEvidence} alt="Evidence Full" className="w-full h-full object-contain rounded-3xl" />
                            <button 
                                onClick={() => setSelectedEvidence(null)}
                                className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black rounded-full border border-white/20 text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
