
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Car, Package, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { useCreateOrderStore } from '../../../../stores/useCreateOrderStore';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface ReviewStepProps {
    onConfirm: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ onConfirm }) => {
    const { vehicle, part, preferences, isSubmitting } = useCreateOrderStore();
    const { t, language } = useLanguage();

    const SummaryItem = ({ icon: Icon, label, value }: any) => (
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="p-2 bg-white/5 rounded-lg text-white/60">
                <Icon size={18} />
            </div>
            <div>
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className="text-sm font-bold text-white">{value || '-'}</div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-2xl p-4 flex items-center gap-3 text-gold-200 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>
                    {t.dashboard.createOrder.review.alert}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Car size={18} className="text-gold-500" />
                        {t.dashboard.createOrder.review.vehicleInfo}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <SummaryItem icon={Car} label={t.dashboard.createOrder.vehicle.make} value={`${vehicle.make} ${vehicle.model} ${vehicle.year}`} />
                        <SummaryItem icon={Settings} label="VIN" value={vehicle.vin} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-white font-bold mb-3 mt-2 flex items-center gap-2">
                        <Package size={18} className="text-gold-500" />
                        {t.dashboard.createOrder.review.partDetails}
                    </h3>
                    <div className="space-y-3">
                        <SummaryItem icon={Package} label={t.dashboard.createOrder.part.name} value={part.name} />
                        {part.description && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xs text-white/40 mb-1">{t.dashboard.createOrder.part.desc}</div>
                                <p className="text-sm text-white/80 leading-relaxed">{part.description}</p>
                            </div>
                        )}
                        {part.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {part.images.map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                        <img src={URL.createObjectURL(img)} alt="part" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-white font-bold mb-3 mt-2 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-gold-500" />
                        {t.dashboard.createOrder.steps.preferences}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <SummaryItem
                            icon={Settings}
                            label={t.dashboard.createOrder.prefs.condition}
                            value={preferences.condition === 'new' ? t.dashboard.createOrder.prefs.new : t.dashboard.createOrder.prefs.used}
                        />
                        <SummaryItem
                            icon={Settings}
                            label={t.dashboard.createOrder.prefs.warranty}
                            value={preferences.warranty ? t.common.required : t.common.optional}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <button
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t.dashboard.createOrder.review.confirm}
                </button>
            </div>

        </motion.div>
    );
};
