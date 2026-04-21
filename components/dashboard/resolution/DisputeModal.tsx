import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  Loader2, 
  ShieldAlert,
  ChevronRight, 
  ChevronLeft, 
  Scale,
  ShieldCheck,
  Package,
  Zap,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useReturnsStore } from '../../../stores/useReturnsStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { FileUploader } from '../../ui/FileUploader';
import { GlassCard } from '../../ui/GlassCard';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orderId: string;
    orderPartId?: string;
    merchantName: string;
    partName: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    orderId,
    orderPartId,
    merchantName,
    partName
}) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const { escalateDispute } = useReturnsStore();
    const { addNotification } = useNotificationStore();
    const { getOrder } = useOrderStore();

    // Form State
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [confirmations, setConfirmations] = useState({
        integrity: false,
        policy: false
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setDescription('');
            setConfirmations({ integrity: false, policy: false });
            setFiles([]);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!orderId || !reason || !description) return;
        if (!confirmations.integrity || !confirmations.policy) return;
        
        setIsSubmitting(true);

        const success = await escalateDispute(String(orderId), orderPartId, reason, description, files);

        if (success) {
            const orderData = getOrder(orderId);
            if (orderData?.merchantId) {
                addNotification({
                    recipientId: orderData.merchantId,
                    recipientRole: 'MERCHANT',
                    type: 'DISPUTE',
                    titleEn: 'New Dispute Opened',
                    titleAr: 'تم فتح نزاع جديد',
                    messageEn: `New dispute opened for Order #${orderData.orderNumber || orderId}. Reason: ${reason}`,
                    messageAr: `تم فتح نزاع جديد للطلب #${orderData.orderNumber || orderId}. السبب: ${t.dashboard.resolution.reasons[reason as keyof typeof t.dashboard.resolution.reasons] || reason}`,
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
                    <div className="p-0 border border-red-500/20 rounded-[2rem] overflow-hidden shadow-2xl bg-[#0A0A0A] relative">
                        {/* 2026 Header - Dispute (High Alert) */}
                        <div className="p-6 border-b border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                                {isAr ? 'بروتوكول النزاع الرسمي' : 'Official Dispute Protocol'}
                                            </span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                        {t.dashboard.resolution.newDispute}
                                    </h3>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                                >
                                    <X size={20} className="text-white/40" />
                                </button>
                            </div>
                            {/* Visual background element - Red glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
                        </div>

                        {/* Interactive Form Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Order Context Recap Card */}
                            <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                    <Package size={32} className="text-red-500/50" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">#{orderId}</span>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{partName}</h4>
                                    <p className="text-xs font-bold text-white/40 flex items-center gap-2 uppercase">
                                        <ShieldAlert size={14} className="text-red-500" />
                                        {merchantName}
                                    </p>
                                </div>
                            </div>

                            {/* Escalation Policy Banner */}
                            <div className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl flex items-start gap-4">
                                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                                <div className="space-y-2">
                                    <p className="text-[10px] text-red-100/70 leading-relaxed font-bold uppercase tracking-widest">
                                        {t.dashboard.resolution.disputePolicy}
                                    </p>
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-red-500/50 tracking-[0.2em]">
                                        <Zap size={10} /> Escrow Funds Protected
                                    </div>
                                </div>
                            </div>

                            {/* Form Controls */}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">{t.dashboard.resolution.form.reason}</label>
                                    <div className="relative">
                                        <select 
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className={`w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer ${isAr ? 'text-right' : 'text-left'}`}
                                        >
                                            <option value="other" className="bg-[#0A0A0A]">{isAr ? 'أخرى - فتح قضية رسمية' : 'Other - Open Formal Case'}</option>
                                        </select>
                                        <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-6' : 'right-6'} pointer-events-none text-white/20 group-hover:text-red-500 transition-colors`}>
                                            {isAr ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">{t.dashboard.resolution.form.desc}</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white focus:border-red-500/50 outline-none resize-none h-32 placeholder-white/10 transition-all hover:bg-white/[0.08]"
                                        placeholder={isAr ? 'سجل شكواك الرسمية ليقوم المحكم الإداري بمراجعتها...' : 'Lore your official complaint for administrative arbitration...'}
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
                                        {isAr ? 'تأكيدات النزاع الإجبارية' : 'Mandatory Dispute Confirmations'}
                                    </label>
                                    {[
                                        { id: 'integrity', textAr: 'أقر بصحة الشكوى وجميع المرفقات المقدمة', textEn: 'I confirm the validity of the complaint and all attachments' },
                                        { id: 'policy', textAr: 'أدرك أن التقاضي الإداري قرار نهائي وملزم للطرفين', textEn: 'I understand that administrative arbitration is final and binding' }
                                    ].map((check) => (
                                        <label key={check.id} className="flex items-start gap-3 cursor-pointer group">
                                            <div 
                                                onClick={() => setConfirmations(prev => ({ ...prev, [check.id]: !prev[check.id as keyof typeof confirmations] }))}
                                                className={`
                                                    w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-all
                                                    ${confirmations[check.id as keyof typeof confirmations] 
                                                        ? 'bg-red-500 border-red-500 text-black' 
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

                        {/* Luxury Footer with High-Stakes Button */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                    <Scale size={16} />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{isAr ? 'مراجعة قانونية' : 'Legal Grade Review'}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!reason || !description || !confirmations.integrity || !confirmations.policy || isSubmitting}
                                className="w-full md:w-auto px-12 py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(220,38,38,0.3)] disabled:opacity-30 disabled:hover:scale-100 disabled:grayscale group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        {t.dashboard.resolution.form.submitDispute}
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
