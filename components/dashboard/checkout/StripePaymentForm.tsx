import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from './../../../contexts/LanguageContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
}

const CheckoutForm: React.FC<Omit<StripePaymentFormProps, 'clientSecret'>> = ({ onSuccess, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    } else {
      onError('Unexpected payment status');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{ 
          layout: 'tabs',
        }} 
      />
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
          isProcessing 
            ? 'bg-gold-500/30 text-gold-300 cursor-wait' 
            : 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black shadow-lg shadow-gold-500/20 active:scale-[0.98]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {isAr ? 'جاري معالجة الدفع...' : 'Processing Payment...'}
          </>
        ) : (
          <>
            <Lock size={18} />
            {isAr ? `دفع الآن (AED ${amount.toLocaleString()})` : `Pay Now (AED ${amount.toLocaleString()})`}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
        <ShieldCheck size={12} />
        {isAr ? 'دفع آمن بنسبة 100%' : '100% Secure Payment'}
      </div>
    </form>
  );
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#D4AF37',
      colorBackground: '#121212',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
        '.Tab': {
            border: '1px solid #2b271d',
            backgroundColor: '#1A1A1A',
        },
        '.Tab:hover': {
            borderColor: '#D4AF37',
        },
        '.Input': {
            backgroundColor: '#1A1A1A',
            border: '1px solid #2b271d',
        }
    }
  };

  return (
    <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret: props.clientSecret,
          appearance,
        }}
      >
        <CheckoutForm {...props} />
      </Elements>
    </div>
  );
};
