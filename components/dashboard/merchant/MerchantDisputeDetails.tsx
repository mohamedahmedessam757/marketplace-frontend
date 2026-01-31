
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Clock, ChevronRight, ChevronLeft, FileText, 
  UploadCloud, Send, ShieldCheck, User, MessageSquare, Scale, CheckCircle2, X
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SecurityUtils } from '../../../utils/security';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface MerchantDisputeDetailsProps {
  caseId: string;
  onBack: () => void;
}

export const MerchantDisputeDetails: React.FC<MerchantDisputeDetailsProps> = ({ caseId, onBack }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;
  
  const { getCaseById, respondToCase } = useResolutionStore();
  const { addNotification } = useNotificationStore();
  const dispute = getCaseById(caseId);

  const [response, setResponse] = useState('');
  const [acceptReturn, setAcceptReturn] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer Logic: Countdown to Auto-Escalation
  useEffect(() => {
    if (!dispute) return;
    const interval = setInterval(() => {
      const deadline = new Date(dispute.deadline).getTime();
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0 });
      } else {
        setTimeLeft({
          h: Math.floor(diff / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dispute]);

  if (!dispute) return <div className="p-8 text-center text-white">Case not found</div>;

  const handleSubmit = () => {
    if (!response && !acceptReturn) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      respondToCase(dispute.id, {
        text: response,
        acceptedReturn: acceptReturn,
        evidence: files
      });

      addNotification({
          type: 'dispute',
          titleKey: 'disputeUpdate',
          message: isAr
            ? `تم إرسال ردك على النزاع #${dispute.id}.`
            : `Response submitted for Dispute #${dispute.id}.`,
          orderId: dispute.orderId,
          linkTo: 'resolution',
          priority: 'normal'
      });

      setIsSubmitting(false);
      onBack();
    }, 2000);
  };

  const getUrgencyColor = () => {
    if (!timeLeft) return 'text-white';
    if (timeLeft.h < 4) return 'text-red-500 animate-pulse';
    if (timeLeft.h < 24) return 'text-orange-500';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
      
      {/* Top Navigation & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowIcon size={18} className={`transition-transform ${isAr ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          <span>{isAr ? 'العودة للمركز' : 'Back to Center'}</span>
        </button>
        
        <div className="flex items-center gap-4 bg-[#151310] px-4 py-2 rounded-xl border border-white/10">
           <div className="text-right">
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">{isAr ? 'الموعد النهائي للرد (تلقائي)' : 'Auto-Escalation Deadline'}</span>
              {timeLeft ? (
                <div className={`flex items-center gap-2 font-mono font-bold ${getUrgencyColor()}`}>
                   <Clock size={14} />
                   {timeLeft.h}h {timeLeft.m}m
                </div>
              ) : (
                <span className="text-xs text-red-500 font-bold">ESCALATED TO ADMIN</span>
              )}
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="text-right">
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">{isAr ? 'رقم القضية' : 'Case ID'}</span>
              <span className="font-mono font-bold text-gold-400">{dispute.id}</span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* LEFT: Customer Claim */}
        <div className="space-y-6">
           <GlassCard className="bg-[#1A1814] border-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              
              <div className="flex items-start justify-between mb-6">
                 <div>
                    <h2 className="text-lg font-bold text-white mb-1">{isAr ? 'تفاصيل شكوى العميل' : 'Customer Claim Details'}</h2>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                       <User size={12} />
                       {dispute.customerName}
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="font-mono">{SecurityUtils.maskPhone('0551234567')}</span>
                    </div>
                 </div>
                 <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Scale size={14} />
                    {dispute.reason.toUpperCase()}
                 </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                 <p className="text-sm text-white/80 leading-relaxed italic">
                    "{dispute.description}"
                 </p>
              </div>

              <div className="space-y-2">
                 <span className="text-xs text-white/40 uppercase tracking-wider">{isAr ? 'الأدلة المرفقة' : 'Attached Evidence'}</span>
                 <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2].map((i) => (
                       <div key={i} className="w-24 h-24 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs text-white/20">Image {i}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </GlassCard>

           <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <ShieldCheck className="text-blue-400 shrink-0" size={20} />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                 {isAr 
                   ? 'جميع البيانات الحساسة للعميل مشفرة لحماية الخصوصية. يرجى التواصل فقط من خلال المنصة.'
                   : 'Customer sensitive data is masked for privacy. Please communicate only through the platform.'}
              </p>
           </div>
        </div>

        {/* RIGHT: Merchant Response Form */}
        <div className="relative">
           {dispute.status !== 'OPEN' && dispute.status !== 'AWAITING_MERCHANT' ? (
              <GlassCard className="h-full flex flex-col items-center justify-center text-center p-12 bg-green-500/5 border-green-500/20">
                 <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                    <CheckCircle2 size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">{isAr ? 'تم استلام ردك' : 'Response Submitted'}</h3>
                 <p className="text-white/50 max-w-xs mx-auto mb-6">
                    {isAr 
                      ? 'جاري مراجعة القضية من قبل فريق فض النزاعات. سيتم إشعارك بالقرار النهائي.'
                      : 'The case is currently under review by the dispute team. You will be notified of the final decision.'}
                 </p>
              </GlassCard>
           ) : (
              <GlassCard className="h-full flex flex-col bg-[#151310] border-gold-500/20">
                 <div className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-2">{isAr ? 'رد التاجر' : 'Your Response'}</h2>
                    <p className="text-xs text-white/50">
                       {isAr 
                         ? 'يرجى تقديم توضيح مفصل أو قبول طلب الإرجاع لحل النزاع ودياً قبل التصعيد.' 
                         : 'Please provide a detailed explanation or accept the return to resolve amicably before escalation.'}
                    </p>
                 </div>

                 <div className="flex-1 space-y-6">
                    {/* Decision Toggle */}
                    <div 
                       onClick={() => setAcceptReturn(!acceptReturn)}
                       className={`
                          p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4
                          ${acceptReturn 
                             ? 'bg-blue-500/10 border-blue-500/50' 
                             : 'bg-white/5 border-white/10 hover:bg-white/10'}
                       `}
                    >
                       <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${acceptReturn ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/30'}`}>
                          {acceptReturn && <CheckCircle2 size={16} />}
                       </div>
                       <div>
                          <h4 className="font-bold text-white text-sm">{isAr ? 'الموافقة على الإرجاع والصلح' : 'Accept Return & Resolve'}</h4>
                          <p className="text-[10px] text-white/40">{isAr ? 'سيتم إصدار بوليصة إرجاع للعميل فوراً' : 'Return waybill will be issued immediately'}</p>
                       </div>
                    </div>

                    {/* Defense Text */}
                    <div>
                       <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                          {isAr ? 'التوضيح / الدفاع' : 'Explanation / Defense'}
                       </label>
                       <textarea 
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-gold-500 outline-none resize-none h-40 placeholder-white/20"
                          placeholder={isAr ? 'اكتب تفاصيل ردك هنا...' : 'Write your detailed response here...'}
                       />
                    </div>

                    {/* Evidence Upload */}
                    <div className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-3 text-white/40 hover:text-gold-400 hover:border-gold-500/30 hover:bg-white/5 cursor-pointer transition-all">
                       <UploadCloud size={20} />
                       <span className="text-xs font-bold">{isAr ? 'إرفاق صور أو مستندات (اختياري)' : 'Attach Proof (Optional)'}</span>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                    <button 
                       onClick={onBack}
                       className="px-6 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-bold"
                    >
                       {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                       onClick={handleSubmit}
                       disabled={isSubmitting || (!response && !acceptReturn)}
                       className="px-8 py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-gold-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                       {isSubmitting ? 'Processing...' : (
                          <>
                             <Send size={16} />
                             {isAr ? 'إرسال الرد' : 'Submit Response'}
                          </>
                       )}
                    </button>
                 </div>
              </GlassCard>
           )}
        </div>

      </div>
    </div>
  );
};
