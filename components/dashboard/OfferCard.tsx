import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Truck, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface OfferProps {
    id: number;
    storeName: string;
    rating: number;
    reviewCount: number;
    price: number;
    condition: string;
    warranty: string;
    deliveryTime: string;
    onAccept: () => void;
    onChat: () => void;
    isSelected?: boolean;
    offerImage?: string;
}

export const OfferCard: React.FC<OfferProps> = ({
    storeName,
    rating,
    reviewCount,
    price,
    condition,
    warranty,
    deliveryTime,
    onAccept,
    onChat,
    isSelected,
    offerImage
}) => {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        w-full p-6 rounded-2xl border transition-all duration-300
        ${isSelected
                    ? 'bg-gold-500/10 border-gold-500 shadow-[0_4px_20px_rgba(168,139,62,0.15)]'
                    : 'bg-[#151310] border-white/5 hover:border-gold-500/30 hover:bg-[#1A1814]'}
      `}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                {/* Merchant Info */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xl">
                        {storeName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{storeName}</h3>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <div className="flex items-center text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                <span className="mx-1 font-bold text-white">{rating}</span>
                            </div>
                            <span className="text-white/30 text-xs">({reviewCount})</span>
                        </div>
                    </div>
                </div>

                {/* Offer Image (if available) */}
                {offerImage && (
                    <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <img src={offerImage} alt="Offer Part" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Price */}
                <div className="text-right">
                    <div className="text-3xl font-bold text-gold-400">{price.toLocaleString()} <span className="text-sm font-medium text-white/50">SAR</span></div>
                    <div className="text-xs text-white/40 mt-1">{(t.offers as any)?.incVat || 'Inc. VAT'}</div>
                </div>
            </div>

            {/* Separator */}
            <div className="h-px w-full bg-white/5 my-5" />

            {/* Details & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Specs */}
                <div className="flex flex-wrap gap-4 text-sm w-full md:w-auto justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/70">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>{condition}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/70">
                        <ShieldCheck size={14} className="text-gold-400" />
                        <span>{warranty}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/70">
                        <Truck size={14} className="text-green-400" />
                        <span>{deliveryTime}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={onChat}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
                    >
                        <MessageSquare size={20} />
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold shadow-lg shadow-gold-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        <span>{(t.offers as any)?.accept || 'Accept Offer'}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
