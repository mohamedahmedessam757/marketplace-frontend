import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Clock, ChevronRight, ChevronLeft, FileText, 
  UploadCloud, Send, ShieldCheck, User, MessageSquare, Scale, CheckCircle2, X,
  Package, Store, History, Gavel, Search, Loader2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge } from '../../ui/Badge';
import { DisputeChat } from '../resolution/DisputeChat';

interface CustomerDisputeDetailsProps {
  caseId: string;
  onBack: () => void;
}

export const CustomerDisputeDetails: React.FC<CustomerDisputeDetailsProps> = ({ caseId, onBack }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;
  
  const { getCaseById } = useResolutionStore();
  const dispute = getCaseById(caseId);

  const [rebuttal, setRebuttal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dispute) return (
    <div className="p-20 text-center">
      <Loader2 className="animate-spin text-gold-500 mx-auto mb-4" size={40} />
      <p className="text-white/40 uppercase tracking-widest font-black">
        {isAr ? 'جاري فحص بيانات الحالة...' : 'Analyzing Case Intelligence...'}
      </p>
    </div>
  );

  const steps = [
    { key: 'REQUESTED', icon: Send, label: t.dashboard.resolution.statusTimeline?.requested || 'Requested' },
    { key: 'AWAITING_MERCHANT', icon: Store, label: t.dashboard.resolution.statusTimeline?.awaiting_merchant || 'Merchant Review' },
    { key: 'UNDER_REVIEW', icon: ShieldCheck, label: t.dashboard.resolution.statusTimeline?.under_review || 'Admin Oversight' },
    { key: 'RESOLVED', icon: Gavel, label: t.dashboard.resolution.statusTimeline?.resolved || 'Final Verdict' }
  ];

  const currentStepIndex = 
    dispute.status === 'RESOLVED' || dispute.status === 'REFUNDED' ? 3 :
    dispute.status === 'UNDER_REVIEW' || dispute.status === 'AWAITING_ADMIN' ? 2 :
    dispute.status === 'AWAITING_MERCHANT' || dispute.status === 'OPEN' ? 1 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <button onClick={onBack} className="flex items-center gap-3 text-white/40 hover:text-gold-400 transition-all group font-black uppercase tracking-widest text-xs">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-gold-500/50">
            <ArrowIcon size={20} />
          </div>
          {t.dashboard.resolution.details.back}
        </button>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
           <div className="px-4 py-2 text-right">
              <span className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1">{t.dashboard.resolution.details.statusProtocol}</span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dispute.status === 'RESOLVED' ? 'bg-green-500' : 'bg-gold-500'}`} />
                <Badge variant={dispute.status === 'RESOLVED' ? 'success' : 'gold'} className="font-black uppercase tracking-widest text-[10px] bg-transparent border-none p-0">
                  {t.dashboard.resolution.statusTimeline?.[dispute.status.toLowerCase()] || dispute.status}
                </Badge>
              </div>
           </div>
           <div className="w-px h-10 bg-white/10" />
           <div className="px-4 py-2 text-right">
              <span className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1">{t.dashboard.resolution.details.digitalSignature}</span>
              <span className="font-mono font-black text-gold-500 text-xs tracking-tighter">HEX_{dispute.id.substring(0, 8).toUpperCase()}</span>
           </div>
        </div>
      </div>

      {/* Status Timeline */}
      <GlassCard className="p-10 border-white/5 overflow-hidden relative">
         <div className="absolute inset-0 bg-gold-500/[0.02] pointer-events-none" />
         <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            {steps.map((step, idx) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-4 group">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                      ${idx <= currentStepIndex 
                         ? 'bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                         : 'bg-white/5 border-white/10 text-white/20'}`}>
                      <step.icon size={28} />
                   </div>
                   <div className="text-center">
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${idx <= currentStepIndex ? 'text-gold-400' : 'text-white/20'}`}>
                        {step.label}
                      </div>
                      {idx === currentStepIndex && idx < 3 && (
                        <div className="text-[8px] text-white/40 font-bold uppercase animate-pulse">
                          {isAr ? 'قيد التنفيذ...' : 'Running...'}
                        </div>
                      )}
                   </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`hidden md:block flex-1 h-[2px] rounded-full mx-4 transition-all duration-1000
                    ${idx < currentStepIndex ? 'bg-gold-500 shadow-[0_0_10px_#D4AF37]' : 'bg-white/5'}`} />
                )}
              </React.Fragment>
            ))}
         </div>
      </GlassCard>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Case Narrative */}
        <div className="lg:col-span-8 space-y-8">
           <GlassCard className="p-10 space-y-8 border-white/5 relative group">
              <div className="flex items-start justify-between">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                       <Package size={40} className="text-white/20 group-hover:text-gold-500 transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2">{dispute.type === 'dispute' ? (isAr ? 'نزاع' : 'Dispute') : (isAr ? 'إرجاع' : 'Return')} {isAr ? 'موضوع' : 'Subject'}</h4>
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase">{dispute.partName}</h2>
                        <p className="text-white/40 text-sm font-bold flex items-center gap-2 mt-1">
                          {t.dashboard.resolution.details.orderRef}: #{dispute.orderId}
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          {t.dashboard.resolution.details.initiated}: {new Date(dispute.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t.dashboard.resolution.details.primaryReason}</span>
                    <div className="text-lg font-black text-white uppercase">{dispute.reason}</div>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t.dashboard.resolution.details.merchantEntity}</span>
                    <div className="text-lg font-black text-white uppercase flex items-center gap-2 text-cyan-400">
                       <Store size={18} />
                       {dispute.merchantName}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t.dashboard.resolution.details.statement}</span>
                 <div className="bg-white/5 rounded-3xl p-8 border border-white/10 italic text-white/80 leading-relaxed font-medium">
                    "{dispute.description}"
                 </div>
              </div>

              {dispute.customerEvidence && dispute.customerEvidence.length > 0 && (
                <div className="space-y-4">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t.dashboard.resolution.details.evidence}</span>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {dispute.customerEvidence.map((img, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden group/img relative">
                           <img src={img} alt="Evidence" className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-all" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                              <Search className="text-white" size={24} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </GlassCard>

           {/* Real-time Case Discussion (Phase 4) */}
           <div className="space-y-4">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">{t.dashboard.resolution.details.secureDiscussion}</span>
              <DisputeChat caseId={caseId} caseType={dispute.type} t={t} />
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           {/* Final Decision Panel */}
           {dispute.status === 'RESOLVED' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard className="p-8 border-green-500/20 bg-green-500/[0.03]">
                   <div className="flex items-center gap-3 mb-6">
                      <ShieldCheck size={28} className="text-green-400" />
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.dashboard.resolution.details.verdict}</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-2">{t.dashboard.resolution.details.conclusion}</span>
                         <p className="text-sm font-bold text-white leading-relaxed">
                            {isAr ? 'اكتملت المراجعة الإدارية. تم حل القضية وفقاً لمسار القرار المحدد. تم توزيع الأموال بناءً على ذلك.' : 'Administrative review complete. The case has been resolved in favor of the specified resolution path. Funds have been distributed accordingly.'}
                         </p>
                      </div>
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center py-2 border-t border-white/5 mt-4">
                         {t.dashboard.resolution.details.closedAt} {new Date(dispute.updatedAt).toLocaleString()}
                      </div>
                   </div>
                </GlassCard>
              </motion.div>
           )}

           {/* Merchant Interaction Audit */}
           {dispute.merchantResponse && (
             <GlassCard className="p-8 border-cyan-500/10">
                <div className="flex items-center gap-3 mb-6">
                   <Store size={22} className="text-cyan-400" />
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">{t.dashboard.resolution.details.defense}</h3>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-white/60 text-xs font-medium leading-relaxed">
                   "{dispute.merchantResponse.text}"
                </div>
             </GlassCard>
           )}

           {/* Security / FAQ */}
           <GlassCard className="p-8 bg-cyan-500/[0.02] border-cyan-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <ShieldCheck size={18} className="text-cyan-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{t.dashboard.resolution.details.escrowSecurity}</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-widest relative z-10">
                {t.dashboard.resolution.details.escrowDesc}
              </p>
           </GlassCard>

           <GlassCard className="p-8 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                 <History size={18} className="text-gold-400" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{t.dashboard.resolution.details.activity}</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { t: t.dashboard.resolution.details.opened, d: dispute.createdAt },
                   { t: t.dashboard.resolution.details.notified, d: dispute.createdAt },
                   ...(dispute.updatedAt !== dispute.createdAt ? [{ t: t.dashboard.resolution.details.update, d: dispute.updatedAt }] : [])
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 items-start pb-6 border-l border-white/5 ml-2 relative">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gold-500/50" />
                      <div className="pl-4">
                         <div className="text-[10px] font-black text-white uppercase tracking-tight">{act.t}</div>
                         <div className="text-[9px] text-white/20 mt-1">{new Date(act.d).toLocaleString()}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </GlassCard>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
