import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Truck, MessageSquare, CheckCircle2, Box, Tag, X, ZoomIn } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface OfferProps {
    id: number;
    storeName: string;
    rating: number;
    storeCity?: string;
    reviewCount: number;
    price: number;
    unitPrice: number;
    condition: string;
    warranty: string | boolean;
    deliveryTime: string;
    onAccept: () => void;
    onChat: () => void;
    isSelected?: boolean;
    offerImage?: string;
    storeLogo?: string | null;
    isShippingIncluded?: boolean;
    weight?: number;
    partType?: string;
}

export const OfferCard: React.FC<OfferProps> = ({
    storeName,
    rating,
    reviewCount,
    price,
    unitPrice,
    condition,
    warranty,
    deliveryTime,
    onAccept,
    onChat,
    isSelected,
    storeLogo,
    offerImage,
    notes,
    storeCity,
    isShippingIncluded,
    weight,
    partType
}) => {
    const { t, language } = useLanguage();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Helper to map raw values to translations
    // Access 'offers' from 'dashboard' namespace if nested, or root if moved. 
    // Based on index.ts, it is inside dashboard.
    const offersT = (t.dashboard as any)?.offers || (t.offers as any);

    const getConditionText = (val: string) => offersT?.conditions?.[val?.trim()] || val;
    const getWarrantyText = (val: string | boolean) => {
        const strictVal = typeof val === 'boolean' ? (val ? 'yes' : 'no') : val?.toLowerCase()?.trim();
        return offersT?.warranties?.[strictVal] || val.toString();
    };
    const getDeliveryText = (val: string) => offersT?.delivery?.[val?.trim()] || offersT?.delivery?.[val] || val;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 mb-4 transition-all duration-300 relative overflow-hidden group ${isSelected
                    ? 'bg-gradient-to-br from-gold-500/10 to-transparent border-2 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
            >
                {/* Header: Store & Price */}
                <div className="flex justify-between items-start gap-4 mb-6">
                    {/* Merchant Info */}
                    <div className="flex items-start gap-4">
                        {/* Store Logo */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xl overflow-hidden shrink-0">
                            {storeLogo ? (
                                <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                            ) : (
                                storeName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{storeName}</h3>
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <div className="flex items-center text-yellow-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="mx-1 font-bold text-white">{rating.toFixed(1)}</span>
                                </div>
                                <span className="text-white/30 text-xs">({reviewCount} {(t.common as any)?.reviews || 'Reviews'})</span>

                                {/* Location Badge */}
                                {storeCity && (
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] text-white/50 border border-white/5">
                                        <Truck size={10} /> {storeCity}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Offer Image (Clickable) */}
                    {offerImage && (
                        <div
                            onClick={() => setIsImageModalOpen(true)}
                            className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-lg cursor-pointer relative group/image"
                        >
                            <img src={offerImage} alt="Offer Part" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="text-white" size={24} />
                            </div>
                        </div>
                    )}

                    {/* Price Section */}
                    <div className="text-right shrink-0">
                        <div className="flex flex-col items-end">
                            <div className="text-3xl font-bold text-gold-400 number-font">{price.toLocaleString()} <span className="text-sm font-medium text-white/50">AED</span></div>
                            <div className="text-xs text-white/40 mt-1 flex items-center gap-1 justify-end">
                                {offersT?.finalPrice || 'Final Price'}
                                {isShippingIncluded && (
                                    <span className="text-green-400 ml-1">
                                        • {offersT?.shippingIncluded || 'Shipping Included'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px w-full bg-white/5 my-5" />

                {/* Details Grid - Enhanced with Translation & New Fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Condition */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.condition || 'Condition'}</span>
                            <span className="text-sm font-medium">{getConditionText(condition)}</span>
                        </div>
                    </div>

                    {/* Part Type */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                        <Tag size={16} className="text-purple-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.type || 'Type'}</span>
                            <span className="text-sm font-medium">
                                {offersT?.partTypes?.[(partType || 'Original').toLowerCase()] || partType || 'Original'}
                            </span>
                        </div>
                    </div>

                    {/* Warranty */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                        <ShieldCheck size={16} className="text-gold-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.warranty || 'Warranty'}</span>
                            <span className="text-sm font-medium">{getWarrantyText(warranty)}</span>
                        </div>
                    </div>

                    {/* Delivery */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                        <Truck size={16} className="text-green-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.delivery || 'Delivery'}</span>
                            <span className="text-sm font-medium">{getDeliveryText(deliveryTime)}</span>
                        </div>
                    </div>

                    {/* Part Price (New) */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                        <div className="text-yellow-400 font-bold shrink-0 text-lg">$</div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.unitPrice || 'Part Price'}</span>
                            <span className="text-sm font-medium">{(unitPrice || 0).toLocaleString()} AED</span>
                        </div>
                    </div>

                    {/* Weight (Optional) */}
                    {weight && weight > 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                            <Box size={16} className="text-orange-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{offersT?.labels?.weight || 'Weight'}</span>
                                <span className="text-sm font-medium">{weight} {offersT?.units?.kg || 'Kg'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vendor Notes (if any) */}
                {notes && (
                    <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <h4 className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                            {offersT?.labels?.notes || 'Vendor Notes'}
                        </h4>
                        <p className="text-sm text-white/80 leading-relaxed font-light">
                            {notes}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onChat}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex items-center gap-2"
                    >
                        <MessageSquare size={18} />
                        <span>Chat</span>
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold shadow-lg shadow-gold-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        <span>{(t.offers as any)?.accept || 'Accept Offer'}</span>
                    </button>
                </div>

                {/* Image Modal */}
                {isImageModalOpen && offerImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setIsImageModalOpen(false)}>
                        <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                            <X size={32} />
                        </button>
                        <img
                            src={offerImage}
                            alt="Offer Part Full"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </motion.div>
        </>
    );
};
