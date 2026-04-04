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
    merchantName: string;
    partName: string;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    orderId,
    merchantName,
    partName
}) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const { requestReturn } = useReturnsStore();
    const { addNotification } = useNotificationStore();
    const { getOrder } = useOrderStore();

    // Form State
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [usageCondition, setUsageCondition] = useState<'UNUSED' | 'OPENED' | 'INSTALLED' | ''>('');
    const [confirmations, setConfirmations] = useState({
        integrity: false,
        packaging: false,
        policy: false
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setDescription('');
            setUsageCondition('');
            setConfirmations({ integrity: false, packaging: false, policy: false });
            setFiles([]);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!orderId || !reason || !description || !usageCondition) return;
        if (!confirmations.integrity || !confirmations.packaging || !confirmations.policy) return;
        
        setIsSubmitting(true);

        const success = await requestReturn(String(orderId), undefined, reason, description, usageCondition, files);

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
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <GlassCard className="p-0 border-white/10 overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.15)] bg-[#0A0A0A]/80">
                        {/* 2026 Header - Return specific */}
                        <div className="p-8 border-b border-white/5 relative overflow-hidden">
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
                                    <X size={24} className="text-white/40" />
                                </button>
                            </div>
                            {/* Visual background element */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                        </div>

                        {/* Interactive Form Body */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            {/* Order Context Recap Card */}
                            <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                    <Package size={40} className="text-cyan-500/50" />
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

                            {/* Return Type Indicator - Spec §5 */}
                            {(() => {
                                const orderData = getOrder(orderId);
                                const hasWarranty = orderData?.acceptedOffer?.warranty && 
                                                  orderData.acceptedOffer.warranty.toLowerCase() !== 'no' && 
                                                  orderData.acceptedOffer.warranty !== '0';
                                
                                return (
                                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${hasWarranty ? 'bg-orange-500/10 border-orange-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasWarranty ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {hasWarranty ? <RotateCcw size={16} /> : <BadgeDollarSign size={16} />}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                                                    {isAr ? 'نوع التسوية التلقائي' : 'Auto Settlement Type'}
                                                </span>
                                                <h5 className={`text-sm font-black uppercase ${hasWarranty ? 'text-orange-400' : 'text-green-400'}`}>
                                                    {hasWarranty 
                                                        ? (isAr ? 'استبدال فقط (يوجد ضمان)' : 'Exchange Only (Warranty active)')
                                                        : (isAr ? 'استرداد نقدي كامل' : 'Full Cash Refund')
                                                    }
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Verified</span>
                                        </div>
                                    </div>
                                );
                            })()}

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
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-cyan-500/50 outline-none appearance-none transition-all hover:bg-white/[0.08]"
                                        >
                                            <option value="" className="bg-[#0A0A0A]">{t.dashboard.common?.select || 'Select Protocol Reason...'}</option>
                                            <option value="not_matching" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons?.not_matching || 'Integrity: Not matching description'}</option>
                                            <option value="defective" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons?.defective || 'Quality: Defective'}</option>
                                            <option value="not_working" className="bg-[#0A0A0A]">{isAr ? 'القطعة لا تعمل / عطل مصنعي' : 'Quality: Item not working / Manufacturer defect'}</option>
                                            <option value="wrong_item" className="bg-[#0A0A0A]">{t.dashboard.resolution.reasons?.wrong_item || 'Accuracy: Wrong item'}</option>
                                            <option value="wrong_size" className="bg-[#0A0A0A]">{isAr ? 'خطأ في المقاس أو الموديل' : 'Accuracy: Wrong size or model'}</option>
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
                                            { id: 'OPENED', labelAr: 'فتح التغليف فقط', labelEn: 'Packaging Opened' },
                                            { id: 'INSTALLED', labelAr: 'تم تركيب القطعة', labelEn: 'Item Installed' }
                                        ].map((cond) => (
                                            <button
                                                key={cond.id}
                                                onClick={() => setUsageCondition(cond.id as any)}
                                                className={`
                                                    p-4 rounded-2xl border transition-all text-center group
                                                    ${usageCondition === cond.id 
                                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
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
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white focus:border-cyan-500/50 outline-none resize-none h-32 placeholder-white/10 transition-all hover:bg-white/[0.08]"
                                        placeholder={isAr ? 'صف الحالة بالتفصيل للمراجع الإداري...' : 'Narrate the issue for administrative audit...'}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">{t.dashboard.resolution.form.evidence}</label>
                                    <FileUploader
                                        onFilesSelected={setFiles}
                                        accept={{
                                            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'],
                                            'video/*': ['.mp4', '.mov', '.webm']
                                        }}
                                        maxFiles={5}
                                    />
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
                                                `}
                                            >
                                                {confirmations[check.id as keyof typeof confirmations] && <X size={14} className="stroke-[4]" />}
                                            </div>
                                            <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors font-bold uppercase tracking-tight">
                                                {isAr ? check.textAr : check.textEn}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Luxury Footer with Cinematic Button */}
                        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                    <UploadCloud size={16} />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{files.length} {isAr ? 'ملفات مرفقة' : 'Files Prepared'}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!reason || !description || !usageCondition || !confirmations.integrity || !confirmations.packaging || !confirmations.policy || isSubmitting}
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
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
