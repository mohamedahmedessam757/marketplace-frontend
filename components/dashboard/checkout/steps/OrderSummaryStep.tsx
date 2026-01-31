
import React from 'react';
import { useCheckoutStore } from '../../../../stores/useCheckoutStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Receipt } from 'lucide-react';

export const OrderSummaryStep: React.FC = () => {
  const { selectedOffer, address } = useCheckoutStore();
  const { t } = useLanguage();

  if (!selectedOffer) return <div>No offer selected</div>;

  const subtotal = selectedOffer.price;
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = subtotal + shipping + vat;

  const Row = ({ label, value, isTotal = false }: any) => (
    <div className={`flex justify-between items-center py-3 ${isTotal ? 'border-t border-white/10 mt-2 pt-4' : 'border-b border-white/5'}`}>
        <span className={`${isTotal ? 'text-lg font-bold text-white' : 'text-sm text-white/60'}`}>{label}</span>
        <span className={`${isTotal ? 'text-xl font-bold text-gold-400' : 'text-sm text-white'} font-mono`}>
            {value.toLocaleString()} SAR
        </span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-[#151310] p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <Receipt className="text-gold-500" />
                <div>
                    <h3 className="text-white font-bold">{selectedOffer.partName}</h3>
                    <p className="text-xs text-white/40">{selectedOffer.merchantName}</p>
                </div>
            </div>

            <Row label={t.dashboard.checkout.summary.item} value={subtotal} />
            <Row label={t.dashboard.checkout.summary.shipping} value={shipping} />
            <Row label={t.dashboard.checkout.summary.vat} value={vat} />
            <Row label={t.dashboard.checkout.summary.total} value={total} isTotal />
        </div>

        <div className="bg-white/5 p-4 rounded-xl text-xs text-white/60">
            <strong>Ship to:</strong> {address.fullName}, {address.city}, {address.details}
        </div>
    </div>
  );
};
