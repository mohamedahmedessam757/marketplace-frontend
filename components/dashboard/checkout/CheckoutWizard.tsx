
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckoutStore } from '../../../stores/useCheckoutStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { GlassCard } from '../../ui/GlassCard';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AddressStep } from './steps/AddressStep';
import { OrderSummaryStep } from './steps/OrderSummaryStep';
import { PaymentStep } from './steps/PaymentStep';
import { ThreeDSecureModal } from '../../modals/ThreeDSecureModal';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface CheckoutWizardProps {
    onComplete: () => void;
}

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({ onComplete }) => {
    const { step, setStep, submitPayment, isProcessing, reset, selectedOffer } = useCheckoutStore();
    const { updateOrderStatus, orders } = useOrderStore();
    const { addNotification } = useNotificationStore();

    const { t, language } = useLanguage();
    const [show3DS, setShow3DS] = useState(false);

    const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight;
    const PrevIcon = language === 'ar' ? ChevronRight : ChevronLeft;

    useEffect(() => {
        return () => reset(); // Reset on unmount
    }, []);

    const steps = [
        { id: 1, title: t.dashboard.checkout.steps.address },
        { id: 2, title: t.dashboard.checkout.steps.summary },
        { id: 3, title: t.dashboard.checkout.steps.payment },
    ];

    const handleNext = async () => {
        if (step === 3) {
            // Trigger 3D Secure Modal instead of direct submit
            setShow3DS(true);
        } else {
            setStep(step + 1);
        }
    };

    const handle3DSSuccess = async () => {
        setShow3DS(false);
        await submitPayment(); // Fake delay

        if (selectedOffer) {
            // 1. Find the order linked to this offer (Hack for demo: find the AWAITING_PAYMENT order)
            const pendingOrder = orders.find(o => o.status === 'AWAITING_PAYMENT');

            if (pendingOrder) {
                // 2. Update Order Status
                updateOrderStatus(pendingOrder.id, 'PREPARATION');

                // 3. Add Notification for CUSTOMER
                addNotification({
                    recipientRole: 'CUSTOMER',
                    type: 'payment',
                    titleKey: 'paymentConfirmed',
                    message: language === 'ar'
                        ? `تم دفع ${selectedOffer.price} ريال بنجاح للطلب #${pendingOrder.id}`
                        : `Payment of ${selectedOffer.price} SAR successful for Order #${pendingOrder.id}`,
                    orderId: pendingOrder.id,
                    linkTo: 'order-details',
                    priority: 'normal',
                    channels: ['app', 'email']
                });

                // 5. Add Notification for MERCHANT (Simulated)
                // In a real app, this would be sent to the merchant's specific user ID
                setTimeout(() => {
                    if (pendingOrder.merchantId) {
                        addNotification({
                            recipientId: pendingOrder.merchantId,
                            recipientRole: 'MERCHANT',
                            type: 'offer', // Using 'offer' icon or 'payment' icon
                            titleKey: 'offerAccepted', // New key needed or reuse
                            message: language === 'ar'
                                ? `💰 مبروك! تم دفع الطلب #${pendingOrder.id}. يرجى البدء في التجهيز.`
                                : `💰 Payment Received! Order #${pendingOrder.id} is ready for preparation.`,
                            orderId: pendingOrder.id,
                            linkTo: 'active-orders',
                            priority: 'urgent',
                            channels: ['app', 'email']
                        });
                    }
                }, 1000);
            }
        }

        onComplete();
    };

    return (
        <>
            <ThreeDSecureModal
                isOpen={show3DS}
                onSuccess={handle3DSSuccess}
                onCancel={() => setShow3DS(false)}
                amount={selectedOffer?.price || 0}
            />

            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.checkout.title}</h1>
                </div>

                {/* Stepper */}
                <div className="flex justify-between items-center px-4 relative mb-12">
                    <div className="absolute top-5 left-0 w-full h-1 bg-white/10 -z-10 rounded-full">
                        <motion.div
                            className="h-full bg-gold-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                    {steps.map(s => {
                        const isActive = step >= s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-[#1A1814] border-gold-500 text-gold-500' : 'bg-[#1A1814] border-white/20 text-white/20'}`}>
                                    {isActive ? <CheckCircle2 size={20} /> : s.id}
                                </div>
                                <span className={`text-xs font-bold ${isActive ? 'text-gold-500' : 'text-white/20'}`}>{s.title}</span>
                            </div>
                        );
                    })}
                </div>

                <GlassCard className="min-h-[400px] flex flex-col justify-between p-8 border-gold-500/20">
                    <div className="flex-1">
                        {step === 1 && <AddressStep />}
                        {step === 2 && <OrderSummaryStep />}
                        {step === 3 && <PaymentStep />}
                    </div>

                    <div className="flex justify-between mt-8 border-t border-white/5 pt-6">
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1 || isProcessing}
                            className="flex items-center gap-2 text-white/60 hover:text-white disabled:opacity-0"
                        >
                            <PrevIcon size={18} />
                            {t.auth.vendor.prev}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isProcessing}
                            className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : (step === 3 ? t.dashboard.checkout.summary.pay : t.auth.vendor.next)}
                            {!isProcessing && step < 3 && <NextIcon size={18} />}
                        </button>
                    </div>
                </GlassCard>
            </div>
        </>
    );
};
