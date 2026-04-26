import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  ShieldCheck,
  Package,
  RotateCcw,
  BadgeDollarSign,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useReturnsStore } from '../../../stores/useReturnsStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { FileUploader } from '../../ui/FileUploader';
import { GlassCard } from '../../ui/GlassCard';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orderId: string;
    orderPartId?: string;
    merchantName: string;
    partName: string;
    initialReason?: string;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    orderId,
    orderPartId,
    merchantName,
    partName,
    initialReason
}) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const { requestReturn } = useReturnsStore();
    const { addNotification } = useNotificationStore();
    const { getOrder } = useOrderStore();

    // Form State
    const [reason, setReason] = useState(initialReason || '');
    const [description, setDescription] = useState('');
    const [usageCondition, setUsageCondition] = useState<'UNUSED' | 'OPENED' | 'INSTALLED' | ''>('');
    const [confirmations, setConfirmations] = useState({
        integrity: false,
        packaging: false,
        policy: false
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason(initialReason || '');
            setDescription('');
            setUsageCondition('');
            setConfirmations({ integrity: false, packaging: false, policy: false });
            setFiles([]);
            setAttemptedSubmit(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setAttemptedSubmit(true);
        if (!orderId || !reason || !description || !usageCondition || files.length === 0) return;
        if (!confirmations.integrity || !confirmations.packaging || !confirmations.policy) return;
        
        setIsSubmitting(true);

        const success = await requestReturn(String(orderId), orderPartId, reason, description, usageCondition, files);

        if (success) {
            const orderData = getOrder(orderId);
            if (orderData?.merchantId) {
                addNotification({
                    recipientId: orderData.merchantId,
                    recipientRole: 'MERCHANT',
                    type: 'DISPUTE',
                    titleEn: 'New Return Request',
                    titleAr: 'طلب إرجاع جديد',
                    messageEn: `New Return Request for Order #${orderData.orderNumber || orderId}. Reason: ${reason}`,
                    messageAr: `طلب إرجاع جديد للطلب #${orderData.orderNumber || orderId}. السبب: ${t.dashboard.resolution.reasons[reason as keyof typeof t.dashboard.resolution.reasons] || reason}`,
                    link: `/dashboard/orders/${orderId}`,
                    metadata: {
                        orderId: orderId,
                        fileCount: files.length,
                    }
                });
            }
            onSuccess();
            onClose();
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/85"
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-lg relative z-10"
                >
                    <div className="p-0 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl bg-[#0A0A0A] relative">
                        {/* 2026 Header - Return specific */}
                        <div className="p-6 border-b border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                                {isAr ? 'بروتوكول الإرجاع' : 'Return Protocol'}
                                            </span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                        {t.dashboard.resolution.newReturn}
                                    </h3>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                                >
                                    <X size={20} className="text-white/40" />
                                </button>
                            </div>
                            {/* Visual background element */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                        </div>

                        {/* Interactive Form Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Order Context Recap Card */}
                            <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                    <Package size={32} className="text-cyan-500/50" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">#{orderId}</span>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{partName}</h4>
                                    <p className="text-xs font-bold text-white/40 flex items-center gap-2 uppercase">
                                        <ShieldCheck size={14} className="text-cyan-500" />
                                        {merchantName}
                                    </p>
                                </div>
                            </div>


                            {/* Warning / Intelligence Note */}
                            <div className="p-5 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-2xl flex items-start gap-4">
                                <Info className="text-cyan-400 shrink-0 mt-1" size={20} />
                                <p className="text-[11px] text-cyan-100/50 leading-relaxed font-bold uppercase tracking-widest">
                                    {isAr
                                        ? 'يرجى إرفاق صور واضحة توضح سبب الإرجاع. سيتم مراجعة هذه البيانات من قبل الإدارة لضمان حماية حقوق الطرفين.'
                                        : 'Please attach clear evidence justifying the return. This data will be audited to ensure the protection of both parties\' rights.'
                                    }
                                </p>
                            </div>

                            {/* Enhanced Form Controls */}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">{t.dashboard.resolution.form.reason}</label>
                                    <div className="relative">
                                        <select 
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className={`w-full bg-[#0A0A0A] border rounded-2xl px-5 py-4 text-xs text-white outline-none transition-all appearance-none cursor-pointer ${isAr ? 'text-right' : 'text-left'}
                                            ${attemptedSubmit && !reason ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-cyan-500/50'}`}
                                        >
                                            <option value="" className="bg-[#0A0A0A]">{t.dashboard.common?.select || (isAr ? 'اختر السبب...' : 'Select Reason...')}</option>
                                            <option value="not_matching" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.not_matching}</option>
                                            <option value="defective" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.defective}</option>
                                            <option value="not_working" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.not_working}</option>
                                            <option value="wrong_item" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.wrong_item}</option>
                                            <option value="wrong_size" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.wrong_size}</option>
                                            <option value="warranty_claim" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.warranty_claim}</option>
                                            <option value="replacement" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons.replacement}</option>
                                            <option value="other" className="bg-[#0A0A0A]">{isAr ? 'أخرى - توضيح إضافي' : 'Other - Additional Context'}</option>
                                        </select>
                                        <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-6' : 'right-6'} pointer-events-none text-white/20 group-hover:text-cyan-500 transition-colors`}>
                                            {isAr ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Condition - Spec §2 */}
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 ml-2">
                                        {isAr ? 'حالة استخدام القطعة' : 'Item Usage Condition'}
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'UNUSED', labelAr: 'لم يتم الاستخدام', labelEn: 'Unused' },
                                            { id: 'OPENED', labelAr: 'مفتوح الغلاف', labelEn: 'Packaging Opened' },
                                            { id: 'INSTALLED', labelAr: 'تم تركيب القطعة', labelEn: 'Item Installed' }
                                        ].map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => setUsageCondition(cond.id as any)}
                                                className={`
                                                    p-4 rounded-2xl border transition-all text-center group
                                                    ${usageCondition === cond.id 
                                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                                        : attemptedSubmit && !usageCondition 
                                                            ? 'bg-red-500/5 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                                                    }
                                                `}
                                            >
                                                <span className="block text-xs font-black uppercase tracking-tighter mb-1">
                                                    {isAr ? cond.labelAr : cond.labelEn}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full mx-auto ${usageCondition === cond.id ? 'bg-cyan-500 scale-125' : 'bg-white/10 group-hover:bg-white/20'} transition-all`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">{t.dashboard.resolution.form.desc}</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={`w-full bg-white/5 border rounded-3xl px-6 py-5 text-sm text-white outline-none resize-none h-32 placeholder-white/10 transition-all hover:bg-white/[0.08]
                                        ${attemptedSubmit && !description ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-cyan-500/50'}`}
                                        placeholder={isAr ? 'صف الحالة بالتفصيل للمراجع الإداري...' : 'Narrate the issue for administrative audit...'}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">{t.dashboard.resolution.form.evidence}</label>
                                    <div className={`rounded-3xl transition-all ${attemptedSubmit && files.length === 0 ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}>
                                        <FileUploader
                                            onFilesSelected={setFiles}
                                            accept={{
                                                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'],
                                                'video/*': ['.mp4', '.mov', '.webm']
                                            }}
                                            maxFiles={5}
                                        />
                                    </div>
                                </div>

                                {/* Mandatory Confirmations - Spec §6 */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 mb-2">
                                        {isAr ? 'إقرارات إجبارية' : 'Mandatory Acknowledgements'}
                                    </label>
                                    {[
                                        { id: 'integrity', textAr: 'أقر بأن جميع البيانات والأدلة المقدمة صحيحة', textEn: 'I confirm all data and evidence provided is accurate' },
                                        { id: 'packaging', textAr: 'أقر بأنني سأقوم بتغليف القطعة بشكل آمن قبل التسليم', textEn: 'I agree to safely package the item before handover' },
                                        { id: 'policy', textAr: 'أوافق على سياسة الإرجاع والنزاعات (3 أيام للتسليم)', textEn: 'I agree to the return policy (3-day handover window)' }
                                    ].map((check) => (
                                        <label key={check.id} className="flex items-start gap-3 cursor-pointer group">
                                            <div 
                                                onClick={() => setConfirmations(prev => ({ ...prev, [check.id]: !prev[check.id as keyof typeof confirmations] }))}
                                                className={`
                                                    w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-all
                                                    ${confirmations[check.id as keyof typeof confirmations] 
                                                        ? 'bg-cyan-500 border-cyan-500 text-black' 
                                                        : 'bg-white/5 border-white/10 group-hover:border-white/30'
                                                    }
                                                    ${attemptedSubmit && !confirmations[check.id as keyof typeof confirmations] ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}
                                                `}
                                            >
                                                {confirmations[check.id as keyof typeof confirmations] && <X size={14} className="stroke-[4]" />}
                                            </div>
                                            <span className={`text-[11px] group-hover:text-white/60 transition-colors font-bold uppercase tracking-tight ${attemptedSubmit && !confirmations[check.id as keyof typeof confirmations] ? 'text-red-400' : 'text-white/40'}`}>
                                                {isAr ? check.textAr : check.textEn}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Luxury Footer with Cinematic Button */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                    <UploadCloud size={16} />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{files.length} {isAr ? 'ملفات مرفقة' : 'Files Prepared'}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-12 py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:hover:scale-100 disabled:grayscale group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        {t.dashboard.resolution.form.submitReturn}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
