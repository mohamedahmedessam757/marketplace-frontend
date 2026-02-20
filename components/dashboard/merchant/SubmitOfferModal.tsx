
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, UploadCloud, Car, Settings, Loader2, Calculator, Info, Scale, ShieldCheck, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useChatStore } from '../../../stores/useChatStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useAdminStore } from '../../../stores/useAdminStore'; // Import AdminStore
import { useOrderStore } from '../../../stores/useOrderStore'; // Import for customerId
import { offersApi } from '../../../services/api/offers';
import { supabase } from '../../../services/supabase';

interface SubmitOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestDetails: {
        id: number;
        car: string;
        part: string;
        parts?: any[];
        vehicle?: any;
        vin?: string;
        date: string;
        createdAt?: string;
    } | null;
    onSubmit: (offerData: any) => void;
}

// Logic Types
type PartType = 'normal' | 'engine' | 'gearbox';

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({ isOpen, onClose, requestDetails, onSubmit }) => {
    const { t, language } = useLanguage();
    const { openChatForOrder } = useChatStore();
    const { addNotification } = useNotificationStore();
    const { systemConfig } = useAdminStore(); // Get Dynamic Config
    const { getOrder, addOfferToOrder } = useOrderStore();

    // Form State
    const [basePrice, setBasePrice] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [partType, setPartType] = useState<PartType>('normal');
    const [hasWarranty, setHasWarranty] = useState(false);
    const [warrantyDuration, setWarrantyDuration] = useState('month1');
    const [deliveryTime, setDeliveryTime] = useState('d1_3');
    const [condition, setCondition] = useState('used_clean');
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

    // Calculations State
    const [calculations, setCalculations] = useState({
        shipping: 0,
        subtotal: 0,
        commission: 0,
        finalPrice: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- BUSINESS LOGIC: Pricing Engine (DYNAMIC) ---
    useEffect(() => {
        const price = parseFloat(basePrice) || 0;
        const w = parseFloat(weight) || 0;
        let shippingCost = 0;

        // 1. Calculate Shipping based on Admin Config
        if (partType === 'engine') {
            shippingCost = 350; // Special Handling (Could also be in config later)
        } else if (partType === 'gearbox') {
            shippingCost = 250;
        } else {
            // Dynamic Rules from Admin Store
            const rules = systemConfig.logistics.shippingRules;
            const matchedRule = rules.find(r => w > r.minWeight && w <= r.maxWeight);

            if (matchedRule) {
                shippingCost = matchedRule.price;
            } else {
                // Fallback if weight exceeds max rule or is 0
                shippingCost = w > 0 ? systemConfig.logistics.baseShippingCost : 0;
            }
        }

        // 2. Calculate Commission (Dynamic Rate)
        const commissionRate = systemConfig.financial.commissionRate / 100;
        const subtotal = price + shippingCost;
        const commission = subtotal * commissionRate;
        const finalPrice = subtotal + commission;

        setCalculations({
            shipping: shippingCost,
            subtotal: subtotal,
            commission: commission,
            finalPrice: finalPrice
        });

    }, [basePrice, weight, partType, systemConfig]); // Depend on systemConfig

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('offer-attachments') // Ensure this bucket exists
                .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('offer-attachments')
                .getPublicUrl(fileName);

            setImageUrl(urlData.publicUrl);
            // toast.success('Image uploaded'); 
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!basePrice || (!weight && partType === 'normal')) return;

        setIsSubmitting(true);

        try {
            // 0. OPTIMISTIC UI UPDATE: Instant 0ms visual feedback
            if (requestDetails?.id) {
                addOfferToOrder(requestDetails.id, {
                    storeId: 'my-store-session', // Mocked currently
                    merchantName: 'My Store', // Replaced via auth/profile in future
                    storeRating: 5,
                    storeReviewCount: 0,
                    price: calculations.finalPrice,
                    unitPrice: parseFloat(basePrice),
                    shippingCost: calculations.shipping,
                    isShippingIncluded: calculations.shipping === 0,
                    condition,
                    warranty: hasWarranty ? warrantyDuration : 'No',
                    deliveryTime,
                    notes,
                    offerImage: imageUrl || undefined,
                    weight: parseFloat(weight || '0'),
                    partType
                });
            }

            // 1. Submit Offer Data to Backend
            await offersApi.create({
                orderId: requestDetails?.id,
                unitPrice: parseFloat(basePrice),
                weightKg: parseFloat(weight || '0'),
                partType,
                condition,
                hasWarranty,
                warrantyDuration: hasWarranty ? warrantyDuration : undefined,
                deliveryDays: deliveryTime,
                notes,
                offerImage: imageUrl || undefined
            });

            // 2. AUTO-OPEN CHAT LOGIC
            if (requestDetails) {
                openChatForOrder(requestDetails.id, 'My Store', requestDetails.part);

                const orderData = getOrder(requestDetails.id);

                if (orderData?.customer?.id) {
                    addNotification({
                        recipientId: orderData.customer.id,
                        recipientRole: 'CUSTOMER',
                        type: 'offer',
                        titleKey: 'newOffer',
                        message: language === 'ar'
                            ? `عرض سعر جديد: ${calculations.finalPrice.toLocaleString()} ريال لطلبك #${requestDetails.id}`
                            : `New Offer: ${calculations.finalPrice.toLocaleString()} SAR for Order #${requestDetails.id}`,
                        orderId: requestDetails.id,
                        linkTo: 'order-details',
                        priority: 'normal'
                    });
                }
            }

            onSubmit({}); // Close Modal/Callback

            // Reset form
            setBasePrice('');
            setWeight('');
            setPartType('normal');
            setHasWarranty(false);
            setNotes('');
            setImageUrl(null);

        } catch (error) {
            console.error('Offer submission failed:', error);
            alert('Failed to submit offer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAr = language === 'ar';

    if (!isOpen || !requestDetails) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#1A1814] border border-gold-500/20 rounded-2xl w-full max-w-5xl shadow-2xl relative flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto"
                >

                    {/* LEFT SIDE: Order Details & Live Calc (Visual Summary) */}
                    <div className="w-full lg:w-[40%] p-6 bg-white/5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden flex flex-col h-full lg:max-h-full overflow-y-auto">

                        {/* Order Info */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-gold-500/20 text-gold-400 text-xs font-mono px-2 py-1 rounded border border-gold-500/20">#{requestDetails.id}</span>
                                <span className="text-white/40 text-xs">{requestDetails.date}</span>
                            </div>

                            <div className="mb-3 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {requestDetails.parts && requestDetails.parts.length > 0 ? (
                                    requestDetails.parts.map((p: any, idx: number) => (
                                        <div key={idx} className="bg-white/5 p-2 rounded-lg space-y-2">
                                            <div>
                                                <div className="font-bold text-white text-sm">{p.name}</div>
                                                <div className="text-xs text-white/50 line-clamp-2">{p.description}</div>
                                            </div>

                                            {/* Media Thumbnails */}
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {p.images?.map((img: string | File, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="w-12 h-12 shrink-0 rounded bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-gold-500/50"
                                                        onClick={() => setActiveMedia({ type: 'image', url: typeof img === 'string' ? img : URL.createObjectURL(img) })}
                                                    >
                                                        <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {p.video && (
                                                    <div
                                                        className="w-12 h-12 shrink-0 rounded bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-gold-500/50 relative group"
                                                        onClick={() => setActiveMedia({ type: 'video', url: typeof p.video === 'string' ? p.video : URL.createObjectURL(p.video) })}
                                                    >
                                                        <video src={typeof p.video === 'string' ? p.video : URL.createObjectURL(p.video)} className="w-full h-full object-cover opacity-50" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <PlayCircle size={16} className="text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">{requestDetails.part}</h2>
                                )}
                            </div>

                            <p className="text-white/60 text-sm flex items-center gap-2">
                                <Car size={14} />
                                {requestDetails.vehicle ? `${requestDetails.vehicle.make} ${requestDetails.vehicle.model} ${requestDetails.vehicle.year}` : requestDetails.car}
                            </p>
                        </div>

                        {/* LIVE CALCULATOR CARD */}
                        <div className="bg-[#0F0E0C] rounded-xl border border-gold-500/30 p-5 relative overflow-hidden flex-1">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 to-gold-400" />

                            <div className="flex items-center gap-2 mb-6 text-gold-400">
                                <Calculator size={18} />
                                <h3 className="font-bold text-sm uppercase tracking-wider">{t.dashboard.merchant.offerModal.calc.title}</h3>
                            </div>

                            <div className="space-y-4 text-sm">
                                {/* Base Price */}
                                <div className="flex justify-between items-center text-white/60">
                                    <span>{t.dashboard.merchant.offerModal.calc.basePrice}</span>
                                    <span className="font-mono">{parseFloat(basePrice || '0').toLocaleString()} SAR</span>
                                </div>

                                {/* Shipping */}
                                <div className="flex justify-between items-center text-white/60">
                                    <span className="flex items-center gap-1">
                                        {t.dashboard.merchant.offerModal.calc.shipping}
                                        <span className="text-[10px] bg-white/10 px-1.5 rounded text-white/40">{partType === 'normal' ? `${weight || 0}kg` : partType}</span>
                                    </span>
                                    <span className="font-mono text-blue-400">+ {calculations.shipping.toLocaleString()} SAR</span>
                                </div>

                                {/* Subtotal */}
                                <div className="flex justify-between items-center text-white/40 text-xs pt-2 border-t border-white/5 border-dashed">
                                    <span>{t.dashboard.merchant.offerModal.calc.subtotal}</span>
                                    <span className="font-mono">{calculations.subtotal.toLocaleString()} SAR</span>
                                </div>

                                {/* Commission */}
                                <div className="flex justify-between items-center text-white/60">
                                    <span>{t.dashboard.merchant.offerModal.calc.commission} ({systemConfig.financial.commissionRate}%)</span>
                                    <span className="font-mono text-orange-400">+ {calculations.commission.toFixed(2)} SAR</span>
                                </div>

                                {/* FINAL TOTAL */}
                                <div className="pt-4 border-t border-white/10 mt-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-white text-sm">{t.dashboard.merchant.offerModal.calc.finalCustomerPrice}</span>
                                        <span className="font-bold text-2xl text-green-400 font-mono">{calculations.finalPrice.toLocaleString()} <span className="text-xs">SAR</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Merchant Net Label */}
                            <div className="mt-6 p-3 bg-gold-500/10 rounded-lg border border-gold-500/20 text-center">
                                <span className="block text-[10px] text-gold-300 uppercase tracking-wider mb-1">{t.dashboard.merchant.offerModal.calc.merchantNet}</span>
                                <span className="block text-xl font-bold text-white font-mono">{(parseFloat(basePrice || '0')).toLocaleString()} SAR</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 text-[10px] text-white/30">
                            <Info size={12} className="mt-0.5 shrink-0" />
                            <p>{t.dashboard.merchant.offerModal.calc.shippingNote}</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Offer Form */}
                    <div className="w-full lg:w-[60%] flex flex-col min-h-0 bg-[#1A1814] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">{t.dashboard.merchant.offerModal.yourOffer}</h3>
                            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">

                            {/* 1. Price & Type Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Price */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                        {t.dashboard.merchant.offerModal.priceLabel} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold-500">
                                            <span className="font-bold text-sm">SAR</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-lg focus:border-gold-500 outline-none transition-all placeholder-white/10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Part Type Selection */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                        {t.dashboard.merchant.offerModal.partTypeLabel}
                                    </label>
                                    <select
                                        value={partType}
                                        onChange={(e) => setPartType(e.target.value as PartType)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-gold-500 outline-none appearance-none"
                                    >
                                        <option value="normal" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.partTypes.normal}</option>
                                        <option value="engine" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.partTypes.engine}</option>
                                        <option value="gearbox" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.partTypes.gearbox}</option>
                                    </select>
                                </div>
                            </div>

                            {/* 2. Weight (Only if Normal Part) */}
                            <AnimatePresence>
                                {partType === 'normal' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                            {t.dashboard.merchant.offerModal.weightLabel} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required={partType === 'normal'}
                                                min="0.1"
                                                step="0.1"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono focus:border-gold-500 outline-none transition-all placeholder-white/10"
                                                placeholder="0.0"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/30 text-xs">
                                                {t.dashboard.merchant.offerModal.weightUnit}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="h-px bg-white/5 my-4" />

                            {/* 3. Specs Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Condition */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                        {t.dashboard.merchant.offerModal.conditionLabel}
                                    </label>
                                    <select
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-gold-500 outline-none appearance-none"
                                    >
                                        <option value="new" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.new}</option>
                                        <option value="used_clean" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.used_clean}</option>
                                        <option value="used_avg" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.used_avg}</option>
                                    </select>
                                </div>

                                {/* Delivery Time */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                        {t.dashboard.merchant.offerModal.deliveryTimeLabel}
                                    </label>
                                    <select
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-gold-500 outline-none appearance-none"
                                    >
                                        <option value="d1_3" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.deliveryTimes.d1_3}</option>
                                        <option value="d3_5" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.deliveryTimes.d3_5}</option>
                                        <option value="d5_7" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.deliveryTimes.d5_7}</option>
                                    </select>
                                </div>
                            </div>

                            {/* 4. Warranty Toggle & Duration */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={18} className={hasWarranty ? 'text-green-400' : 'text-white/30'} />
                                        <span className="text-sm font-bold text-white">{t.dashboard.merchant.offerModal.warrantyLabel}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHasWarranty(!hasWarranty)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${hasWarranty ? 'bg-green-500' : 'bg-white/20'}`}
                                    >
                                        <motion.div
                                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                                            animate={{ x: hasWarranty ? (isAr ? -24 : 24) : 0 }}
                                        />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {hasWarranty && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider mt-2">
                                                {t.dashboard.merchant.offerModal.warrantyDurationLabel}
                                            </label>
                                            <select
                                                value={warrantyDuration}
                                                onChange={(e) => setWarrantyDuration(e.target.value)}
                                                className="w-full bg-[#1A1814] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:border-green-500 outline-none appearance-none"
                                            >
                                                <option value="days3" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.warranties.days3}</option>
                                                <option value="month1" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.warranties.month1}</option>
                                                <option value="month3" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.warranties.month3}</option>
                                                <option value="month6" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.warranties.month6}</option>
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 5. Notes */}
                            <div>
                                <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                    {t.dashboard.merchant.offerModal.notesLabel}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-gold-500 outline-none resize-none placeholder-white/20"
                                    placeholder="..."
                                />
                            </div>

                            {/* 6. Image Upload */}
                            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-white/30 hover:bg-white/5 hover:border-gold-500/30 cursor-pointer transition-all group overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {uploading ? (
                                    <Loader2 className="animate-spin text-gold-500" />
                                ) : imageUrl ? (
                                    <div className="relative w-full h-32">
                                        <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Click to Change</div>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="mb-2 group-hover:text-gold-400 transition-colors" />
                                        <span className="text-xs font-bold">{t.dashboard.merchant.offerModal.uploadLabel}</span>
                                    </>
                                )}
                            </div>
                            {/* 7. Action Buttons (Moved inside form for guaranteed scrolling) */}
                            <div className="pt-4 mt-4 border-t border-white/10 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                                >
                                    {t.dashboard.merchant.offerModal.cancel}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !basePrice || (!weight && partType === 'normal')}
                                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white font-bold text-sm shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <DollarSign size={16} />
                                            {t.dashboard.merchant.offerModal.submit}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                </motion.div>
            </motion.div>
            {/* Lightbox Overlay */}
            {
                activeMedia && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setActiveMedia(null)}
                    >
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                            {activeMedia.type === 'video' ? (
                                <video
                                    src={activeMedia.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[85vh] rounded-lg border border-gold-500/20 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <img
                                    src={activeMedia.url}
                                    alt="Full View"
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg border border-gold-500/20 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}
                            <button
                                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                onClick={() => setActiveMedia(null)}
                            >
                                {t.common.close || (isAr ? "إغلاق" : "Close")}
                            </button>
                        </div>
                    </div>
                )
            }
        </AnimatePresence >
    );
};
