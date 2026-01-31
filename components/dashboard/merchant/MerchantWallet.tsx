

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, AlertCircle, Calendar } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMerchantWalletStore } from '../../../stores/useMerchantWalletStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { GlassCard } from '../../ui/GlassCard';

export const MerchantWallet: React.FC = () => {
  const { t, language } = useLanguage();
  const { balance, transactions, updateBalance } = useMerchantWalletStore();
  const { orders } = useOrderStore(); 
  const isAr = language === 'ar';

  useEffect(() => {
    let pending = 0;
    let available = 0;
    let total = 0;

    orders.forEach(order => {
        const price = order.price ? parseFloat(order.price.replace(/[^0-9.]/g, '')) : 0;
        
        if (order.status === 'COMPLETED') {
            available += price * 0.9; 
            total += price;
        } else if (['DELIVERED', 'SHIPPED', 'DISPUTED'].includes(order.status)) {
            pending += price * 0.9;
            total += price;
        }
    });

    updateBalance(available, pending, total);
  }, [orders]);

  const StatCard = ({ label, value, icon: Icon, color, subText }: any) => (
    <GlassCard className="p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-${color}-500/20 transition-colors`} />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
                    <Icon size={24} />
                </div>
                <span className="text-[10px] text-white/40 font-mono bg-white/5 px-2 py-1 rounded">{t.common.sar}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 font-mono tracking-wide">{value.toLocaleString()}</h3>
            <p className="text-white/50 text-sm font-medium">{label}</p>
            {subText && <p className="text-xs text-white/30 mt-2">{subText}</p>}
        </div>
    </GlassCard>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.merchant.earnings.title}</h1>
                <p className="text-white/50 text-sm">{t.dashboard.merchant.earnings.payoutInfo}</p>
            </div>
            <div className="hidden md:block text-right">
                <div className="text-xs text-white/40 mb-1">{t.dashboard.merchant.wallet.today}</div>
                <div className="text-lg font-bold text-gold-400 font-mono">{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB')}</div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <StatCard 
                label={t.dashboard.merchant.earnings.available} 
                value={balance.available} 
                icon={Wallet} 
                color="green" 
                subText={t.dashboard.merchant.wallet.readyPayout}
            />
            <StatCard 
                label={t.dashboard.merchant.earnings.pending} 
                value={balance.pending} 
                icon={Clock} 
                color="yellow" 
                subText={t.dashboard.merchant.wallet.underWarranty}
            />
            <StatCard 
                label={t.dashboard.merchant.earnings.totalSales} 
                value={balance.totalSales} 
                icon={TrendingUp} 
                color="gold" 
            />
        </div>

        <GlassCard className="p-0 overflow-hidden bg-[#151310] border-white/5 min-h-[400px]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <ArrowDownLeft size={20} className="text-white/40" />
                    {t.dashboard.merchant.wallet.recentTx}
                </h3>
                <button className="text-xs text-gold-400 hover:text-white transition-colors">
                    {t.dashboard.merchant.wallet.export}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-xs text-white/40 uppercase tracking-wider">
                            <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.date}</th>
                            <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.type}</th>
                            <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.order}</th>
                            <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.amount}</th>
                            <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.status}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                        <Calendar size={14} className="text-white/30" />
                                        {tx.date}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border ${
                                        tx.type === 'sale' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        tx.type === 'payout' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {tx.type === 'sale' && <ArrowDownLeft size={12} />}
                                        {tx.type === 'payout' && <ArrowUpRight size={12} />}
                                        {t.dashboard.merchant.earnings.types[tx.type]}
                                    </span>
                                </td>
                                <td className="p-4 text-white/50 text-xs font-mono">
                                    {tx.orderId ? `#${tx.orderId}` : '-'}
                                </td>
                                <td className="p-4 font-mono font-bold">
                                    <span className={tx.amount > 0 ? 'text-white' : 'text-white/50'}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </span> 
                                    <span className="text-[10px] text-white/30 ml-1">{t.common.sar}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs ${
                                        tx.status === 'completed' ? 'text-green-500' : 
                                        tx.status === 'pending' ? 'text-yellow-500' : 'text-white/50'
                                    }`}>
                                        {t.dashboard.merchant.earnings.status[tx.status]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="text-center py-10 text-white/40">
                        {t.dashboard.merchant.wallet.noTx}
                    </div>
                )}
            </div>
        </GlassCard>
    </div>
  );
};
