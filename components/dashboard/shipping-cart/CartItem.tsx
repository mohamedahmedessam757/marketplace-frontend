
import React from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { Trash2, AlertCircle } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { useLanguage } from '../../../contexts/LanguageContext';

export interface CartItemType {
    id: string;
    name: string;
    price: number;
    partImage?: string;
    expiryDate: Date;
    storeName: string;
}

interface CartItemProps {
    item: CartItemType;
    onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
    const { t } = useLanguage();
    return (
        <GlassCard className="p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    {item.partImage ? (
                        <img src={item.partImage} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <AlertCircle size={20} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-xs text-white/50 mb-1">{t.dashboard.shippingCart.store}: {item.storeName}</p>
                    <CountdownTimer targetDate={item.expiryDate} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                <p className="text-xl font-bold text-gold-400">{item.price} SAR</p>
                <button
                    onClick={() => onRemove(item.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </GlassCard>
    );
};
