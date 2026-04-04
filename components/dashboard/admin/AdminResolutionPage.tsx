import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  RotateCcw, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Clock, 
  Filter, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  Zap,
  Gavel,
  History,
  Eye,
  FileText,
  X
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { DisputeChat } from '../resolution/DisputeChat';

interface AdminResolutionPageProps {
  onNavigate?: (path: string, id?: any) => void;
}

export const AdminResolutionPage: React.FC<AdminResolutionPageProps> = ({ onNavigate }) => {
  const { 
    cases, 
    isLoading, 
    fetchAdminCases, 
    subscribeToCases, 
    unsubscribeFromCases,
    adminVerdict,
    fetchCustomerRisk
  } = useResolutionStore();
  
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'escalated' | 'resolved'>('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [verdictModal, setVerdictModal] = useState<{ open: boolean, type: 'return' | 'dispute', caseId: string } | null>(null);
  const [verdictNotes, setVerdictNotes] = useState('');
  
  // Phase 4 State
  const { merchantRisk, fetchMerchantRisk, updateAdminVerdict } = useResolutionStore();
  const [faultParty, setFaultParty] = useState<'CUSTOMER' | 'MERCHANT' | 'BOTH' | 'SHIPPING_COMPANY' | 'PLATFORM'>('MERCHANT');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [shippingRefund, setShippingRefund] = useState<number>(0);
  const [stripeFee, setStripeFee] = useState<number>(0); // GAP 6

  useEffect(() => {
    (window as any).currentViewRole = 'admin';
    fetchAdminCases();
    subscribeToCases('admin');

    return () => {
      unsubscribeFromCases();
    };
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(c.orderId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add logic for escrow/escalated
    const isEscalated = new Date(c.deadline) < new Date() && (c.status === 'AWAITING_MERCHANT' || c.status === 'OPEN');

    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'escrow' ? (c.status === 'AWAITING_ADMIN' || c.status === 'UNDER_REVIEW') :
      activeTab === 'escalated' ? isEscalated :
      activeTab === 'resolved' ? (c.status === 'RESOLVED' || c.status === 'REFUNDED') : true;

    return matchesSearch && matchesTab;
  });

  const stats = [
    { 
      label: t.admin.disputeManager.status.open, 
      value: cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'REFUNDED').length,
      icon: ShieldCheck,
      color: 'cyan'
    },
    { 
      label: t.admin.disputeManager.status.awaiting_admin, 
      value: cases.filter(c => c.status === 'AWAITING_ADMIN' || c.status === 'UNDER_REVIEW').length,
      icon: Gavel,
      color: 'gold'
    },
    { 
      label: t.admin.disputeManager.status.escalated, 
      value: cases.filter(c => new Date(c.deadline) < new Date() && (c.status === 'AWAITING_MERCHANT' || c.status === 'OPEN')).length,
      icon: Zap,
      color: 'red'
    }
  ];

  useEffect(() => {
    if (selectedCase?.merchantStoreId) {
      fetchMerchantRisk(selectedCase.merchantStoreId);
    }
    if (selectedCase?.customerId) {
        fetchCustomerRisk(selectedCase.customerId);
    }
  }, [selectedCase]);

  const handleVerdict = async (verdict: 'REFUND' | 'RELEASE_FUNDS' | 'DENY') => {
    if (!verdictModal) return;
    

    const extra = verdictModal.type === 'dispute' ? {
      faultParty,
      refundAmount: verdict === 'REFUND' ? refundAmount : 0,
      shippingRefund: verdict === 'REFUND' ? shippingRefund : 0,
      stripeFee: verdict === 'REFUND' ? stripeFee : 0
    } : undefined;

    if (selectedCase?.verdictIssuedAt) {
      // It's an update (within 24h window)
      await updateAdminVerdict(verdictModal.caseId, verdictModal.type, verdict, verdictNotes, extra);
    } else {
      await adminVerdict(verdictModal.caseId, verdictModal.type, verdict, verdictNotes, extra);
    }

    setVerdictModal(null);
    setVerdictNotes('');
    setSelectedCase(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
             <Badge variant="gold" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-gold-500/10 text-gold-400 border-gold-500/20">
               Governance Tier 1
             </Badge>
             <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{t.admin.auditLogs} active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 flex items-center gap-4">
            {t.admin.disputeManager.title}
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-2xl">
            {t.admin.chatOversight.subtitle}
          </p>
        </motion.div>

        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="relative">
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-white/30`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.admin.actions.refresh}
              className={`bg-[#0A0A0A] border border-white/5 rounded-xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 text-sm text-white focus:border-gold-500/50 outline-none w-full md:w-80 transition-all duration-300`}
            />
          </div>
          <button className="p-3 bg-white/5 text-white/60 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-8 relative group overflow-hidden border-white/10">
              <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${stat.color === 'gold' ? 'yellow' : stat.color === 'cyan' ? 'cyan' : 'red'}-500/10 blur-[50px] rounded-full group-hover:bg-opacity-20 transition-all duration-700`} />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  ${stat.color === 'gold' ? 'bg-gold-500/10 text-gold-400 border-gold-500/20' :
                    stat.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">{stat.value}</div>
                </div>
              </div>
              <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                {stat.label}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Cases List */}
        <div className="xl:col-span-8 space-y-6">
          <GlassCard className="p-0 border-white/5 overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1 p-3 bg-white/[0.03] border-b border-white/5 overflow-x-auto no-scrollbar">
              {(['all', 'escrow', 'escalated', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-500 whitespace-nowrap
                    ${activeTab === tab
                      ? 'bg-gold-500 text-black shadow-[0_0_30px_rgba(212,175,55,0.2)]'
                      : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                >
                  {t.admin.disputeManager.tabs[tab === 'escalated' ? 'urgent' : tab === 'all' ? 'all' : tab === 'escrow' ? 'escrow' : 'closed']}
                </button>
              ))}
            </div>

            <div className="divide-y divide-white/[0.03] min-h-[500px] relative">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div key="loader" className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-30">
                    <Loader2 className="animate-spin text-gold-500" size={50} />
                  </motion.div>
                ) : filteredCases.length === 0 ? (
                  <div className="py-40 text-center opacity-20 flex flex-col items-center gap-4">
                    <History size={60} strokeWidth={1} />
                    <span className="font-black uppercase tracking-widest text-sm">{t.admin.disputeManager.verdictTerminal.noActiveDisputes}</span>
                  </div>
                ) : (
                  filteredCases.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedCase(item)}
                      className={`p-8 hover:bg-white/[0.04] active:bg-white/[0.06] transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${selectedCase?.id === item.id ? 'bg-white/[0.05] border-l-4 border-l-gold-500' : ''}`}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                            ${item.type === 'dispute' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}
                            group-hover:scale-105 group-hover:rotate-3 shadow-xl`}>
                           {item.type === 'dispute' ? <Scale size={28} /> : <RotateCcw size={28} />}
                         </div>
                         <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-gold-500/80 tracking-widest uppercase">#{item.id}</span>
                               <span className="text-[10px] font-medium text-white/20 tracking-tighter">
                                 {new Date(item.createdAt).toLocaleString()}
                               </span>
                            </div>
                            <h3 className="text-xl font-black text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">
                              {item.partName}
                            </h3>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                                 <ShieldCheck size={12} className="text-cyan-500" />
                                 {item.merchantName}
                               </div>
                               <div className="w-1 h-1 rounded-full bg-white/10" />
                               <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                                 <MessageSquare size={12} className="text-pink-500" />
                                 {item.customerName}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                        <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border-2 shadow-lg
                          ${item.status === 'REFUNDED' || item.status === 'RESOLVED'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/5'
                            : 'bg-gold-500/10 text-gold-400 border-gold-500/20 shadow-gold-500/5'}`}>
                           {t.admin.disputeManager.status[item.status.toLowerCase()] || item.status}
                        </div>
                        {new Date(item.deadline) < new Date() && (item.status === 'AWAITING_MERCHANT' || item.status === 'OPEN') && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-red-500 animate-pulse uppercase">
                            <Zap size={12} fill="currentColor" />
                            {t.admin.disputeManager.status.escalated}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Oversight Intelligence Panel */}
        <div className="xl:col-span-4">
          <AnimatePresence mode="wait">
            {!selectedCase ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[40px] text-center opacity-20">
                <div className="space-y-4">
                  <Eye size={80} strokeWidth={1} className="mx-auto" />
                  <p className="text-sm font-black uppercase tracking-widest">{t.admin.disputeManager.verdictTerminal.selectCasePrompt}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedCase.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden ring-2 ring-gold-500/10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-2">{t.admin.disputeManager.intelligence.title}</h4>
                      <h2 className="text-2xl font-black text-white">{t.admin.disputeManager.caseId}: {selectedCase.id}</h2>
                    </div>
                    <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-white/10 rounded-full text-white/40"><X size={20} /></button>
                  </div>

                  {/* GAP 5: Logistics Traceability */}
                  {(selectedCase.invoiceId || selectedCase.shipmentId) && (
                    <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{t.admin.disputeManager.intelligence.logisticsLinkage}</span>
                        </div>
                        {selectedCase.invoiceId && (
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter">{t.admin.disputeManager.intelligence.invoiceRef}</span>
                                <span className="text-[10px] text-white/70 font-mono select-all">#{selectedCase.invoiceId.substring(0, 8)}...</span>
                            </div>
                        )}
                        {selectedCase.shipmentId && (
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter">{t.admin.disputeManager.intelligence.shipmentRef}</span>
                                <span className="text-[10px] text-white/70 font-mono select-all">#{selectedCase.shipmentId.substring(0, 8)}...</span>
                            </div>
                        )}
                    </div>
                  )}

                  {/* Customer Risk Badge - Spec GAP 8 */}
                  {selectedCase.customerRisk && (
                    <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between
                        ${selectedCase.customerRisk.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' :
                          selectedCase.customerRisk.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20' :
                          'bg-green-500/10 border-green-500/20'}
                    `}>
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className={selectedCase.customerRisk.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-white/40'} />
                            <div>
                                <div className="text-[10px] font-black text-white/40 uppercase">{t.admin.disputeManager.intelligence.userIntegrity}</div>
                                <div className="text-xs font-black text-white">{selectedCase.customerRisk.riskLevel} {t.admin.disputeManager.intelligence.integrityAlert}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-white">{selectedCase.customerRisk.riskScore}%</div>
                            <div className="text-[9px] text-white/20 font-bold uppercase">{t.admin.disputeManager.intelligence.returnDisputeRate}</div>
                        </div>
                    </div>
                  )}

                  <div className="space-y-8">
                     {/* Evidence Preview */}
                     <div>
                        <div className="flex items-center gap-2 mb-4">
                           <FileText size={16} className="text-gold-400" />
                           <span className="text-xs font-black uppercase tracking-widest text-white/60">{t.admin.disputeManager.intelligence.evidenceAudit}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           {selectedCase.customerEvidence.length > 0 ? selectedCase.customerEvidence.map((img: string, i: number) => (
                             <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden group/img relative">
                               <img src={img} alt="Evidence" className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-all duration-500" />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                  <Eye className="text-white" size={24} />
                               </div>
                             </div>
                           )) : (
                             <div className="col-span-2 p-4 bg-white/5 rounded-xl text-center text-[10px] font-bold text-white/20 uppercase">{t.admin.disputeManager.intelligence.noCustomerFiles}</div>
                           )}
                        </div>
                     </div>

                     {/* Verdict Tools */}
                     <div className="pt-8 border-t border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">{t.admin.disputeManager.verdict}</h4>
                        <div className="grid grid-cols-1 gap-3">
                           <Button
                             onClick={() => setVerdictModal({ open: true, type: selectedCase.type, caseId: selectedCase.id })}
                             className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gold-500 hover:border-gold-500 hover:text-black transition-all duration-500 flex items-center justify-center gap-3">
                             <Gavel size={18} />
                             {t.admin.disputeManager.intelligence.executeVerdict}
                           </Button>
                           <Button
                             onClick={() => onNavigate?.('order-details', selectedCase.orderId)}
                             className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all">
                             {t.admin.disputeManager.intelligence.viewFullOrderAudit}
                           </Button>
                        </div>
                     </div>
                  </div>
                </GlassCard>

                {/* System Timeline Integration */}
                <GlassCard className="p-6 bg-cyan-500/[0.02] border-cyan-500/10">
                   <div className="flex items-center gap-3 mb-4">
                      <History size={18} className="text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{t.admin.disputeManager.intelligence.escrowClock}</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-white/40 uppercase">{t.admin.disputeManager.intelligence.merchantSla}</span>
                         <span className={new Date(selectedCase.deadline) < new Date() ? 'text-red-500' : 'text-cyan-400'}>
                           {new Date(selectedCase.deadline).toLocaleDateString()}
                         </span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-cyan-500/50 w-[70%]" />
                      </div>
                   </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Verdict Modal */}
      <AnimatePresence>
        {verdictModal?.open && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setVerdictModal(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
               <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 relative z-10 shadow-3xl shadow-black overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-gold-500 to-green-500" />

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-white flex items-center gap-4">
                        <Gavel className="text-gold-500" size={32} />
                        {t.admin.disputeManager.verdictTerminal.title}
                      </h2>
                      <p className="text-white/40 text-sm font-medium mt-2">
                        {t.admin.disputeManager.verdictTerminal.subtitle} {verdictModal.caseId}
                      </p>
                    </div>
                    <button onClick={() => setVerdictModal(null)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"><X size={20} /></button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.admin.disputeManager.verdictTerminal.assignFaultParty}</label>
                          <div className="flex flex-wrap gap-2">
                             {(['MERCHANT', 'CUSTOMER', 'BOTH', 'SHIPPING_COMPANY', 'PLATFORM'] as const).map(p => (
                               <button
                                 key={p}
                                 onClick={() => setFaultParty(p)}
                                 className={`px-3 py-3 rounded-xl text-[9px] font-black tracking-widest border transition-all
                                   ${faultParty === p ? 'bg-gold-500 text-black border-gold-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                               >
                                 {t.admin.disputeManager.faultParties[p.toLowerCase()] || p.replace('_', ' ')}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.admin.disputeManager.verdictTerminal.financialBreakdown}</label>
                          <div className="space-y-3">
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="flex justify-between mb-1">
                                   <span className="text-[10px] text-white/40 uppercase font-black">{t.admin.disputeManager.verdictTerminal.refundAmount}</span>
                                   <input
                                     type="number"
                                     value={refundAmount}
                                     onChange={(e) => setRefundAmount(Number(e.target.value))}
                                     className="bg-transparent text-right text-gold-500 font-bold outline-none w-20"
                                   />
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.admin.disputeManager.verdictTerminal.shippingRefund}</span>
                                    <input
                                      type="number"
                                      value={shippingRefund}
                                      onChange={(e) => setShippingRefund(Number(e.target.value))}
                                      className="bg-transparent text-right text-cyan-400 font-black outline-none w-20 border-b border-white/5 focus:border-cyan-500/30 transition-all"
                                    />
                                 </div>
                                 <div className="flex justify-between mt-2 pt-2 border-t border-white/5 items-center">
                                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.admin.disputeManager.verdictTerminal.platformFeeLoss}</span>
                                    <input
                                      type="number"
                                      value={stripeFee}
                                      onChange={(e) => setStripeFee(Number(e.target.value))}
                                      className="bg-transparent text-right text-red-400 font-black outline-none w-20 border-b border-white/5 focus:border-red-500/30 transition-all"
                                    />
                                 </div>
                              </div>
                             <div className="p-4 bg-gold-500/5 rounded-2xl border border-gold-500/10 flex justify-between">
                                <span className="text-[10px] text-gold-500 uppercase font-black">{t.admin.disputeManager.verdictTerminal.totalPayout}</span>
                                <span className="text-lg font-black text-white">{(refundAmount + shippingRefund).toFixed(2)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.admin.disputeManager.verdictTerminal.selectVerdictPath}</label>
                          <div className="grid grid-cols-1 gap-2">
                             {[
                               { id: 'REFUND', label: t.admin.disputeManager.verdictTypes.refund_full, color: 'red' },
                               { id: 'REPLACE', label: t.admin.disputeManager.verdictTypes.replace, color: 'cyan' },
                               { id: 'RELEASE_FUNDS', label: t.admin.disputeManager.verdictTypes.release_merchant, color: 'green' },
                               { id: 'DENY', label: t.admin.disputeManager.verdictTypes.deny, color: 'white' }
                             ].map(v => (
                               <button
                                 key={v.id}
                                 onClick={() => handleVerdict(v.id as any)}
                                 className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all duration-300
                                   ${v.color === 'red' ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500 hover:text-white' : 
                                     v.color === 'green' ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500 hover:text-white' : 
                                     v.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500 hover:text-white' :
                                     'bg-white/5 border-white/10 hover:bg-white hover:text-black'}`}
                               >
                                  <span className="font-bold tracking-tight text-xs uppercase">{v.label}</span>
                                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.admin.disputeManager.verdictTerminal.investigationNotes}</label>
                           <textarea 
                             placeholder={t.admin.disputeManager.investigationNotes}
                             className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs focus:border-gold-500 outline-none transition-all placeholder:text-white/10"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.admin.disputeManager.verdictTerminal.decisionRationale}</label>
                           <textarea 
                             value={verdictNotes}
                             onChange={(e) => setVerdictNotes(e.target.value)}
                             placeholder={t.admin.disputeManager.verdict}
                             className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs focus:border-gold-500 outline-none transition-all placeholder:text-white/10"
                           />
                        </div>
                    </div>
                  </div>
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
