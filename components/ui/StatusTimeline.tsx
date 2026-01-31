
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusType } from './Badge';

interface StatusTimelineProps {
  currentStatus: StatusType;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const { language } = useLanguage();
  
  // Define steps and their icons
  const steps = [
    { id: 'request', label: { ar: 'تقديم الطلب', en: 'Request' }, icon: FileTextIcon },
    { id: 'offers', label: { ar: 'العروض', en: 'Offers' }, icon: Clock },
    { id: 'payment', label: { ar: 'الدفع', en: 'Payment' }, icon: Package },
    { id: 'shipping', label: { ar: 'الشحن', en: 'Shipping' }, icon: Truck },
    { id: 'delivery', label: { ar: 'الاستلام', en: 'Delivery' }, icon: CheckCircle },
  ];

  // Helper to get active step index
  const getActiveStepIndex = (status: StatusType): number => {
    switch (status) {
      case 'AWAITING_OFFERS': return 1;
      case 'AWAITING_PAYMENT': return 2;
      case 'PREPARATION': return 2; // Payment done, preparing
      case 'SHIPPED': return 3;
      case 'DELIVERED': 
      case 'COMPLETED': return 4;
      case 'CANCELLED': 
      case 'RETURNED': 
      case 'DISPUTED': return 0; // Special case handling in UI
      default: return 0;
    }
  };

  const activeIndex = getActiveStepIndex(currentStatus);
  const isCancelled = ['CANCELLED', 'RETURNED', 'DISPUTED'].includes(currentStatus);

  return (
    <div className="w-full py-8 px-4">
      <div className="flex justify-between items-center relative">
        
        {/* Connection Line Background */}
        <div className="absolute top-5 left-0 w-full h-1 bg-white/10 -z-10 rounded-full" />
        
        {/* Active Progress Line */}
        {!isCancelled && (
            <motion.div 
                className="absolute top-5 left-0 h-1 bg-gold-500 -z-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={language === 'ar' ? { right: 0, left: 'auto', transformOrigin: 'right' } : { left: 0, right: 'auto', transformOrigin: 'left' }}
            />
        )}

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex && !isCancelled;
          const isCurrent = idx === activeIndex && !isCancelled;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative group">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: isCompleted ? '#A88B3E' : '#1A1814',
                  borderColor: isCompleted ? '#C4A95C' : '#ffffff20',
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? '0 0 15px rgba(168,139,62,0.6)' : 'none'
                }}
                className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 z-10
                    ${isCompleted ? 'text-white' : 'text-white/30'}
                `}
              >
                {isCompleted ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </motion.div>
              
              <span className={`text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${isCompleted ? 'text-white' : 'text-white/30'}`}>
                {language === 'ar' ? step.label.ar : step.label.en}
              </span>
            </div>
          );
        })}
      </div>
      
      {isCancelled && (
        <div className="mt-4 text-center text-red-400 text-sm font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {language === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
        </div>
      )}
    </div>
  );
};

// Simple icon wrapper
const FileTextIcon = (props: any) => (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
    </svg>
);
