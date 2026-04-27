import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    FileText, 
    Download, 
    ArrowUpRight, 
    ArrowDownLeft, 
    DollarSign, 
    TrendingUp, 
    CreditCard, 
    Save, 
    Lock, 
    Settings, 
    AlertOctagon, 
    CheckCircle2, 
    Percent, 
    Filter, 
    Wallet, 
    RefreshCw, 
    Send,
    Activity,
    Calendar,
    ChevronRight,
    ExternalLink,
    PieChart,
    Users,
    ArrowRight,
    ShieldCheck,
    ClipboardCheck,
    ArrowRightLeft,
    Crown
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AdminBillingProps {
    onNavigate?: (path: string, id: any) => void;
}

export const AdminBilling: React.FC<AdminBillingProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';

    const { 
        currentAdmin,
        commissionRate, setCommissionRate,
        adminFinancials, isLoadingFinancials, financialFilters, 
        fetchAdminFinancials, exportFinancialCSV, sendManualPayout, 
        setFinancialFilters, subscribeToFinancials, unsubscribeFromFinancials,
        withdrawalLimits, updateWithdrawalLimits, pendingWithdrawals, processWithdrawal, fetchWithdrawals, isLoadingWithdrawals
    } = useAdminStore();

    const [tempRate, setTempRate] = useState(commissionRate);
    const [limits, setLimits] = useState(withdrawalLimits);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'WITHDRAWALS'>('OVERVIEW');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    
    // Payout modal state
    const [payoutForm, setPayoutForm] = useState({
        userId: '',
        amount: '',
        method: 'STRIPE_CONNECT',
        note: '',
        adminSignature: ''
    });

    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchAdminFinancials();
        fetchWithdrawals();
        subscribeToFinancials();
        return () => unsubscribeFromFinancials();
    }, []);

    const kpis = adminFinancials?.kpis || {
        totalSales: 0, netCommission: 0, shippingProfit: 0, referralEarnings: 0,
        referralCount: 0, pendingWithdrawals: 0, pendingWithdrawalsCount: 0,
        frozenFunds: 0, todayTransactionsCount: 0
    };

    const transactions = adminFinancials?.transactions || [];

    // Widgets Data
    const topEarners = useAdminStore.getState().dashboardStats?.topStores?.slice(0, 5) || [];
    
    const txBreakdown = useMemo(() => {
        const counts = { payment: 0, commission: 0, withdrawal: 0, refund: 0, other: 0 };
        transactions.forEach((tx: any) => {
            const type = tx.transactionType?.toLowerCase();
            if (counts[type as keyof typeof counts] !== undefined) {
                counts[type as keyof typeof counts]++;
            } else {
                counts.other++;
            }
        });
        const total = transactions.length || 1;
        return [
            { label: t.admin.billing.types.CUSTOMER_INVOICE, value: counts.payment, color: '#3b82f6', percent: (counts.payment/total)*100 },
            { label: t.admin.billing.types.COMMISSION_INVOICE, value: counts.commission, color: '#d4af37', percent: (counts.commission/total)*100 },
            { label: t.admin.billing.types.PAYOUT_INVOICE, value: counts.withdrawal, color: '#10b981', percent: (counts.withdrawal/total)*100 },
            { label: t.admin.billing.statusTypes.REFUNDED, value: counts.refund, color: '#ef4444', percent: (counts.refund/total)*100 }
        ].filter(x => x.value > 0);
    }, [transactions, t]);

    const handleSaveCommission = () => {
        setCommissionRate(tempRate);
        alert(t.admin.billing.alerts.commissionSuccess);
    };

    const handleSaveLimits = async () => {
        const success = await updateWithdrawalLimits(limits);
        if (success) alert(t.admin.billing.alerts.limitsSuccess);
    };

    const submitManualPayout = async () => {
        if (!payoutForm.userId || !payoutForm.amount || !payoutForm.adminSignature) {
            alert(t.admin.billing.alerts.fillRequired);
            return;
        }
        const dto = {
            userId: payoutForm.userId,
            amount: Number(payoutForm.amount),
            method: payoutForm.method,
            note: payoutForm.note,
            adminName: currentAdmin?.name || 'Admin',
            adminEmail: currentAdmin?.email || 'admin@etashleh.com',
            adminSignature: payoutForm.adminSignature
        };
        const res = await sendManualPayout(dto);
        if (res.success) {
            setShowPayoutModal(false);
            setPayoutForm({ userId: '', amount: '', method: 'STRIPE_CONNECT', note: '', adminSignature: '' });
        }
        alert(res.message);
    };

    // Helper for Premium Stat Card
    const StatCard = ({ label, value, subValue, icon: Icon, color, trend }: any) => (
        <GlassCard className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-gradient-to-br from-white/[0.04] to-transparent border-white/5">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12 group-hover:opacity-20 transition-opacity duration-700`} style={{ backgroundColor: color }} />
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-white/30 uppercase ">{label}</p>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors" style={{ color: color }}>
                        <Icon size={18} />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">{value}</h3>
                    {subValue && <p className="text-[10px] font-bold text-white/40 mt-1 uppercase ">{subValue}</p>}
                    {trend && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: trend }} className="h-full bg-cyan-400" />
                            </div>
                            <span className="text-[10px] font-black text-cyan-400">{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* 1. Header Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1A1814] to-[#0A0908] border border-white/5 shadow-2xl p-8 sm:p-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -ml-24 -mb-24 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                                <DollarSign className="text-black" size={30} />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                    {t.admin.billing.title}
                                </h1>
                                <p className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mt-1">
                                    {t.admin.billing.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-white/20`} />
                            <input
                                type="text"
                                placeholder={t.admin.billing.searchPlaceholder}
                                className={`w-full lg:w-72 bg-black/40 border border-white/10 rounded-2xl ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-4 text-sm text-white focus:border-gold-500/50 outline-none transition-all placeholder:text-white/20 font-bold`}
                                value={financialFilters.search || ''}
                                onChange={e => setFinancialFilters({ search: e.target.value })}
                            />
                        </div>
                        <button 
                            onClick={() => exportFinancialCSV()} 
                            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 group"
                            title={t.common.export}
                        >
                            <Download size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                        {isSuperAdmin && (
                            <button 
                                onClick={() => setShowPayoutModal(true)} 
                                className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-xs uppercase  rounded-2xl shadow-xl shadow-gold-500/20 transition-all flex items-center justify-center gap-3"
                            >
                                <Send size={18} />
                                {t.admin.billing.manualPayout.execute}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation (Modern Floating Style) */}
            <div className="relative z-30 flex gap-2 sm:gap-4 p-2 bg-[#1A1814] border border-white/5 rounded-3xl w-fit mx-auto lg:mx-0 overflow-x-auto no-scrollbar shadow-2xl">
                {[
                    { id: 'OVERVIEW', label: t.admin.billing.panels.overview, icon: Activity },
                    { id: 'TRANSACTIONS', label: t.admin.billing.panels.ledger, icon: ClipboardCheck },
                    { id: 'WITHDRAWALS', label: t.admin.billing.panels.pipeline, icon: ArrowRightLeft }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-[10px] uppercase  transition-all whitespace-nowrap cursor-pointer
                            ${activeTab === tab.id 
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20 scale-105' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* 2. KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard 
                            label={t.admin.billing.kpis.totalSales}
                            value={`${kpis.totalSales.toLocaleString()} AED`}
                            icon={TrendingUp}
                            color="#3b82f6"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.netProfit}
                            value={`${kpis.netCommission.toLocaleString()} AED`}
                            icon={DollarSign}
                            color="#d4af37"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.logisticsRevenue}
                            value={`${kpis.shippingProfit.toLocaleString()} AED`}
                            icon={Activity}
                            color="#10b981"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.referralEcosystem}
                            value={`${kpis.referralEarnings.toLocaleString()} AED`}
                            subValue={`${kpis.referralCount} ${t.admin.billing.kpis.activeReferrals}`}
                            icon={Users}
                            color="#8b5cf6"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.withdrawalQueue}
                            value={`${kpis.pendingWithdrawals.toLocaleString()} AED`}
                            subValue={`${kpis.pendingWithdrawalsCount} ${t.admin.billing.kpis.pendingRequests}`}
                            icon={RefreshCw}
                            color="#f59e0b"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.escrowLocked}
                            value={`${kpis.frozenFunds.toLocaleString()} AED`}
                            icon={Lock}
                            color="#ef4444"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.activityLoad}
                            value={kpis.todayTransactionsCount.toString()}
                            subValue={t.admin.billing.kpis.realtimeOps}
                            icon={RefreshCw}
                            color="#ffffff"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.overallLiquidity || 'Overall Liquidity'}
                            value={`${kpis.overallLiquidity?.toLocaleString() || 0} AED`}
                            subValue={t.admin.billing.kpis.platformReserves || 'Platform Reserves'}
                            icon={Wallet}
                            color="#22d3ee"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        
                        {/* 3a. Top Earners Intelligence */}
                        <GlassCard className="p-8 bg-[#151310] border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-gold-500">
                                <Crown size={120} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-3">
                                    <Crown size={18} className="text-gold-500" />
                                    {t.admin.billing.panels.elitePerformance}
                                </h4>
                                <div className="space-y-6">
                                    {topEarners.length > 0 ? topEarners.map((store: any, idx: number) => (
                                        <div key={store.storeId} className="flex justify-between items-center group cursor-pointer hover:bg-white/[0.02] p-2 rounded-xl transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-black text-xs border border-gold-500/20">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-black group-hover:text-gold-400 transition-colors">{store.name}</p>
                                                    <p className="text-[10px] text-white/30 font-bold  mt-0.5">{store.ordersCount} {t.admin.billing.panels.succeededOps}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-white font-mono">{store.revenue?.toLocaleString()}</span>
                                                <p className="text-[9px] text-white/20 font-bold uppercase">AED</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center text-white/10 italic text-xs uppercase ">
                                            {t.admin.billing.ledger.table.scanning}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* 3b. Liquidity Composition Chart */}
                        <GlassCard className="p-8 bg-[#151310] border-white/5 flex flex-col items-center">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-10 self-start flex items-center gap-3">
                                <PieChart size={18} className="text-blue-500" />
                                {t.admin.billing.panels.liquidityComposition}
                            </h4>
                            <div className="w-48 h-48 rounded-full relative mb-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5" style={{
                                background: `conic-gradient(${txBreakdown.map((item, i, arr) => {
                                    const prev = arr.slice(0, i).reduce((a, b) => a + b.percent, 0);
                                    return `${item.color} ${prev}% ${prev + item.percent}%`;
                                }).join(', ')})`
                            }}>
                                <div className="absolute inset-6 bg-[#151310] rounded-full flex flex-col items-center justify-center shadow-inner border border-white/5">
                                    <span className="text-white font-black font-mono text-3xl leading-none">{transactions.length}</span>
                                    <span className="text-[9px] text-white/30 font-bold  mt-2 uppercase">{t.admin.billing.panels.totalOps}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full px-4">
                                {txBreakdown.map(tx => (
                                    <div key={tx.label} className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: tx.color, color: tx.color }}></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white font-black uppercase tracking-wider">{tx.label}</span>
                                            <span className="text-[9px] text-white/30 font-bold">{Math.round(tx.percent)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* 3c. Payout Pipeline Timeline */}
                        <GlassCard className="p-8 bg-[#151310] border-white/5">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-3">
                                <Activity size={18} className="text-emerald-500" />
                                {t.admin.billing.panels.payoutPipeline}
                            </h4>
                            <div className="space-y-8 relative before:absolute before:top-2 before:bottom-0 before:left-[11px] before:w-[2px] before:bg-white/[0.03]">
                                {pendingWithdrawals.slice(0, 5).map((w: any) => (
                                    <div key={w.id} className="flex items-start gap-5 relative z-10">
                                        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center border-2 border-[#151310] shadow-xl shrink-0 ${
                                            w.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                            w.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                                            'bg-red-500'
                                        }`} />
                                        <div className="flex-1 bg-white/[0.02] p-4 rounded-[1.25rem] border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm text-white font-black truncate max-w-[120px]">{w.store?.name || w.user?.name}</p>
                                                <span className="text-xs font-black text-white font-mono">{Number(w.amount).toLocaleString()} <span className="text-[9px] opacity-30">AED</span></span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[9px] text-white/20 font-black uppercase ">{new Date(w.createdAt).toLocaleDateString()}</p>
                                                <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                                    w.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 
                                                    w.status === 'PENDING' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 
                                                    'text-red-400 border-red-500/20 bg-red-500/10'
                                                }`}>
                                                    {w.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {pendingWithdrawals.length === 0 && (
                                    <div className="p-12 text-center text-white/10 italic text-xs uppercase ">
                                        {t.admin.billing.panels.pipelineClear}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>


                </div>
            )}

            {activeTab === 'TRANSACTIONS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex flex-wrap gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
                        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                            <Filter size={18} className="text-gold-500" />
                            <select 
                                value={financialFilters.type || 'ALL'} 
                                onChange={(e) => setFinancialFilters({ type: e.target.value })}
                                className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-xs text-white uppercase font-black  outline-none focus:border-gold-500/50 flex-1"
                            >
                                <option value="ALL">{t.admin.billing.ledger.filters.directions}</option>
                                <option value="DEBIT">{t.admin.billing.ledger.filters.debit}</option>
                                <option value="CREDIT">{t.admin.billing.ledger.filters.credit}</option>
                            </select>
                        </div>
                        <select 
                            value={financialFilters.role || 'ALL'} 
                            onChange={(e) => setFinancialFilters({ role: e.target.value })}
                            className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-xs text-white uppercase font-black  outline-none focus:border-gold-500/50 flex-1 min-w-[150px]"
                        >
                            <option value="ALL">{t.admin.billing.ledger.filters.roles}</option>
                            <option value="VENDOR">{t.admin.billing.ledger.filters.vendors}</option>
                            <option value="CUSTOMER">{t.admin.billing.ledger.filters.customers}</option>
                        </select>
                        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                            <input 
                                type="date"
                                value={financialFilters.startDate || ''}
                                onChange={(e) => setFinancialFilters({ startDate: e.target.value })}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white/70 font-mono font-bold outline-none flex-1"
                            />
                            <ArrowRight size={14} className="text-white/20" />
                            <input 
                                type="date"
                                value={financialFilters.endDate || ''}
                                onChange={(e) => setFinancialFilters({ endDate: e.target.value })}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white/70 font-mono font-bold outline-none flex-1"
                            />
                        </div>
                    </div>

                    <GlassCard className="p-0 overflow-hidden bg-black/20 border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-white/[0.03] text-[10px] text-white/30 uppercase  font-black">
                                    <tr>
                                        <th className="px-8 py-6">{t.admin.billing.ledger.table.node}</th>
                                        <th className="px-8 py-6">{t.admin.billing.ledger.table.operation}</th>
                                        <th className="px-8 py-6">{t.admin.billing.ledger.table.netImpact}</th>
                                        <th className="px-8 py-6">{t.admin.billing.ledger.table.timestamp}</th>
                                        <th className="px-8 py-6">{t.admin.billing.ledger.table.status}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoadingFinancials ? (
                                        <tr><td colSpan={5} className="px-8 py-20 text-center text-white/20 font-black  text-xs uppercase animate-pulse">{t.admin.billing.ledger.table.scanning}</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr><td colSpan={5} className="px-8 py-20 text-center text-white/10 font-bold text-xs uppercase ">{t.admin.billing.ledger.table.noRecords}</td></tr>
                                    ) : transactions.map((tx: any) => {
                                        const isRisk = Number(tx.amount) > 5000;
                                        return (
                                            <tr key={tx.id} className={`hover:bg-white/[0.02] transition-colors group ${isRisk ? 'bg-orange-500/[0.03]' : ''}`}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-mono text-[10px] font-black text-gold-500 border border-white/10">
                                                            {tx.id.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-mono text-white font-bold text-sm">#{tx.id.slice(0, 12)}</div>
                                                            <div className="text-[9px] text-white/30 font-black uppercase mt-0.5 flex items-center gap-1.5">
                                                                {tx.userName} • {tx.userRole}
                                                                {onNavigate && (
                                                                    <button 
                                                                        onClick={() => onNavigate(tx.userRole === 'VENDOR' ? 'store-profile' : 'customer-profile', tx.userId)}
                                                                        className="hover:text-gold-400 transition-colors"
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase  border ${
                                                        tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    }`}>
                                                        {tx.transactionType}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`font-mono text-lg font-black flex items-center gap-2 ${isRisk ? 'text-orange-400' : tx.type === 'DEBIT' ? 'text-white' : 'text-emerald-400'}`}>
                                                        {tx.type === 'DEBIT' ? '-' : '+'}{Number(tx.amount).toLocaleString()}
                                                        <span className="text-[10px] opacity-30 font-bold uppercase">AED</span>
                                                        {isRisk && <AlertOctagon size={14} className="text-orange-400 animate-pulse" />}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-mono text-xs text-white/40">
                                                    {new Date(tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <span className="text-[10px] text-white/60 font-black uppercase ">
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'WITHDRAWALS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <GlassCard className="p-0 overflow-hidden bg-black/20 border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-white/[0.03] text-[10px] text-white/30 uppercase  font-black">
                                    <tr>
                                        <th className="px-8 py-6">{t.admin.billing.withdrawals.table.target}</th>
                                        <th className="px-8 py-6">{t.admin.billing.withdrawals.table.amount}</th>
                                        <th className="px-8 py-6">{t.admin.billing.withdrawals.table.method}</th>
                                        <th className="px-8 py-6">{t.admin.billing.withdrawals.table.timestamp}</th>
                                        <th className="px-8 py-6">{t.admin.billing.withdrawals.table.status}</th>
                                        <th className="px-8 py-6 text-right">{t.admin.billing.withdrawals.table.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoadingWithdrawals ? (
                                        <tr><td colSpan={6} className="px-8 py-20 text-center text-white/20 font-black  text-xs uppercase animate-pulse">{t.admin.billing.withdrawals.actions.empty}</td></tr>
                                    ) : pendingWithdrawals.length === 0 ? (
                                        <tr><td colSpan={6} className="px-8 py-20 text-center text-white/10 font-bold text-xs uppercase ">{t.admin.billing.withdrawals.actions.empty}</td></tr>
                                    ) : pendingWithdrawals.map((req: any) => (
                                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-gold-500">
                                                        {req.store?.name?.[0] || req.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-sm">{req.store?.name || req.user?.name}</div>
                                                        <div className="text-[9px] text-white/30 font-black uppercase  mt-1">{req.role} NODE</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono font-black text-gold-500 text-lg">
                                                {Number(req.amount).toLocaleString()} <span className="text-[10px] text-white/20 uppercase">AED</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase  border ${
                                                    req.payoutMethod === 'STRIPE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gold-500/10 text-gold-500 border-gold-500/20'
                                                }`}>
                                                    {req.payoutMethod === 'STRIPE' ? <RefreshCw size={12} className="animate-spin-slow" /> : <CreditCard size={12} />}
                                                    {req.payoutMethod}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-xs text-white/40">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase  border ${
                                                    req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2 justify-end">
                                                    {req.status === 'PENDING' && isSuperAdmin && (
                                                        <>
                                                            <button 
                                                                onClick={() => processWithdrawal(req.id, 'approve')} 
                                                                className="w-11 h-11 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center group/btn"
                                                                title={t.admin.billing.withdrawals.actions.execute}
                                                            >
                                                                <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                            <button 
                                                                onClick={() => processWithdrawal(req.id, 'reject', prompt(t.admin.billing.withdrawals.actions.rejectPrompt)||undefined)} 
                                                                className="w-11 h-11 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 flex items-center justify-center group/btn"
                                                                title={t.admin.billing.withdrawals.actions.invalidate}
                                                            >
                                                                <AlertOctagon size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => onNavigate && onNavigate(req.role === 'VENDOR' ? 'store-profile' : 'customer-profile', req.userId || req.storeId)}
                                                        className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all border border-white/10 flex items-center justify-center"
                                                        title="View Profile"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* 5. Manual Payout Modal (2026 Style Overlay) */}
            <AnimatePresence>
                {showPayoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="relative bg-[#1A1814] border border-gold-500/20 rounded-[3rem] w-full max-w-xl shadow-[0_0_100px_rgba(212,175,55,0.15)] overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="overflow-y-auto no-scrollbar">
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 bg-gradient-to-r from-gold-500/[0.05] to-transparent">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gold-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-gold-500/30">
                                        <Send className="text-black" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t.admin.billing.manualPayout.title}</h3>
                                        <p className="text-white/40 text-[10px] font-bold uppercase  mt-1">{t.admin.billing.manualPayout.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase  ml-1">{t.admin.billing.manualPayout.targetNode}</label>
                                        <input 
                                            type="text" 
                                            value={payoutForm.userId} 
                                            onChange={e => setPayoutForm({...payoutForm, userId: e.target.value})} 
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white font-mono font-bold outline-none focus:border-gold-500/50 transition-all" 
                                            placeholder="XXXX-XXXX-XXXX" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase  ml-1">{t.admin.billing.manualPayout.volume}</label>
                                        <input 
                                            type="number" 
                                            value={payoutForm.amount} 
                                            onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})} 
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-lg text-white font-mono font-black outline-none focus:border-gold-500/50 transition-all" 
                                            placeholder="0.00" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase  ml-1">{t.admin.billing.manualPayout.protocol}</label>
                                    <select 
                                        value={payoutForm.method} 
                                        onChange={e => setPayoutForm({...payoutForm, method: e.target.value})} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white font-black uppercase  outline-none focus:border-gold-500/50 transition-all"
                                    >
                                        <option value="STRIPE_CONNECT">Automated Gateway (Stripe Connect)</option>
                                        <option value="MANUAL">Offline Settlement (Manual Bank)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase  ml-1">{t.admin.billing.manualPayout.note}</label>
                                    <input 
                                        type="text" 
                                        value={payoutForm.note} 
                                        onChange={e => setPayoutForm({...payoutForm, note: e.target.value})} 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-gold-500/50 transition-all font-medium" 
                                        placeholder="Enter reason for manual adjustment..." 
                                    />
                                </div>

                                <div className="p-8 bg-rose-500/[0.03] border border-rose-500/20 rounded-[2rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                        <ShieldCheck size={60} className="text-rose-500" />
                                    </div>
                                    <label className="text-[10px] font-black text-rose-500 uppercase  mb-4 block flex items-center gap-2">
                                        <Lock size={14}/> {t.admin.billing.manualPayout.cryptoSignature}
                                    </label>
                                    <input 
                                        type="password" 
                                        value={payoutForm.adminSignature} 
                                        onChange={e => setPayoutForm({...payoutForm, adminSignature: e.target.value})} 
                                        className="w-full bg-black/60 border border-rose-500/30 rounded-xl p-5 text-sm text-white font-mono font-black outline-none focus:border-rose-500 transition-all text-center " 
                                        placeholder={t.admin.billing.manualPayout.signPrompt} 
                                    />
                                    <p className="text-[9px] text-rose-500/40 font-bold mt-4 text-center uppercase  leading-relaxed">
                                        {t.admin.billing.manualPayout.auditCommit}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-10 border-t border-white/5 bg-black/20 flex gap-4">
                                <button 
                                    onClick={() => setShowPayoutModal(false)} 
                                    className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase  rounded-2xl transition-all text-[10px] border border-white/5"
                                >
                                    {t.common.cancel}
                                </button>
                                <button 
                                    onClick={submitManualPayout} 
                                    className="flex-1 py-5 bg-gold-500 hover:bg-gold-400 text-black font-black uppercase  rounded-2xl shadow-2xl shadow-gold-500/20 transition-all flex items-center justify-center gap-3 text-[10px]"
                                >
                                    <Send size={18} /> 
                                    {t.admin.billing.manualPayout.execute}
                                </button>
                            </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
