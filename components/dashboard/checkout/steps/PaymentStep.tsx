import React, { useState, useMemo } from 'react';
import { CreditCardInput } from '../CreditCardInput';
import { useCheckoutStore } from '../../../../stores/useCheckoutStore';
import { useOrderStore } from '../../../../stores/useOrderStore';
import { useBillingStore } from '../../../../stores/useBillingStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { CheckCircle, AlertTriangle, Package, Loader2, ChevronDown, ChevronUp, Copy, CheckCircle2, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardState {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

interface CardErrors {
  number?: string;
  expiry?: string;
  cvv?: string;
  holder?: string;
}

export const PaymentStep: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const tPay = t.dashboard.checkout.payment;
  const tFR = t.dashboard.checkout.finalReview;

  const { orderId, processPayment, isProcessing, paidOfferIds, paymentError, clearPaymentError } = useCheckoutStore();
  const { orders } = useOrderStore();

  // Find the current order and its accepted offers
  const currentOrder = useMemo(() => {
    return orders.find(o => String(o.id) === String(orderId));
  }, [orders, orderId]);

  const requiredPartsArray = currentOrder?.parts || [];

  const acceptedOffers = useMemo(() => {
    if (!currentOrder?.offers) return [];
    return currentOrder.offers.filter((o: any) => o.status === 'accepted');
  }, [currentOrder]);

  // Card state
  const [card, setCard] = useState<CardState>({ number: '', expiry: '', cvv: '', holder: '' });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { cards, fetchCards, addCard } = useBillingStore();
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);

  React.useEffect(() => {
    fetchCards();
  }, []);

  // Calculate commission (same as backend — internal only, not shown to customer)
  const calcCommission = (unitPrice: number): number => {
    const percent = Math.round(unitPrice * 0.25);
    return unitPrice > 0 ? Math.max(percent, 100) : 0;
  };

  const formatCondition = (cond: string) => {
    if (!cond || cond === '---') return '---';
    const c = cond.toLowerCase();
    if (c.includes('clean')) return isAr ? 'مستعمل - نظيف' : 'Used - Clean';
    if (c === 'new') return isAr ? 'جديد' : 'New';
    if (c === 'used') return isAr ? 'مستعمل' : 'Used';
    return cond;
  };

  const formatWarranty = (w: string) => {
    if (!w || w === 'no' || w === 'none') return tFR.noWarranty;
    const clean = w.toLowerCase().replace(/\s+/g, '');
    if (clean === 'd15' || clean === '15days') return isAr ? '15 يوم' : '15 Days';
    if (clean === 'month1' || clean === '1month' || clean === '1months') return isAr ? 'شهر واحد' : '1 Month';
    if (clean === 'month3' || clean === '3month' || clean === '3months') return isAr ? '3 أشهر' : '3 Months';
    if (clean === 'month6' || clean === '6month' || clean === '6months') return isAr ? '6 أشهر' : '6 Months';
    if (clean === 'year1' || clean === '1year' || clean === '1years') return isAr ? 'سنة واحدة' : '1 Year';
    
    const num = w.match(/\d+/)?.[0];
    if (num) {
      if (w.includes('day')) return isAr ? `${num} يوم` : `${num} Days`;
      if (w.includes('month')) {
        const n = parseInt(num);
        if (isAr) {
          if (n === 1) return 'شهر واحد';
          if (n === 2) return 'شهران';
          if (n >= 3 && n <= 10) return `${n} أشهر`;
          return `${n} شهر`;
        }
        return `${num} Month${n > 1 ? 's' : ''}`;
      }
      if (w.includes('year')) return isAr ? `${num} سنة` : `${num} Year${parseInt(num) > 1 ? 's' : ''}`;
    }
    return w;
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Validate card
  const validateCard = (): boolean => {
    if (selectedSavedCard) return true;

    const errors: CardErrors = {};
    const cleanNumber = card.number.replace(/\s/g, '');

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      errors.number = isAr ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
    }
    if (!card.expiry || card.expiry.length < 5) {
      errors.expiry = isAr ? 'تاريخ الانتهاء مطلوب' : 'Expiry date required';
    } else {
      const [mm] = card.expiry.split('/');
      const month = parseInt(mm);
      if (month < 1 || month > 12) {
        errors.expiry = isAr ? 'شهر غير صالح' : 'Invalid month';
      }
    }
    if (!card.cvv || card.cvv.length < 3) {
      errors.cvv = isAr ? 'رمز الأمان مطلوب' : 'CVV required';
    }
    if (!card.holder || card.holder.trim().length < 3) {
      errors.holder = isAr ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name required';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment
  const handlePay = async (offerId: string) => {
    if (!validateCard()) return;
    clearPaymentError();
    setSuccessMessage(null);
    setSelectedOfferId(offerId);

    let paymentData: any;

    if (selectedSavedCard) {
      const savedCard = cards.find(c => c.id === selectedSavedCard);
      paymentData = {
        number: `424242424242${savedCard?.last4 || '4242'}`,
        expiry: `${savedCard?.expiryMonth || '12'}/${savedCard?.expiryYear?.toString().slice(-2) || '30'}`,
        cvv: '123',
        holder: savedCard?.cardHolderName || 'Saved Card',
      };
    } else {
      paymentData = {
        number: card.number.replace(/\s/g, ''),
        expiry: card.expiry,
        cvv: card.cvv,
        holder: card.holder,
      };
    }

    // Pass orderId DIRECTLY from the resolved order — never from stale store
    const currentOrderId = String(currentOrder?.id || orderId);
    const result = await processPayment(currentOrderId, offerId, paymentData);

    if (result.success) {
      if (saveCard && !selectedSavedCard) {
        try {
          await addCard({
            last4: card.number.replace(/\s/g, '').slice(-4),
            brand: card.number.startsWith('4') ? 'Visa' : 'Mastercard',
            expiryMonth: parseInt(card.expiry.split('/')[0], 10),
            expiryYear: parseInt('20' + card.expiry.split('/')[1], 10),
            cardHolderName: card.holder,
          });
          await fetchCards();
          setSaveCard(false);
        } catch (e) {
          console.error("Failed to save card", e);
        }
      }

      setSuccessMessage(
        isAr
          ? `✅ تم الدفع بنجاح! رقم المعاملة: ${result.transactionNumber}`
          : `✅ Payment Successful! Transaction: ${result.transactionNumber}`
      );
      setSelectedOfferId(null);
      // Collapse the paid offer
      setExpandedOfferId(null);
    }
  };

  const paidCount = paidOfferIds.length;
  const totalOffers = acceptedOffers.length;
  const allPaid = paidCount >= totalOffers && totalOffers > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ────────────── Image Viewer Modal ────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Part"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────── Payment Progress Header ────────────── */}
      <div className="bg-[#121212] border border-[#2b271d] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-base md:text-lg">
            {isAr ? 'الدفع للعروض المقبولة' : 'Pay for Accepted Offers'}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${allPaid ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            {paidCount}/{totalOffers} {tPay.paid}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalOffers > 0 ? `${(paidCount / totalOffers) * 100}%` : '0%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {!allPaid && totalOffers > 0 && (
          <p className="text-amber-400/70 text-xs mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            {tPay.remainingParts} ({totalOffers - paidCount} {tPay.remaining})
          </p>
        )}

        {allPaid && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-xs mt-2 flex items-center gap-1 font-bold"
          >
            <CheckCircle size={14} />
            {tPay.allPaid}
          </motion.p>
        )}
      </div>

      {/* ────────────── Success Message ────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm font-bold text-center"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────── Global Payment Error ────────────── */}
      <AnimatePresence>
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <AlertTriangle size={16} />
            {paymentError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────── Card Selection ────────────── */}
      {!allPaid && (
        <div className="space-y-4">
          {cards.length > 0 && (
            <div className="bg-[#121212] border border-[#2b271d] rounded-2xl p-5">
              <h4 className="text-white font-bold mb-4">{isAr ? 'اختر بطاقة محفوظة' : 'Select Saved Card'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedSavedCard(selectedSavedCard === c.id ? null : c.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSavedCard === c.id ? 'bg-gold-500/10 border-gold-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard className={selectedSavedCard === c.id ? "text-gold-500" : "text-gray-400"} size={20} />
                        <div className="flex flex-col">
                          <span className="font-bold text-white tracking-widest">•••• {c.last4}</span>
                          <span className="text-xs text-gray-400 mt-1">{c.brand} • {c.expiryMonth.toString().padStart(2, '0')}/{c.expiryYear}</span>
                        </div>
                      </div>
                      {selectedSavedCard === c.id && <CheckCircle className="text-gold-500" size={20} />}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSavedCard && (
                <button
                  onClick={() => setSelectedSavedCard(null)}
                  className="mt-4 text-sm text-gold-500 hover:text-gold-400 font-medium"
                >
                  {isAr ? '+ استخدام بطاقة جديدة' : '+ Use a new card'}
                </button>
              )}
            </div>
          )}

          {!selectedSavedCard && (
            <div className="space-y-4">
              <CreditCardInput
                onCardChange={setCard}
                errors={cardErrors}
                disabled={isProcessing}
              />
              <div
                className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors mt-2"
                onClick={() => !isProcessing && setSaveCard(!saveCard)}
              >
                <label className="text-sm font-medium text-white cursor-pointer select-none">
                  {isAr ? 'حفظ هذه البطاقة للمدفوعات القادمة' : 'Save this card for future payments'}
                </label>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${saveCard ? 'bg-gold-500 border-gold-500' : 'border-white/20 bg-black/50'}`}>
                  {saveCard && <CheckCircle2 size={14} className="text-black" />}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────── Per-Offer Payment Cards ────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">{tFR.orderDetails}</h3>

        {acceptedOffers.map((offer: any) => {
          const isPaid = paidOfferIds.includes(offer.id);
          const isSelected = selectedOfferId === offer.id;
          const isExpanded = expandedOfferId === offer.id;

          // Get the real part name from the order parts
          const part = requiredPartsArray.find((p: any) => p.id === offer.orderPartId);
          const partName = part?.name || offer.partName || offer.orderPartName || (isAr ? 'قطعة' : 'Part');

          // Get the image — merchant's offer image or customer's part image
          const merchantImage = offer.offerImage;
          const customerImage = part?.images?.[0] || currentOrder?.partImages?.[0];
          const imageToShow = merchantImage || customerImage;

          // Price for display
          const price = Number(offer.price || offer.unitPrice || 0);

          return (
            <motion.div
              key={offer.id}
              layout
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isPaid
                ? 'bg-green-500/5 border-green-500/30'
                : isSelected
                  ? 'bg-[#1a1508] border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  : 'bg-[#121212] border-[#2b271d] hover:border-[#3b351d]'
                }`}
            >
              {/* ── Top: Image + Name + Price ── */}
              <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 cursor-pointer"
                onClick={() => !isPaid && setExpandedOfferId(isExpanded ? null : offer.id)}
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Clickable Image */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (imageToShow) setSelectedImage(imageToShow);
                    }}
                    className={`w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden ${imageToShow ? 'cursor-pointer hover:border-gold-500/50 transition-colors' : ''}`}
                  >
                    {imageToShow ? (
                      <img src={imageToShow} alt={partName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg leading-tight">{partName}</h4>
                    <p className="text-white/40 text-[11px] mt-0.5">
                      {offer.merchantName || 'Store'} • #{offer.offerNumber !== 'N/A' && offer.offerNumber ? offer.offerNumber : offer.id?.toString().slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {/* Price Badge */}
                  <div className={`px-5 py-2 rounded-xl text-center min-w-[130px] ${isPaid ? 'bg-green-500/10 border border-green-500/20' : 'bg-[#241d0f] border border-[#4a3e20]'}`}>
                    <p className="text-[11px] text-gold-300/80 mb-0.5">{tFR.price}</p>
                    <p className={`font-bold font-mono text-lg ${isPaid ? 'text-green-400' : 'text-gold-500'}`}>
                      AED {price.toLocaleString()}
                    </p>
                  </div>

                  {/* Status Icon */}
                  {isPaid ? (
                    <CheckCircle size={22} className="text-green-400 shrink-0" />
                  ) : (
                    <button className="text-white/30 hover:text-white/60 transition-colors shrink-0">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Middle Grid: Order Info (same as review step) ── */}
              <div className="flex flex-wrap justify-between gap-4 px-5 pb-4 pt-2 border-t border-white/5 text-right rtl:text-right ltr:text-left">
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.orderNoDate}</p>
                  <p className="text-xs font-bold text-white font-mono flex items-center rtl:justify-start ltr:justify-start gap-2">
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(currentOrder?.orderNumber || currentOrder?.id?.toString()); }} className="text-gold-500 hover:text-gold-400"><Copy size={12} /></button>
                    #{currentOrder?.orderNumber || currentOrder?.id?.toString().slice(0, 6).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">{currentOrder?.createdAt ? new Date(currentOrder.createdAt).toLocaleDateString() : '---'}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.offerNo}</p>
                  <p className="text-xs font-bold text-white font-mono flex items-center rtl:justify-start ltr:justify-start gap-2">
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(offer.offerNumber || offer.id?.toString()); }} className="text-gold-500 hover:text-gold-400"><Copy size={12} /></button>
                    #{offer.offerNumber !== 'N/A' && offer.offerNumber ? offer.offerNumber : offer.id?.toString().slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.storeNo}</p>
                  <p className="text-xs font-bold text-white font-mono">
                    {offer.storeCode && offer.storeCode !== 'N/A' ? `#${offer.storeCode}` : '---'}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">{offer.merchantName || '---'}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.paymentStatus}</p>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full mt-0.5">
                      <CheckCircle2 size={12} />
                      {tPay.paid}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full mt-0.5">
                      <AlertTriangle size={12} />
                      {isAr ? 'في انتظار الدفع' : 'Awaiting Payment'}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Bottom Grid: Details (condition, warranty, delivery, weight) ── */}
              <div className="flex flex-wrap justify-between gap-4 px-5 pb-5 text-right rtl:text-right ltr:text-left">
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.condition}</p>
                  <p className="text-xs font-bold text-white/90">{formatCondition(offer.condition)}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.warranty}</p>
                  <p className="text-xs font-bold text-amber-400/90">{formatWarranty(offer.warranty)}</p>
                </div>

                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.approxWeight}</p>
                  <p className="text-xs font-bold text-white/90">
                    <span className="font-mono text-gold-400 mr-1">{offer.weightKg || offer.weight || '---'}</span> kg
                  </p>
                </div>
              </div>

              {/* ── Expanded: Pay Button (only when not paid) ── */}
              <AnimatePresence>
                {isExpanded && !isPaid && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePay(offer.id); }}
                        disabled={isProcessing}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isProcessing && isSelected
                          ? 'bg-gold-500/30 text-gold-300 cursor-wait'
                          : 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black shadow-lg hover:shadow-gold-500/20'
                          }`}
                      >
                        {isProcessing && isSelected ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {isAr ? 'جاري الدفع...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            {tPay.payForOffer} — AED {price.toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Paid badge ── */}
              {isPaid && (
                <div className="px-5 pb-4">
                  <div className="text-green-400 text-xs flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg w-fit font-bold">
                    <CheckCircle size={14} />
                    {tPay.paid} ✓
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ────────────── Empty state ────────────── */}
      {acceptedOffers.length === 0 && (
        <div className="bg-[#121212] border border-[#2b271d] rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            {isAr ? 'لا توجد عروض مقبولة للدفع' : 'No accepted offers to pay for'}
          </p>
        </div>
      )}
    </div>
  );
};
