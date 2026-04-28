import React from 'react';
import { useAdminStore } from '../../../stores/useAdminStore';
import { Wallet, CreditCard, ShieldCheck, Download, Filter, RefreshCw, Landmark, TrendingUp } from 'lucide-react';

const TransactionTypeFilter: React.FC = () => {
  const { feedFilters, setFeedFilters } = useAdminStore();
  
  const types = [
    { id: 'ALL', icon: Filter, labelEn: 'All Events', labelAr: 'جميع العمليات' },
    { id: 'PAYMENT', icon: CreditCard, labelEn: 'Payments', labelAr: 'المدفوعات' },
    { id: 'PAYMENT_REFUNDED', icon: RefreshCw, labelEn: 'Refunds', labelAr: 'المرتجعات' },
    { id: 'ESCROW', icon: ShieldCheck, labelEn: 'Escrow', labelAr: 'الضمان' },
    { id: 'WITHDRAWAL', icon: Download, labelEn: 'Withdrawals', labelAr: 'السحوبات' },
    { id: 'MANUAL_PAYOUT', icon: Landmark, labelEn: 'Manual Payouts', labelAr: 'تحويلات يدوية' },
    { id: 'ORDER_PROFIT', icon: TrendingUp, labelEn: 'Commissions', labelAr: 'العمولات' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {types.map((type) => {
        const Icon = type.icon;
        const isActive = feedFilters.type === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => setFeedFilters({ type: type.id })}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border
              ${isActive 
                ? 'bg-[#A88B3E] text-white border-[#A88B3E] shadow-lg shadow-[#A88B3E]/20' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
            <span className="text-sm font-medium">
              {document.documentElement.dir === 'rtl' ? type.labelAr : type.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TransactionTypeFilter;
