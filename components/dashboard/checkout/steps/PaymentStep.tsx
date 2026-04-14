import React, { useState, useMemo } from 'react';
import { useCheckoutStore } from '../../../../stores/useCheckoutStore';
import { useOrderStore } from '../../../../stores/useOrderStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { CheckCircle, AlertTriangle, Package, Loader2, ChevronDown, ChevronUp, Copy, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StripePaymentForm } from '../StripePaymentForm';

export const PaymentStep: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const tPay = t.dashboard.checkout.payment;
  const tFR = t.dashboard.checkout.finalReview;

  const { orderId, createPaymentIntent, isProcessing, paidOfferIds, paymentError, clearPaymentError } = useCheckoutStore();
  const { orders } = useOrderStore();

  // Selected offer being actively paid (has a client secret)
  const [activePaymentOfferId, setActivePaymentOfferId] = useState<string | null>(null);
  const [activeClientSecret, setActiveClientSecret] = useState<string | null>(null);
  const [activeAmount, setActiveAmount] = useState<number>(0);

  // UI state
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Find the current order and its accepted offers
  const currentOrder = useMemo(() => {
    return orders.find(o => String(o.id) === String(orderId));
  }, [orders, orderId]);

  const requiredPartsArray = currentOrder?.parts || [];

  const acceptedOffers = useMemo(() => {
    if (!currentOrder?.offers) return [];
    return currentOrder.offers.filter((o: any) => o.status === 'accepted');
  }, [currentOrder]);

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

  /**
   * Step 1: Initialize Payment (Fetch Client Secret)
   */
  const handlePreparePayment = async (offerId: string) => {
    clearPaymentError();
    setSuccessMessage(null);
    setActivePaymentOfferId(offerId);

    const currentOrderId = String(currentOrder?.id || orderId);
    
    // Fetch the active offer object to get the calculated price
    const offer = acceptedOffers.find((o: any) => o.id === offerId);
    
    // offer.price = finalPrice (unitPrice + shippingCost + commission)
    const price = Number(offer?.price || 0);
    const totalAmount = price;
    setActiveAmount(totalAmount);

    const secret = await createPaymentIntent(currentOrderId, offerId);
    if (secret) {
      setActiveClientSecret(secret);
    } else {
      setActivePaymentOfferId(null);
    }
  };

  /**
   * Step 2: Final Success (Callback from Stripe Component)
   */
  const handlePaymentSuccess = (paymentIntent: any) => {
    // Add to paid list locally (webhook will eventually confirm server-side)
    useCheckoutStore.setState((state) => ({
      paidOfferIds: [...state.paidOfferIds, activePaymentOfferId!]
    }));

    setSuccessMessage(
      isAr
        ? `✅ تم الدفع بنجاح! شكراً لك.`
        : `✅ Payment Successful! Thank you.`
    );
    
    setActivePaymentOfferId(null);
    setActiveClientSecret(null);
    setExpandedOfferId(null);
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

      {/* ────────────── Per-Offer Payment Cards ────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">{tFR.orderDetails}</h3>

        {acceptedOffers.map((offer: any) => {
          const isPaid = paidOfferIds.includes(offer.id);
          const isPreparing = activePaymentOfferId === offer.id && !activeClientSecret;
          const isReadyToPay = activePaymentOfferId === offer.id && !!activeClientSecret;
          const isExpanded = expandedOfferId === offer.id;

          // Get the real part name from the order parts
          const part = requiredPartsArray.find((p: any) => p.id === offer.orderPartId);
          const partName = part?.name || offer.partName || offer.orderPartName || (isAr ? 'قطعة' : 'Part');

          // Get the image
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
                : isReadyToPay
                  ? 'bg-[#1a1508] border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  : 'bg-[#121212] border-[#2b271d] hover:border-[#3b351d]'
                }`}
            >
              {/* ── Top Header ── */}
              <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 cursor-pointer"
                onClick={() => !isPaid && !isReadyToPay && setExpandedOfferId(isExpanded ? null : offer.id)}
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
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
                  <div className={`px-5 py-2 rounded-xl text-center min-w-[130px] ${isPaid ? 'bg-green-500/10 border border-green-500/20' : 'bg-[#241d0f] border border-[#4a3e20]'}`}>
                    <p className="text-[11px] text-gold-300/80 mb-0.5">{tFR.price}</p>
                    <p className={`font-bold font-mono text-lg ${isPaid ? 'text-green-400' : 'text-gold-500'}`}>
                      AED {price.toLocaleString()}
                    </p>
                  </div>

                  {isPaid ? (
                    <CheckCircle size={22} className="text-green-400 shrink-0" />
                  ) : (
                    <button className="text-white/30 hover:text-white/60 transition-colors shrink-0">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Details Grid ── */}
              <div className="flex flex-wrap justify-between gap-4 px-5 pb-4 pt-2 border-t border-white/5">
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.orderNoDate}</p>
                  <p className="text-xs font-bold text-white font-mono flex items-center gap-2">
                    #{currentOrder?.orderNumber || currentOrder?.id?.toString().slice(0, 6).toUpperCase()}
                  </p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.condition}</p>
                  <p className="text-xs font-bold text-white/90">{formatCondition(offer.condition)}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.warranty}</p>
                  <p className="text-xs font-bold text-amber-400/90">{formatWarranty(offer.warranty)}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <p className="text-[10px] text-white/40 mb-1">{tFR.paymentStatus}</p>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">{tPay.paid}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {isAr ? 'في انتظار الدفع' : 'Awaiting Payment'}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Expanded Section ── */}
              <AnimatePresence>
                {isExpanded && !isPaid && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="px-5 pb-6 pt-2">
                      {!activePaymentOfferId ? (
                        <button
                          onClick={() => handlePreparePayment(offer.id)}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold text-sm shadow-lg hover:shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                          {tPay.payForOffer} — AED {price.toLocaleString()}
                        </button>
                      ) : activePaymentOfferId === offer.id ? (
                        <div>
                          {isPreparing ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                              <Loader2 className="animate-spin text-gold-500" size={32} />
                              <p className="text-gold-500/70 text-sm animate-pulse">
                                {isAr ? 'جاري تجهيز بوابة الدفع الآمنة...' : 'Preparing secure payment gateway...'}
                              </p>
                            </div>
                          ) : activeClientSecret && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs px-2">
                                    <span className="text-white/40">{isAr ? 'دفع آمن عبر' : 'Secure payment via'}</span>
                                    <button 
                                      onClick={() => { setActivePaymentOfferId(null); setActiveClientSecret(null); }}
                                      className="text-red-400/60 hover:text-red-400 transition-colors"
                                    >
                                      {isAr ? 'إلغاء' : 'Cancel'}
                                    </button>
                                </div>
                                <StripePaymentForm 
                                    clientSecret={activeClientSecret}
                                    amount={activeAmount}
                                    onSuccess={handlePaymentSuccess}
                                    onError={(err) => useCheckoutStore.setState({ paymentError: err })}
                                />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-white/20 py-4">
                           {isAr ? 'يرجى إكمال الدفع النشط أولاً' : 'Please complete active payment first'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ────────────── Empty State ────────────── */}
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
