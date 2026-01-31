
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  merchantName: string;
  partName: string;
  onSuccess: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ isOpen, onClose, orderId, merchantName, partName, onSuccess }) => {
  const { t, language } = useLanguage();
  const { createCase } = useResolutionStore();
  const { addNotification } = useNotificationStore(); 
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description) return;
    setIsSubmitting(true);
    
    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    createCase({
        orderId,
        type: 'return',
        merchantName,
        partName,
        reason,
        description,
    });

    // TRIGGER NOTIFICATION FOR MERCHANT
    addNotification({
        type: 'dispute', 
        titleKey: 'disputeUpdate', 
        message: language === 'ar' 
            ? `طلب إرجاع جديد للطلب #${orderId}. السبب: ${t.dashboard.resolution.reasons[reason as keyof typeof t.dashboard.resolution.reasons]}`
            : `New Return Request for Order #${orderId}. Reason: ${reason}`,
        orderId: orderId,
        linkTo: 'dispute-details', // Merchant link
        priority: 'urgent',
        channels: ['app', 'email']
    });

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1814] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-6 bg-cyan-500 rounded-full" />
                    {t.dashboard.resolution.newReturn}
                </h3>
                <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-cyan-200 leading-relaxed">{t.dashboard.resolution.returnPolicy}</p>
                </div>

                {/* Reason Select */}
                <div>
                    <label className="block text-xs text-white/40 mb-2">{t.dashboard.resolution.form.reason}</label>
                    <select 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none appearance-none"
                    >
                        <option value="" className="bg-[#1A1814]">Select Reason...</option>
                        <option value="not_matching" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.not_matching}</option>
                        <option value="defective" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.defective}</option>
                        <option value="wrong_item" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.wrong_item}</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs text-white/40 mb-2">{t.dashboard.resolution.form.desc}</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none h-24 placeholder-white/20 text-sm"
                    />
                </div>

                {/* Evidence Upload */}
                <div className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-white/30 hover:bg-white/5 hover:border-cyan-500/30 cursor-pointer transition-colors group">
                    <UploadCloud size={32} className="mb-2 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-xs font-bold text-white/50">{t.dashboard.resolution.form.evidence}</span>
                    <span className="text-[10px] mt-1">{t.dashboard.resolution.form.upload}</span>
                </div>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={!reason || !description || isSubmitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                {t.dashboard.resolution.form.submitReturn}
            </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
