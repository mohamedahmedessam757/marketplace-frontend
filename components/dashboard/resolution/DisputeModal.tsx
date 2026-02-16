
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useReturnsStore } from '../../../stores/useReturnsStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    merchantName: string;
    partName: string;
    onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, orderId, merchantName, partName, onSuccess }) => {
    const { t, language } = useLanguage();
    const { escalateDispute } = useReturnsStore();
    const { addNotification } = useNotificationStore(); // Import Notification Store

    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason || !description) return;
        setIsSubmitting(true);

        // Real API Call
        const success = await escalateDispute(String(orderId), reason);

        if (success) {
            // 2. Trigger Notification for Merchant
            addNotification({
                type: 'dispute',
                titleKey: 'disputeUpdate',
                message: `New dispute opened for Order #${orderId}. Reason: ${reason}`,
                orderId: orderId,
                linkTo: 'dispute-details',
                priority: 'urgent'
            });

            onSuccess();
            onClose();
        }

        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1A1814] border border-red-500/30 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.1)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="text-red-500" size={24} />
                            {t.dashboard.resolution.newDispute}
                        </h3>
                        <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
                    </div>

                    <div className="space-y-4 mb-6">
                        {/* Warning Banner */}
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <p className="text-xs text-red-200 leading-relaxed font-bold">{t.dashboard.resolution.alerts.freeze}</p>
                        </div>

                        <p className="text-xs text-white/50 px-1">{t.dashboard.resolution.disputePolicy}</p>

                        {/* Reason Select */}
                        <div>
                            <label className="block text-xs text-white/40 mb-2">{t.dashboard.resolution.form.reason}</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none appearance-none"
                            >
                                <option value="" className="bg-[#1A1814]">{t.dashboard.common?.select || 'Select Reason...'}</option>
                                <option value="delayed" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.delayed}</option>
                                <option value="defective" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.defective}</option>
                                <option value="not_matching" className="bg-[#1A1814]">{t.dashboard.resolution.reasons.not_matching}</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs text-white/40 mb-2">{t.dashboard.resolution.form.desc}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none resize-none h-24 placeholder-white/20 text-sm"
                            />
                        </div>

                        {/* Evidence Upload */}
                        <div className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-white/30 hover:bg-white/5 hover:border-red-500/30 cursor-pointer transition-colors group">
                            <UploadCloud size={32} className="mb-2 group-hover:text-red-400 transition-colors" />
                            <span className="text-xs font-bold text-white/50">{t.dashboard.resolution.form.evidence}</span>
                            <span className="text-[10px] mt-1">{t.dashboard.resolution.form.upload}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!reason || !description || isSubmitting}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                        {t.dashboard.resolution.form.submitDispute}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
