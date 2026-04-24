
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, UploadCloud, Car, Settings, Loader2, Calculator, Info, Scale, ShieldCheck, PlayCircle, AlertCircle, Check, Package, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderChatStore } from '../../../stores/useOrderChatStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useVendorStore } from '../../../stores/useVendorStore';
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
        offers?: any[];
    } | null;
    existingOffers?: any[];  // Merchant's existing offers for this order (from API)
    onSubmit: (offerData: any) => void;
}

// Logic Types
type PartType = string; // Dynamic from systemConfig.logistics.shipmentTypes

interface PartFormData {
    basePrice: string;
    weight: string;
    partType: PartType;
    hasWarranty: boolean;
    warrantyDuration: string;
    deliveryTime: string;
    condition: string;
    notes: string;
    imageUrl: string | null;
}

const DEFAULT_FORM: PartFormData = {
    basePrice: '',
    weight: '',
    partType: 'standard',
    hasWarranty: false,
    warrantyDuration: 'month1',
    deliveryTime: 'd1_3',
    condition: 'used_clean',
    notes: '',
    imageUrl: null,
};

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({ isOpen, onClose, requestDetails, existingOffers = [], onSubmit }) => {
    const { t, language } = useLanguage();
    const { fetchChat } = useOrderChatStore();
    const { addNotification } = useNotificationStore();
    const { systemConfig, fetchPublicConfig } = useAdminStore();
    const { getOrder, addOfferToOrder } = useOrderStore();
    const { storeId } = useVendorStore();

    const isAr = language === 'ar';
    const parts = requestDetails?.parts || [];
    const isMultiPart = parts.length > 1;

    // --- Per-Part State ---
    const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());
    const [activePartId, setActivePartId] = useState<string | null>(null);
    const [formDataMap, setFormDataMap] = useState<Record<string, PartFormData>>({});

    // UI State
    const [uploading, setUploading] = useState(false);
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);
    const [submitProgress, setSubmitProgress] = useState<{ current: number; total: number } | null>(null);
    const [customWarranties, setCustomWarranties] = useState<Record<string, string>>({}); // NEW for custom free text warranty

    // Build a map of existing offers by partId for quick lookup
    const existingOfferMap = useMemo(() => {
        const map = new Map<string, any>();
        existingOffers.forEach((o: any) => {
            const partId = o.orderPartId || o.order_part_id;
            if (partId) map.set(partId, o);
        });
        return map;
    }, [existingOffers]);

    // Map partId -> check if awarded to ANOTHER merchant
    const awardedToOthersMap = useMemo(() => {
        const map = new Map<string, boolean>();
        if (parts && requestDetails?.offers) {
            parts.forEach((p: any) => {
                const isAwardedToOther = requestDetails.offers!.some((of: any) => 
                    (of.orderPartId === p.id || of.order_part_id === p.id) && 
                    of.status === 'accepted' && 
                    String(of.storeId) !== String(storeId)
                );
                map.set(p.id, isAwardedToOther);
            });
        }
        return map;
    }, [parts, requestDetails?.offers, storeId]);

    // Initialize: auto-select single part or reset for multi-part
    // If existingOffers exist, pre-fill form data from them
    useEffect(() => {
        if (!isOpen || !requestDetails) return;
        
        fetchPublicConfig(); // 2026 Real-time logistics sync

        const buildFormFromOffer = (offer: any): PartFormData => ({
            basePrice: offer.unitPrice?.toString() || offer.unit_price?.toString() || '',
            weight: offer.weightKg?.toString() || offer.weight_kg?.toString() || '',
            partType: offer.partType || offer.part_type || 'normal',
            hasWarranty: offer.hasWarranty ?? offer.has_warranty ?? false,
            warrantyDuration: offer.warrantyDuration || offer.warranty_duration || 'month1',
            deliveryTime: offer.deliveryDays || offer.delivery_days || 'd1_3',
            condition: offer.condition || 'used_clean',
            notes: offer.notes || '',
            imageUrl: offer.offerImage || offer.offer_image || null,
        });

        if (parts.length === 1) {
            const partId = parts[0].id || 'single';
            const existingOffer = existingOfferMap.get(partId);
            setSelectedPartIds(new Set([partId]));
            setActivePartId(partId);
            setFormDataMap({ [partId]: existingOffer ? buildFormFromOffer(existingOffer) : { ...DEFAULT_FORM } });
        } else if (parts.length > 1) {
            const preSelectedIds = new Set<string>();
            const map: Record<string, PartFormData> = {};
            parts.forEach((p: any) => {
                const existingOffer = existingOfferMap.get(p.id);
                // We use existingOffer to know it's locked, but we don't prefill or select it 
                // because editing requires cancellation first in 2026 UX.
                map[p.id] = { ...DEFAULT_FORM };
            });
            // Auto-select first available part that:
            // 1. the merchant has NO existing offer on
            // 2. is not awarded to someone else
            const availableParts = parts.filter((p: any) => !existingOfferMap.has(p.id) && !awardedToOthersMap.get(p.id));
            if (availableParts.length > 0) {
                preSelectedIds.add(availableParts[0].id);
            }
            setSelectedPartIds(preSelectedIds);
            setActivePartId(preSelectedIds.size > 0 ? Array.from(preSelectedIds)[0] : null);
            setFormDataMap(map);
        } else {
            const partId = 'legacy';
            const existingOffer = existingOffers.length > 0 ? existingOffers[0] : null;
            setSelectedPartIds(new Set([partId]));
            setActivePartId(partId);
            setFormDataMap({ [partId]: existingOffer ? buildFormFromOffer(existingOffer) : { ...DEFAULT_FORM } });
        }
    }, [isOpen, requestDetails?.id, existingOfferMap, fetchPublicConfig]);

    // Get active form data
    const activeForm = activePartId ? (formDataMap[activePartId] || DEFAULT_FORM) : DEFAULT_FORM;

    // Update a field in the active form
    const updateField = useCallback(<K extends keyof PartFormData>(field: K, value: PartFormData[K]) => {
        if (!activePartId) return;
        setFormDataMap(prev => ({
            ...prev,
            [activePartId]: { ...prev[activePartId], [field]: value }
        }));
        if (error) setError(null);
    }, [activePartId, error]);

    // Shared Calculation Logic for 2026 Resiliency
    const getQuoteCalculations = useCallback((basePriceStr: string, weightStr: string, partType: string) => {
        const price = parseFloat(basePriceStr) || 0;
        const w = parseFloat(weightStr) || 0;
        
        const shipmentType = systemConfig.logistics.shipmentTypes?.find((t: any) => t.id === partType) 
                          || systemConfig.logistics.shipmentTypes?.find((t: any) => t.id === 'standard');

        let shippingCost = 0;
        if (shipmentType) {
            shippingCost = shipmentType.basePrice || 0;
            if (shipmentType.isWeightBound && w > 0) {
                const brackets = shipmentType.weightBrackets || [];
                const bracket = brackets.find((b: any) => w >= b.minWeight && w <= b.maxWeight);
                if (bracket) {
                    shippingCost += bracket.price || 0;
                } else if (brackets.length > 0) {
                    const sorted = [...brackets].sort((a, b) => b.maxWeight - a.maxWeight);
                    if (w > sorted[0].maxWeight) {
                        shippingCost += sorted[0].price || 0;
                    }
                }
            }
        }

        const subtotal = price + shippingCost;
        const rate = (systemConfig.financial?.commissionRate || 25) / 100;
        const minComm = systemConfig.financial?.minCommission || 100;
        const percentCommission = Math.round(price * rate);
        const commission = price > 0 ? Math.max(percentCommission, minComm) : 0;
        const finalPrice = subtotal + commission;

        return { 
            shipping: shippingCost, 
            subtotal, 
            commission, 
            finalPrice,
            merchantEarnings: price 
        };
    }, [systemConfig]);

    // --- Calculations for active part (UI Preview) ---
    const calculations = useMemo(() => {
        return getQuoteCalculations(activeForm.basePrice, activeForm.weight, activeForm.partType);
    }, [activeForm.basePrice, activeForm.weight, activeForm.partType, getQuoteCalculations]);

    // Toggle part selection
    const togglePart = (partId: string) => {
        if (awardedToOthersMap.get(partId)) return; // Prevent selecting awarded parts
        if (existingOfferMap.has(partId)) return; // Prevent selecting parts we already bid on (Lock feature)

        setSelectedPartIds(prev => {
            const next = new Set(prev);
            if (next.has(partId)) {
                next.delete(partId);
                if (activePartId === partId) {
                    setActivePartId(next.size > 0 ? Array.from(next)[0] : null);
                }
            } else {
                next.add(partId);
                if (!activePartId) setActivePartId(partId);
            }
            return next;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !activePartId) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('offer-attachments')
                .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('offer-attachments')
                .getPublicUrl(fileName);

            updateField('imageUrl', urlData.publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(isAr ? 'فشل رفع الصورة. حاول مرة أخرى.' : 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const triggerError = (msg: string) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedPartIds.size === 0) {
            triggerError(isAr ? 'يرجى اختيار قطعة واحدة على الأقل' : 'Please select at least one part');
            return;
        }

        // Validate all selected parts
        for (const partId of selectedPartIds) {
            const form = formDataMap[partId];
            if (!form?.basePrice) {
                const partName = parts.find((p: any) => p.id === partId)?.name || requestDetails?.part || '';
                triggerError(isAr ? `أدخل سعر القطعة: ${partName}` : `Enter price for: ${partName}`);
                setActivePartId(partId);
                return;
            }
            if (!form.weight && form.partType === 'normal') {
                const partName = parts.find((p: any) => p.id === partId)?.name || requestDetails?.part || '';
                triggerError(isAr ? `أدخل وزن القطعة: ${partName}` : `Enter weight for: ${partName}`);
                setActivePartId(partId);
                return;
            }
            if (!form.imageUrl) {
                const partName = parts.find((p: any) => p.id === partId)?.name || requestDetails?.part || '';
                triggerError(isAr ? `يرجى رفع صورة للقطعة: ${partName}` : `Please upload an image for: ${partName}`);
                setActivePartId(partId);
                return;
            }
        }

        setIsSubmitting(true);
        const selectedParts = Array.from(selectedPartIds);
        setSubmitProgress({ current: 0, total: selectedParts.length });

        try {
            let lastStoreId = '';
            for (let i = 0; i < selectedParts.length; i++) {
                const partId = selectedParts[i];
                const form = formDataMap[partId];
                const part = parts.find((p: any) => p.id === partId);

                // Calculate per-part pricing
                // Dynamic calculation using shared logic (2026 Standard)
                const { shipping: shippingCost, finalPrice, merchantEarnings: price, weightKg: w } = {
                    ...getQuoteCalculations(form.basePrice, form.weight, form.partType),
                    weightKg: parseFloat(form.weight) || 0
                };

                // Determine if this is an update or a new offer
                const existingOffer = existingOfferMap.get(partId);

                // Editable fields (shared between create and update)
                const editableFields = {
                    unitPrice: price,
                    weightKg: w,
                    partType: form.partType,
                    condition: form.condition,
                    hasWarranty: form.hasWarranty,
                    warrantyDuration: form.hasWarranty 
                        ? (form.warrantyDuration === 'custom' ? customWarranties[partId] : form.warrantyDuration) 
                        : undefined,
                    deliveryDays: form.deliveryTime,
                    notes: form.notes,
                    offerImage: form.imageUrl || undefined,
                    shippingCost,
                };

                // CREATE — Always create new (Edit is locked, requires cancel first)
                let resultData = await offersApi.create({
                    ...editableFields,
                    orderId: String(requestDetails?.id),
                    orderPartId: partId !== 'legacy' && partId !== 'single' ? partId : undefined,
                });

                // Optimistic UI Update
                if (requestDetails?.id) {
                    addOfferToOrder(requestDetails.id, {
                        storeId: resultData?.store?.id || resultData?.storeId || 'my-store-session',
                        offerNumber: resultData?.offerNumber || '---',
                        storeCode: resultData?.store?.storeCode || resultData?.storeCode || '---',
                        submittedAt: resultData?.createdAt || new Date().toISOString(),
                        merchantName: resultData?.store?.name || 'My Store',
                        storeRating: 5,
                        storeReviewCount: 0,
                        price: finalPrice,
                        unitPrice: price,
                        shippingCost,
                        isShippingIncluded: shippingCost === 0,
                        condition: form.condition,
                        warranty: form.hasWarranty ? form.warrantyDuration : 'No',
                        deliveryTime: form.deliveryTime,
                        notes: form.notes,
                        offerImage: form.imageUrl || undefined,
                        weight: w,
                        partType: form.partType,
                        orderPartId: partId !== 'legacy' && partId !== 'single' ? String(partId) : undefined,
                        partName: part?.name || requestDetails?.part,
                    });
                }

                setSubmitProgress({ current: i + 1, total: selectedParts.length });
                // Track storeId from last submission for chat init
                if (resultData?.store?.id || resultData?.storeId) {
                    lastStoreId = resultData?.store?.id || resultData?.storeId;
                }
            }

            // Notifications
            if (requestDetails) {
                const orderData = getOrder(requestDetails.id);
                if (orderData?.customer?.id) {
                    addNotification({
                        recipientId: orderData.customer.id,
                        recipientRole: 'CUSTOMER',
                        type: 'offer',
                        titleKey: 'newOffer',
                        message: isAr
                            ? `عرض سعر جديد على ${selectedParts.length > 1 ? `${selectedParts.length} قطع` : 'قطعة'} من طلبك #${requestDetails.id}`
                            : `New offer on ${selectedParts.length > 1 ? `${selectedParts.length} parts` : '1 part'} for Order #${requestDetails.id}`,
                        orderId: requestDetails.id,
                        linkTo: 'order-details',
                        priority: 'normal'
                    });
                }
            }

            onSubmit({});

            // Reset all form state
            setFormDataMap({});
            setSelectedPartIds(new Set());
            setActivePartId(null);
            setError(null);
            setSubmitProgress(null);

        } catch (err: any) {
            console.error('Offer submission failed:', err);
            const apiMsg = err?.response?.data?.message;
            triggerError(apiMsg || (isAr ? 'فشل إرسال العرض. حاول مرة أخرى.' : 'Failed to submit offer. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getActivePartName = (): string => {
        if (!activePartId) return '';
        if (activePartId === 'legacy' || activePartId === 'single') return requestDetails?.part || '';
        return parts.find((p: any) => p.id === activePartId)?.name || '';
    };

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
                    className="bg-[#1A1814] border border-gold-500/20 rounded-2xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                >

                    {/* ====== PART SELECTION BAR (Multi-Part Only) ====== */}
                    {isMultiPart && (
                        <div className="border-b border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Package size={16} className="text-gold-400" />
                                    {isAr ? 'اختر القطع للعرض عليها' : 'Select Parts to Bid On'}
                                </h3>
                                <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {parts.map((p: any) => {
                                    const isSelected = selectedPartIds.has(p.id);
                                    const isActive = activePartId === p.id;
                                    const hasExistingOffer = existingOfferMap.has(p.id);
                                    const isAwardedToOther = awardedToOthersMap.get(p.id);

                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={isAwardedToOther || hasExistingOffer}
                                            onClick={() => {
                                                if (isAwardedToOther || hasExistingOffer) return;
                                                togglePart(p.id);
                                                if (!isSelected) setActivePartId(p.id);
                                                else if (isActive && selectedPartIds.size > 1) {
                                                    const remaining = Array.from(selectedPartIds).filter(id => id !== p.id);
                                                    setActivePartId(remaining[0]);
                                                }
                                            }}
                                            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                                                isAwardedToOther
                                                    ? 'bg-red-500/5 border-red-500/10 text-red-400/50 cursor-not-allowed opacity-60'
                                                : hasExistingOffer
                                                    ? 'bg-green-500/5 border-green-500/20 text-green-400/60 cursor-not-allowed opacity-75'
                                                : isSelected
                                                    ? (isActive
                                                        ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 ring-2 ring-gold-500/30'
                                                        : 'bg-gold-500/10 border-gold-500/30 text-gold-400')
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                isAwardedToOther ? 'bg-red-500/10 border-red-500/30' 
                                                : hasExistingOffer ? 'bg-green-500/10 border-green-500/30' 
                                                : isSelected ? 'bg-gold-500 border-gold-500' 
                                                : 'border-white/20'
                                            }`}>
                                                {isAwardedToOther ? <AlertCircle size={12} className="text-red-400" /> : isSelected ? <Check size={12} className="text-black" /> : hasExistingOffer ? <CheckCircle2 size={12} className="text-green-400" /> : null}
                                            </div>
                                            {p.images?.[0] && (
                                                <img
                                                    src={typeof p.images[0] === 'string' ? p.images[0] : URL.createObjectURL(p.images[0])}
                                                    className={`w-6 h-6 rounded object-cover ${isAwardedToOther ? 'grayscale' : ''}`}
                                                    alt=""
                                                />
                                            )}
                                            <span className="truncate max-w-[120px]">{p.name}</span>
                                            {isAwardedToOther ? (
                                                <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20 whitespace-nowrap">
                                                    {isAr ? 'تم الاختيار' : 'Sold'}
                                                </span>
                                            ) : hasExistingOffer && (
                                                <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20 whitespace-nowrap">
                                                    {isAr ? 'عرض مقدم' : 'Offered'}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Part Tabs for switching */}
                            {selectedPartIds.size > 1 && (
                                <div className="flex gap-1 mt-3 border-t border-white/5 pt-3">
                                    {Array.from(selectedPartIds).map((partId) => {
                                        const part = parts.find((p: any) => p.id === partId);
                                        const isActive = activePartId === partId;
                                        const form = formDataMap[partId];
                                        const hasData = form?.basePrice;
                                        return (
                                            <button
                                                key={partId}
                                                type="button"
                                                onClick={() => setActivePartId(partId)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive
                                                    ? 'bg-gold-500 text-black'
                                                    : hasData
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-white/5 text-white/50 hover:text-white/70'
                                                    }`}
                                            >
                                                {hasData && !isActive && <Check size={10} />}
                                                {part?.name || partId}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====== MAIN CONTENT ====== */}
                    {activePartId && selectedPartIds.size > 0 ? (
                        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                            {/* LEFT SIDE: Order Details & Live Calc */}
                            <div className="w-full lg:w-[45%] p-6 bg-white/5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">

                                {/* Active Part Name Header */}
                                <div className="mb-4 px-3 py-2.5 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                                    <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
                                        <Package size={14} />
                                        {isAr ? 'تقديم عرض على' : 'Bidding On'}
                                    </div>
                                    <div className="text-white font-bold text-base">{getActivePartName()}</div>
                                </div>

                                {/* Order Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-gold-500/20 text-gold-400 text-xs font-mono px-2 py-1 rounded border border-gold-500/20">#{requestDetails.id}</span>
                                        <span className="text-white/40 text-xs">{requestDetails.date}</span>
                                    </div>

                                    {/* Show current part media only */}
                                    {(() => {
                                        const activePart = parts.find((p: any) => p.id === activePartId);
                                        if (!activePart) {
                                            return <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">{requestDetails.part}</h2>;
                                        }
                                        return (
                                            <div className="bg-white/5 p-3 rounded-lg space-y-2">
                                                <div className="text-xs text-white/50 line-clamp-2">{activePart.description}</div>
                                                <div className="flex gap-2 overflow-x-auto pb-1">
                                                    {activePart.images?.map((img: string | File, i: number) => (
                                                        <div
                                                            key={i}
                                                            className="w-12 h-12 shrink-0 rounded bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-gold-500/50"
                                                            onClick={() => setActiveMedia({ type: 'image', url: typeof img === 'string' ? img : URL.createObjectURL(img) })}
                                                        >
                                                            <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    {activePart.video && (
                                                        <div
                                                            className="w-12 h-12 shrink-0 rounded bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-gold-500/50 relative group"
                                                            onClick={() => setActiveMedia({ type: 'video', url: typeof activePart.video === 'string' ? activePart.video : URL.createObjectURL(activePart.video) })}
                                                        >
                                                            <video src={typeof activePart.video === 'string' ? activePart.video : URL.createObjectURL(activePart.video)} className="w-full h-full object-cover opacity-50" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <PlayCircle size={16} className="text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <p className="text-white/60 text-sm flex items-center gap-2 mt-3">
                                        <Car size={14} />
                                        {requestDetails.vehicle ? `${requestDetails.vehicle.make} ${requestDetails.vehicle.model} ${requestDetails.vehicle.year}` : requestDetails.car}
                                    </p>
                                </div>

                                {/* LIVE CALCULATOR CARD */}
                                <div className="bg-[#0F0E0C] rounded-xl border border-gold-500/30 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 to-gold-400" />

                                    <div className="flex items-center gap-2 mb-6 text-gold-400">
                                        <Calculator size={18} />
                                        <h3 className="font-bold text-sm uppercase tracking-wider">{t.dashboard.merchant.offerModal.calc.title}</h3>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        {/* Display ONLY crucial items per user request */}
                                        <div className="flex justify-between items-center text-white/80 font-medium">
                                            <span>{t.dashboard.merchant.offerModal.calc.merchantNet}</span>
                                            <span className="font-mono text-lg text-white">{(parseFloat(activeForm.basePrice || '0')).toLocaleString()} AED</span>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 mt-2">
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-white text-sm">{t.dashboard.merchant.offerModal.calc.finalCustomerPrice}</span>
                                                <span className="font-bold text-2xl text-green-400 font-mono">{calculations.finalPrice.toLocaleString()} <span className="text-xs">AED</span></span>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                            {/* RIGHT SIDE: Offer Form */}
                            <div className="w-full lg:w-[55%] flex flex-col min-h-0 bg-[#1A1814] overflow-y-auto">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">{t.dashboard.merchant.offerModal.yourOffer}</h3>
                                    {!isMultiPart && <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>}
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">

                                    {/* 1. Price & Type Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                                {t.dashboard.merchant.offerModal.priceLabel} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold-500">
                                                    <span className="font-bold text-sm">AED</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={activeForm.basePrice}
                                                    onChange={(e) => updateField('basePrice', e.target.value)}
                                                    className={`w-full bg-black/40 border rounded-xl py-3 pl-12 pr-4 text-white font-bold text-lg outline-none transition-all placeholder-white/10 ${error && !activeForm.basePrice ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500'}`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                                {t.dashboard.merchant.offerModal.partTypeLabel}
                                            </label>
                                            <select
                                                value={activeForm.partType}
                                                onChange={(e) => updateField('partType', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-gold-500 outline-none appearance-none"
                                            >
                                                {(systemConfig.logistics?.shipmentTypes || []).map((type: any) => (
                                                    <option key={type.id} value={type.id} className="bg-[#1A1814]">
                                                        {isAr ? type.nameAr : type.nameEn}
                                                    </option>
                                                ))}
                                                {(!systemConfig.logistics?.shipmentTypes || systemConfig.logistics.shipmentTypes.length === 0) && (
                                                    <>
                                                        <option value="standard" className="bg-[#1A1814]">{isAr ? 'شحن قياسي' : 'Standard Shipping'}</option>
                                                        <option value="engine" className="bg-[#1A1814]">{isAr ? 'شحن ماكينة' : 'Engine'}</option>
                                                        <option value="gearbox" className="bg-[#1A1814]">{isAr ? 'شحن جيربوكس' : 'Gearbox'}</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 2. Weight */}
                                    <AnimatePresence>
                                        {(() => {
                                            const activeType = systemConfig.logistics?.shipmentTypes?.find((t: any) => t.id === activeForm.partType);
                                            if (!activeType?.isWeightBound) return null;
                                            
                                            return (
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
                                                            required
                                                            min="0.1"
                                                            step="0.1"
                                                            value={activeForm.weight}
                                                            onChange={(e) => updateField('weight', e.target.value)}
                                                            className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white font-mono outline-none transition-all placeholder-white/10 ${error && !activeForm.weight ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500'}`}
                                                            placeholder="0.0"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/30 text-xs">
                                                            {t.dashboard.merchant.offerModal.weightUnit}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </AnimatePresence>

                                    <div className="h-px bg-white/5 my-4" />

                                    {/* 3. Specs Row */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                                                {t.dashboard.merchant.offerModal.conditionLabel}
                                            </label>
                                            <select
                                                value={activeForm.condition}
                                                onChange={(e) => updateField('condition', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-gold-500 outline-none appearance-none"
                                            >
                                                <option value="new" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.new}</option>
                                                <option value="used_clean" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.used_clean}</option>
                                                <option value="used_avg" className="bg-[#1A1814]">{t.dashboard.merchant.offerModal.conditions.used_avg}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 4. Warranty */}
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={18} className={activeForm.hasWarranty ? 'text-green-400' : 'text-white/30'} />
                                                <span className="text-sm font-bold text-white">{t.dashboard.merchant.offerModal.warrantyLabel}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateField('hasWarranty', !activeForm.hasWarranty)}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${activeForm.hasWarranty ? 'bg-green-500' : 'bg-white/20'}`}
                                            >
                                                <motion.div
                                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                    animate={{ x: activeForm.hasWarranty ? (isAr ? -24 : 24) : 0 }}
                                                />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {activeForm.hasWarranty && (
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
                                                        value={activeForm.warrantyDuration}
                                                        onChange={(e) => updateField('warrantyDuration', e.target.value)}
                                                        className="w-full bg-[#1A1814] border border-white/10 rounded-lg py-3 px-3 text-white text-sm focus:border-green-500 outline-none"
                                                    >
                                                        <option value="15days" className="bg-[#1A1814]">{isAr ? '15 يوم' : '15 Days'}</option>
                                                        <option value="1month" className="bg-[#1A1814]">{isAr ? 'شهر' : '1 Month'}</option>
                                                        <option value="3months" className="bg-[#1A1814]">{isAr ? '3 أشهر' : '3 Months'}</option>
                                                        <option value="12months" className="bg-[#1A1814]">{isAr ? '12 شهر' : '12 Months'}</option>
                                                        <option value="custom" className="bg-[#1A1814]">{isAr ? 'إدخال مدة مخصصة...' : 'Enter Custom Duration...'}</option>
                                                    </select>

                                                    {/* Custom Warranty Input */}
                                                    {activeForm.warrantyDuration === 'custom' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                placeholder={isAr ? 'مثال: 45 يوم أو شهرين' : 'e.g., 45 days or 2 months'}
                                                                value={customWarranties[activePartId!] || ''}
                                                                onChange={(e) => setCustomWarranties(prev => ({ ...prev, [activePartId!]: e.target.value }))}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-gold-500 outline-none placeholder-white/20"
                                                            />
                                                        </motion.div>
                                                    )}
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
                                            value={activeForm.notes}
                                            onChange={(e) => updateField('notes', e.target.value)}
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-gold-500 outline-none resize-none placeholder-white/20"
                                            placeholder="..."
                                        />
                                    </div>

                                    {/* 6. Image Upload */}
                                    <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-white/30 hover:bg-white/5 cursor-pointer transition-all group overflow-hidden ${error && !activeForm.imageUrl ? 'border-red-500 ring-2 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 hover:border-gold-500/30'}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {uploading ? (
                                            <Loader2 className="animate-spin text-gold-500" />
                                        ) : activeForm.imageUrl ? (
                                            <div className="relative w-full h-32">
                                                <img src={activeForm.imageUrl} alt="Uploaded" className="w-full h-full object-contain rounded-lg" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                                    {isAr ? 'اضغط لتغيير' : 'Click to Change'}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud size={24} className="mb-2 group-hover:text-gold-400 transition-colors" />
                                                <span className="text-xs font-bold">{t.dashboard.merchant.offerModal.uploadLabel}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm justify-center"
                                            >
                                                <AlertCircle size={16} />
                                                <span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit Progress */}
                                    {submitProgress && (
                                        <div className="mt-2 p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                                            <div className="flex justify-between items-center text-xs text-gold-300 mb-2">
                                                <span>{isAr ? 'جاري إرسال العروض...' : 'Submitting offers...'}</span>
                                                <span className="font-mono">{submitProgress.current}/{submitProgress.total}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gold-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
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
                                            disabled={isSubmitting}
                                            className={`flex-[2] py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white font-bold text-sm shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <DollarSign size={16} />
                                                    {t.dashboard.merchant.offerModal.submit}
                                                    {selectedPartIds.size > 1 && (
                                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono">{selectedPartIds.size}</span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* No part selected message */
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <Package size={48} className="text-white/20 mb-4" />
                            <p className="text-white/40 text-sm">
                                {isAr ? 'اختر قطعة واحدة على الأقل من القائمة أعلاه للبدء' : 'Select at least one part from the list above to start'}
                            </p>
                        </div>
                    )}

                </motion.div>
            </motion.div>

            {/* Lightbox Overlay */}
            {activeMedia && (
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
            )}
        </AnimatePresence>
    );
};
