
import React, { useState, useCallback } from 'react';
import { CreditCard, Lock, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

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

interface CreditCardInputProps {
    onCardChange: (card: CardState) => void;
    errors?: CardErrors;
    disabled?: boolean;
}

/**
 * Format card number with spaces every 4 digits
 */
const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Format expiry as MM/YY
 */
const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
};

export const CreditCardInput: React.FC<CreditCardInputProps> = ({ onCardChange, errors, disabled }) => {
    const { t } = useLanguage();
    const [card, setCard] = useState<CardState>({ number: '', expiry: '', cvv: '', holder: '' });

    const handleChange = useCallback((field: keyof CardState, rawValue: string) => {
        let value = rawValue;
        if (field === 'number') value = formatCardNumber(rawValue);
        if (field === 'expiry') value = formatExpiry(rawValue);
        if (field === 'cvv') value = rawValue.replace(/\D/g, '').slice(0, 4);
        if (field === 'holder') value = rawValue.toUpperCase();

        const updated = { ...card, [field]: value };
        setCard(updated);
        onCardChange(updated);
    }, [card, onCardChange]);

    const inputClass = (field: keyof CardErrors) =>
        `w-full bg-white/5 border rounded-lg py-3 px-4 text-white font-mono placeholder-white/20 focus:border-gold-500 outline-none transition-all ${errors?.[field]
            ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            : 'border-white/10'
        }`;

    return (
        <div className={`bg-[#0F0E0C] p-6 rounded-xl border border-white/10 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{t.dashboard.checkout.payment.title}</h3>
                    <Lock size={14} className="text-green-400" />
                </div>
                <div className="flex items-center gap-1.5 bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 px-3 py-1 rounded-lg text-xs font-bold tracking-wider">
                    <ShieldCheck size={14} />
                    STRIPE
                </div>
            </div>

            <div className="space-y-4">
                {/* Card Number */}
                <div>
                    <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.card}</label>
                    <div className="relative group">
                        <CreditCard className="absolute top-3.5 left-3.5 w-5 h-5 text-gold-500 group-focus-within:text-gold-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={card.number}
                            onChange={(e) => handleChange('number', e.target.value)}
                            className={`${inputClass('number')} pl-10`}
                            disabled={disabled}
                        />
                    </div>
                    {errors?.number && <p className="text-red-400 text-[10px] mt-1">{errors.number}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.expiry}</label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={card.expiry}
                            onChange={(e) => handleChange('expiry', e.target.value)}
                            className={inputClass('expiry')}
                            disabled={disabled}
                        />
                        {errors?.expiry && <p className="text-red-400 text-[10px] mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.cvv}</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="123"
                                value={card.cvv}
                                onChange={(e) => handleChange('cvv', e.target.value)}
                                className={inputClass('cvv')}
                                disabled={disabled}
                            />
                            <ShieldCheck className="absolute top-3 right-3 w-4 h-4 text-white/20" />
                        </div>
                        {errors?.cvv && <p className="text-red-400 text-[10px] mt-1">{errors.cvv}</p>}
                    </div>
                </div>

                {/* Holder Name */}
                <div>
                    <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.holder}</label>
                    <input
                        type="text"
                        placeholder="MOHAMMED ALI"
                        value={card.holder}
                        onChange={(e) => handleChange('holder', e.target.value)}
                        className={`${inputClass('holder')} uppercase`}
                        disabled={disabled}
                    />
                    {errors?.holder && <p className="text-red-400 text-[10px] mt-1">{errors.holder}</p>}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <Lock size={10} />
                    TLS 1.3 Encrypted
                </div>
                <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {t.dashboard.checkout.payment.secure}
                </div>
            </div>
        </div>
    );
};
