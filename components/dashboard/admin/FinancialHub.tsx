
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { DollarSign, TrendingUp, Save, Lock, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';

export const FinancialHub: React.FC = () => {
  const { t, language } = useLanguage();
  const { commissionRate, setCommissionRate, currentAdmin } = useAdminStore();
  const [tempRate, setTempRate] = useState(commissionRate);

  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
  const isAr = language === 'ar';

  const [orderToRelease, setOrderToRelease] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);

  const handleSave = () => {
      setCommissionRate(tempRate);
      alert('Commission rate updated successfully!');
  };

  const handleReleaseEscrow = async () => {
      if (!orderToRelease) return;
      setIsReleasing(true);
      try {
          const { client } = await import('../../../services/api/client');
          await client.post('/payments/admin/release-escrow', { orderId: orderToRelease });
          alert(isAr ? 'تم تحرير الأموال بنجاح' : 'Funds released successfully');
          setOrderToRelease('');
      } catch (error) {
          console.error(error);
          alert(isAr ? 'فشل تحرير الأموال' : 'Failed to release funds');
      } finally {
          setIsReleasing(false);
      }
  };

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-bold text-white">{t.admin.financials.title}</h1>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Commission Control */}
            <GlassCard className={`p-8 bg-gradient-to-br from-[#1A1814] to-gold-900/10 ${!isSuperAdmin ? 'opacity-80 grayscale-[0.5]' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gold-500/20 text-gold-400">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{t.admin.financials.commission}</h2>
                            <p className="text-xs text-white/50">Affects all new offers immediately</p>
                        </div>
                    </div>
                    {!isSuperAdmin && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold">
                            <Lock size={12} />
                            Super Admin Only
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-bold text-white">{tempRate}%</span>
                        <span className="text-sm text-gold-400 font-mono">Current: {commissionRate}%</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="0" 
                        max="30" 
                        step="1"
                        value={tempRate}
                        disabled={!isSuperAdmin}
                        onChange={(e) => setTempRate(parseInt(e.target.value))}
                        className={`w-full accent-gold-500 h-2 bg-white/10 rounded-lg appearance-none ${isSuperAdmin ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    />
                    
                    {isSuperAdmin && (
                        <button 
                            onClick={handleSave}
                            className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {t.admin.financials.updateCommission}
                        </button>
                    )}
                </div>
            </GlassCard>

            {/* Financial Overview - Visible to All Roles (Admin & Support) */}
            <div className="space-y-4">
                <GlassCard className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase">Total Platform Revenue</p>
                        <h3 className="text-2xl font-bold text-white mt-1">1,250,400 SAR</h3>
                    </div>
                    <TrendingUp className="text-green-400" size={24} />
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase">Pending Payouts</p>
                        <h3 className="text-2xl font-bold text-white mt-1">45,200 SAR</h3>
                    </div>
                    <div className="text-white/20">Thursday Next</div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="text-orange-400" size={20} />
                            <h3 className="font-bold text-white">{isAr ? 'التحكم في الضمان (Escrow)' : 'Escrow Control'}</h3>
                        </div>
                    </div>
                    <p className="text-white/40 text-xs mb-4">
                        {isAr 
                            ? 'حرر الأموال المجمدة للتاجر يدوياً في حال وجود مشاكل في التسليم التلقائي.' 
                            : 'Manually release held funds to the merchant if auto-release fails.'}
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder={isAr ? 'رقم الطلب (Order ID)' : 'Order ID'}
                            value={orderToRelease}
                            onChange={(e) => setOrderToRelease(e.target.value)}
                            disabled={!isSuperAdmin || isReleasing}
                            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 w-full text-white text-sm outline-none focus:border-gold-500"
                        />
                        <button 
                            onClick={handleReleaseEscrow}
                            disabled={!isSuperAdmin || isReleasing || !orderToRelease}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center justify-center min-w-[120px] transition-colors ${
                                isSuperAdmin && orderToRelease && !isReleasing 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                        >
                            {isReleasing ? <RefreshCw size={18} className="animate-spin" /> : (isAr ? 'تحرير' : 'Release')}
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    </div>
  );
};
