
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Clock, ChevronRight, ChevronLeft, FileText, 
  UploadCloud, Send, ShieldCheck, User, MessageSquare, Scale, CheckCircle2, X,
  FileIcon, FileImage, FileStack, Trash2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface MerchantDisputeDetailsProps {
  caseId: string;
  onBack: () => void;
}

export const MerchantDisputeDetails: React.FC<MerchantDisputeDetailsProps> = ({ caseId, onBack }) => {
  const { t, language } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;
  
  const { getCaseById, respondToCase, escalateCase } = useResolutionStore();
  const { addNotification } = useNotificationStore();
  const dispute = getCaseById(caseId);

  const [response, setResponse] = useState('');
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  const calcTimeLeft = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    if (diff <= 0) return { h: 0, m: 0 };
    return {
      h: Math.floor(diff / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
  };

  // Timer Logic: Countdown to Auto-Escalation
  useEffect(() => {
    if (!dispute) return;
    // Initial calculation to prevent flicker
    setTimeLeft(calcTimeLeft(dispute.deadline));
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(dispute.deadline));
    }, 60000);
    return () => clearInterval(interval);
  }, [dispute]);

  if (!dispute) return <div className="p-8 text-center text-white">Case not found</div>;

  const handleManualEscalate = async () => {
    setIsEscalating(true);
    await escalateCase(dispute.id);
    
    addNotification({
        type: 'dispute',
        titleKey: 'disputeUpdate',
        message: isAr
          ? `تم تصعيد النزاع #${dispute.id} للإدارة يدوياً.`
          : `Dispute #${dispute.id} manually escalated to administration.`,
        orderId: dispute.orderId,
        linkTo: 'resolution',
        priority: 'high'
    });
    
    setIsEscalating(false);
    setShowEscalateModal(false);
    onBack();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      // Validate size (10MB) and count (5 max)
      const validFiles = newFiles.filter((f: File) => f.size <= 10 * 1024 * 1024);
      if (validFiles.length !== newFiles.length) {
        addNotification({
          type: 'alert',
          titleKey: 'error',
          message: isAr ? 'بعض الملفات تتجاوز الحد الأقصى (10 ميجابايت)' : 'Some files exceed the 10MB limit',
          priority: 'high'
        });
      }
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!decision) return;
    if (decision === 'REJECT' && !response.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Secure Backend Upload (Bypasses Frontend RLS using NestJS Service Role Key)
      await respondToCase(dispute.id, dispute.type, {
        text: response,
        acceptedReturn: decision === 'APPROVE',
        evidence: selectedFiles // Passing files to be handled by backend
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

      onBack();
    } catch (error: any) {
      addNotification({
        type: 'alert',
        titleKey: 'error',
        message: isAr ? 'فشل إرسال الرد، يرجى المحاولة لاحقاً' : 'Failed to submit response, please try again',
        priority: 'high'
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">{isAr ? 'التصعيد التلقائي خلال' : 'Auto-Escalation In'}</span>
               {timeLeft ? (
                <div className={`flex items-center gap-2 font-mono font-bold ${getUrgencyColor()}`}>
                   <Clock size={14} />
                   {timeLeft.h}h {timeLeft.m}m
                </div>
              ) : dispute.status === 'ESCALATED' ? (
                <span className="text-xs text-red-500 font-bold uppercase">{isAr ? 'تم التصعيد للإدارة' : 'ESCALATED TO ADMIN'}</span>
              ) : (
                <div className="flex items-center gap-2 text-white/20 animate-pulse">
                  <Clock size={14} />
                  <span className="text-[10px] font-mono">--h --m</span>
                </div>
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
                       <span>{isAr ? 'كود العميل' : 'Customer Code'}: {dispute.customerId.split('-')[0]}</span>
                    </div>
                 </div>
                 <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Scale size={14} />
                    {isAr ? (t.dashboard.merchant.resolution.reasons[dispute.reason.toLowerCase()] || dispute.reason) : dispute.reason.toUpperCase()}
                 </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                 <p className="text-sm text-white/80 leading-relaxed italic">
                    "{dispute.description}"
                 </p>
              </div>

              <div className="space-y-2">
                 <span className="text-xs text-white/40 uppercase tracking-wider">{isAr ? 'الأدلة المرفقة' : 'Attached Evidence'}</span>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                     {dispute.customerEvidence && dispute.customerEvidence.length > 0 ? (
                        dispute.customerEvidence.map((url, i) => (
                           <div key={i} className="w-32 h-32 rounded-2xl bg-black/40 border border-white/10 overflow-hidden shrink-0 group/img relative">
                              <img 
                                 src={url} 
                                 alt={`Evidence ${i+1}`} 
                                 className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-all duration-500" 
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                 <FileText className="text-white" size={24} />
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="w-full py-8 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-30">
                           <X size={24} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'لا توجد مرفقات' : 'No Evidence Uploaded'}</span>
                        </div>
                     )}
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

                  <div className="flex-1 space-y-4">
                    {/* Decision Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                       <div 
                          onClick={() => setDecision('APPROVE')}
                          className={`
                             p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden
                             ${decision === 'APPROVE' 
                                ? 'bg-green-500/10 border-green-500/50' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'}
                          `}
                       >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${decision === 'APPROVE' ? 'bg-green-500 border-green-500 text-white' : 'border-white/30'}`}>
                             {decision === 'APPROVE' && <CheckCircle2 size={16} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-white text-[12px]">{isAr ? 'الموافقة على الإرجاع والصلح' : 'Accept Return & Resolve'}</h4>
                             <p className="text-[9px] text-white/40 leading-tight">{isAr ? 'سيتم إصدار بوليصة إرجاع للعميل فوراً' : 'Return waybill will be issued immediately'}</p>
                          </div>
                       </div>

                       <div 
                          onClick={() => setDecision('REJECT')}
                          className={`
                             p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden
                             ${decision === 'REJECT' 
                                ? 'bg-red-500/10 border-red-500/50' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'}
                          `}
                       >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${decision === 'REJECT' ? 'bg-red-500 border-red-500 text-white' : 'border-white/30'}`}>
                             {decision === 'REJECT' && <X size={16} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-white text-[12px]">{isAr ? 'رفض الإرجاع' : 'Reject Return'}</h4>
                             <p className="text-[9px] text-white/40 leading-tight">{isAr ? 'سيتم مراجعة دفاعك من قبل الإدارة' : 'Decision will be reviewed by admin'}</p>
                          </div>
                       </div>
                    </div>

                     {/* Dynamic Decision Warnings (Phase 2) */}
                     <AnimatePresence mode="wait">
                        {decision === 'APPROVE' && (
                           <motion.div
                              key="approve-warning"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                           >
                              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex gap-3 text-left mb-4">
                                 <AlertTriangle size={18} className="text-green-500 shrink-0 mt-0.5" />
                                 <div className="flex-1">
                                    <h5 className="text-[11px] font-bold text-green-500 mb-1">
                                       {isAr ? 'ماذا سيحدث الآن؟' : 'What happens next?'}
                                    </h5>
                                    <p className="text-[10px] text-white/60 leading-relaxed">
                                       {isAr 
                                         ? 'بمجرد الموافقة، سنقوم بإصدار بوليصة شحن للعميل آلياً. بعد استلامك للمنتج وفحصه، يمكنك تأكيد استرداد الأموال للعميل.' 
                                         : 'Upon approval, a return waybill will be automatically generated for the customer. Once you receive and inspect the item, you can confirm the final refund.'}
                                    </p>
                                 </div>
                              </div>
                           </motion.div>
                        )}

                        {decision === 'REJECT' && (
                           <motion.div
                              key="reject-warning"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                           >
                              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex gap-3 text-left mb-4">
                                 <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                 <div className="flex-1">
                                    <h5 className={`text-[11px] font-bold text-red-500 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
                                       {isAr ? 'تنبيه هـام' : 'Important Note'}
                                    </h5>
                                    <p className={`text-[10px] text-white/60 leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
                                       {isAr 
                                         ? 'يجب كتابة سبب الرفض بوضوح وإرفاق الأدلة اللازمة. قد يقوم العميل بطلب "تصعيد" القضية للإدارة للمراجعة النهائية في حال عدم الاقتناع بالسبب.' 
                                         : 'A clear reason for rejection and supporting evidence must be provided. The customer may escalate the case to administration for final review if the reason is unsatisfactory.'}
                                    </p>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

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
                     <div className="space-y-4">
                        <input 
                           type="file" 
                           ref={fileInputRef}
                           onChange={handleFileSelect}
                           multiple 
                           accept="image/*,application/pdf,video/*"
                           className="hidden" 
                        />
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-3 text-white/40 hover:text-gold-400 hover:border-gold-500/30 hover:bg-white/5 cursor-pointer transition-all"
                        >
                           <UploadCloud size={20} />
                           <span className="text-xs font-bold">{isAr ? 'إرفاق صور أو مستندات (اختياري)' : 'Attach Proof (Optional)'}</span>
                        </div>

                        {/* Selected Files Gallery */}
                        <AnimatePresence>
                           {selectedFiles.length > 0 && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 10 }}
                                 className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                              >
                                 {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="group relative bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
                                       <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                                          {file.type.startsWith('image/') ? <FileImage size={20} /> : <FileText size={20} />}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-[10px] text-white font-bold truncate">{file.name}</p>
                                          <p className="text-[9px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                       </div>
                                       <button 
                                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                          className="p-1.5 bg-black/20 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-md transition-all"
                                          title={isAr ? 'حذف' : 'Remove'}
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 ))}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                 </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
                     <button 
                        onClick={() => setShowEscalateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300 active:scale-95 shadow-lg shadow-red-500/5"
                     >
                        <Scale size={14} />
                        {isAr ? 'تصعيد للادارة' : 'Escalate to Admin'}
                     </button>

                     <div className="flex gap-3">
                        <button 
                           onClick={onBack}
                           className="px-6 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-bold"
                        >
                           {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button 
                           onClick={handleSubmit}
                           disabled={isSubmitting || !decision || (decision === 'REJECT' && !response.trim())}
                           className="px-8 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-black rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-gold-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                           {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                 <span>{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
                              </div>
                           ) : (
                              <>
                                 <Send size={16} />
                                 {isAr ? 'إرسال الرد' : 'Send Response'}
                              </>
                           )}
                        </button>
                     </div>
                  </div>
              </GlassCard>
           )}
        </div>

      </div>

      {/* Manual Escalation Warning Modal */}
      <AnimatePresence>
         {showEscalateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEscalateModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-[#1A1814] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
                  
                  <div className="flex flex-col items-center text-center gap-6">
                     <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                        <AlertTriangle size={40} />
                     </div>
                     
                     <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{isAr ? 'هل أنت متأكد من التصعيد؟' : 'Confirm Manual Escalation'}</h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                           {isAr 
                              ? 'عند تصعيد النزاع، سيتم سحب الصلاحيات من التاجر والعميل وسيتم تحويل المراجعة إلى فريق فض النزاعات بالإدارة لإصدار حكم نهائي وغير قابل للنقاش.'
                              : 'By escalating, you transfer full control to the administration. A final, non-negotiable verdict will be issued by the dispute team.'}
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        <button 
                           onClick={() => setShowEscalateModal(false)}
                           className="py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white font-bold transition-all"
                        >
                           {isAr ? 'تراجع' : 'Back'}
                        </button>
                        <button 
                           onClick={handleManualEscalate}
                           disabled={isEscalating}
                           className="py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                           {isEscalating ? <Clock className="animate-spin" size={18} /> : (isAr ? 'نعم، تصعيد الآن' : 'Yes, Escalate Now')}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
