import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useCreateOrderStore } from '../../../stores/useCreateOrderStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { VehicleDetailsStep } from './steps/VehicleDetailsStep';
import { PartDetailsStep } from './steps/PartDetailsStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { ReviewStep } from './steps/ReviewStep';
import { GlassCard } from '../../ui/GlassCard';

interface CreateOrderWizardProps {
  onComplete: () => void;
}

export const CreateOrderWizard: React.FC<CreateOrderWizardProps> = ({ onComplete }) => {
  const { step, setStep, submitOrder, reset, vehicle, part, preferences } = useCreateOrderStore();
  const { addOrder } = useOrderStore(); // Kept for completeness though unused if we use fetchOrders logic
  const { addNotification } = useNotificationStore();
  const { t, language } = useLanguage();

  const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight;
  const PrevIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    reset(); // Clear store on mount
    setIsReady(true);
    return () => reset(); // Clear on unmount
  }, []);

  const steps = [
    { id: 1, title: t.dashboard.createOrder.steps.vehicle },
    { id: 2, title: t.dashboard.createOrder.steps.part },
    { id: 3, title: t.dashboard.createOrder.steps.preferences },
    { id: 4, title: t.dashboard.createOrder.steps.review },
  ];

  const handleNext = () => {
    // Basic validation logic
    if (step === 1 && !vehicle.make) return; // Prevent next if make empty
    if (step === 2 && (!part.name || !part.description || part.images.length === 0)) return; // Mandatory Description & Images
    if (step === 3 && !preferences.condition) return; // Prevent next if condition not selected

    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    // 1. PERSIST DATA via Store Action (which handles API)
    try {
      await submitOrder();

      // 2. Refresh Order List to show new persistence
      useOrderStore.getState().fetchOrders(); // SYNC ORDER STORE

      // 3. TRIGGER NOTIFICATION (Simulating Broadcast to Merchants)
      addNotification({
        type: 'system',
        titleKey: 'adminAlert', // Using generic alert key for "New Request"
        message: `${t.dashboard.createOrder.successAlert}: ${part.name} - ${vehicle.make}`,
        linkTo: 'marketplace', // Direct merchant to marketplace
        priority: 'urgent'
      });

      onComplete();
    } catch (error) {
      console.error("Order Creation Failed:", error);
      addNotification({
        type: 'system',
        titleKey: 'adminAlert',
        message: "Failed to create order. Please check your connection.", // Fallback if no specific error
        linkTo: 'create',
        priority: 'urgent'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.createOrder.title}</h1>
        <p className="text-white/50">{t.dashboard.createOrder.subtitle}</p>
      </div>

      {/* Progress Stepper - Luxurious Gold Glow */}
      <div className="relative flex justify-between items-center px-4 md:px-12 mb-12">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 shadow-[0_0_10px_#A88B3E]"
            initial={{ width: '0%' }}
            animate={{ width: isReady ? `${((step - 1) / 3) * 100}%` : '0%' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((s) => {
          const isActive = step === s.id;
          const isCompleted = step > s.id;

          return (
            <div key={s.id} className="relative flex flex-col items-center group">
              <motion.div
                animate={{
                  backgroundColor: isActive || isCompleted ? '#1A1814' : '#1A1814',
                  borderColor: isActive || isCompleted ? '#C4A95C' : '#ffffff20',
                  scale: isActive ? 1.2 : 1,
                  boxShadow: isActive ? '0 0 20px rgba(168, 139, 62, 0.4)' : '0 0 0px rgba(0,0,0,0)'
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300`}
              >
                {isCompleted ? (
                  <Check size={20} className="text-gold-400" />
                ) : (
                  <span className={`font-bold ${isActive ? 'text-gold-400' : 'text-white/30'}`}>{s.id}</span>
                )}
              </motion.div>
              <span className={`absolute top-14 text-xs font-bold transition-colors ${isActive ? 'text-gold-400' : 'text-white/30'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <GlassCard className="bg-[#1A1814]/80 backdrop-blur-xl border border-gold-500/10 p-6 md:p-10 min-h-[400px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && <VehicleDetailsStep key="step1" />}
            {step === 2 && <PartDetailsStep key="step2" />}
            {step === 3 && <PreferencesStep key="step3" />}
            {step === 4 && <ReviewStep key="step4" onConfirm={handleSubmit} />}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors font-medium ${step === 1 ? 'opacity-0 cursor-default' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <PrevIcon size={20} />
              {t.dashboard.createOrder.back}
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98]"
            >
              {t.dashboard.createOrder.next}
              <NextIcon size={20} />
            </button>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
