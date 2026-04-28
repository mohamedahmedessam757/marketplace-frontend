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
    Users,
    ArrowRight,
    ShieldCheck,
    ClipboardCheck,
    ArrowRightLeft,
    Crown,
    ChevronDown,
    Package,
    User,
    X
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { BarChart } from '../../ui/Charts';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ManualPayoutModal } from './ManualPayoutModal';
import { RejectWithdrawalModal } from './RejectWithdrawalModal';
import { Landmark } from 'lucide-react';

interface AdminBillingProps {
    onNavigate?: (path: string, id: any) => void;
}

export const AdminBilling: React.FC<AdminBillingProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';

    // --- Selective store subscriptions to prevent flicker/re-renders ---
    const currentAdmin = useAdminStore(s => s.currentAdmin);
    const commissionRate = useAdminStore(s => s.commissionRate);
    const setCommissionRate = useAdminStore(s => s.setCommissionRate);
    // Use a stable reference: only re-render when the kpis object actually changes
    const adminFinancials = useAdminStore(s => s.adminFinancials);
    const isLoadingFinancials = useAdminStore(s => s.isLoadingFinancials);
    const financialFilters = useAdminStore(s => s.financialFilters);
    const fetchAdminFinancials = useAdminStore(s => s.fetchAdminFinancials);
    const exportFinancialCSV = useAdminStore(s => s.exportFinancialCSV);
    const sendManualPayout = useAdminStore(s => s.sendManualPayout);
    const setFinancialFilters = useAdminStore(s => s.setFinancialFilters);
    const subscribeToFinancials = useAdminStore(s => s.subscribeToFinancials);
    const unsubscribeFromFinancials = useAdminStore(s => s.unsubscribeFromFinancials);
    const withdrawalLimits = useAdminStore(s => s.withdrawalLimits);
    const updateWithdrawalLimits = useAdminStore(s => s.updateWithdrawalLimits);
    const pendingWithdrawals = useAdminStore(s => s.pendingWithdrawals);
    const processWithdrawal = useAdminStore(s => s.processWithdrawal);
    const fetchWithdrawals = useAdminStore(s => s.fetchWithdrawals);
    const isLoadingWithdrawals = useAdminStore(s => s.isLoadingWithdrawals);
    const verifyBankDetails = useAdminStore(s => s.verifyBankDetails);

    const [tempRate, setTempRate] = useState(commissionRate);
    const [limits, setLimits] = useState(withdrawalLimits);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'WITHDRAWALS'>('OVERVIEW');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedWithdrawalReq, setSelectedWithdrawalReq] = useState<any>(null);
    const [processingRejectId, setProcessingRejectId] = useState<string | null>(null);
    
    const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
    const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
    const typeDropdownRef = React.useRef<HTMLDivElement>(null);
    const roleDropdownRef = React.useRef<HTMLDivElement>(null);

    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchAdminFinancials();
        fetchWithdrawals();
        subscribeToFinancials();

        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsTypeFilterOpen(false);
            }
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
                setIsRoleFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            unsubscribeFromFinancials();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const kpis = adminFinancials?.kpis || {
        totalSales: 0, netCommission: 0, shippingProfit: 0, referralEarnings: 0,
        referralCount: 0, pendingWithdrawals: 0, pendingWithdrawalsCount: 0,
        frozenFunds: 0, todayTransactionsCount: 0, overallLiquidity: 0,
        totalRefunds: 0, gatewayFees: 0, pendingLiabilities: 0
    };

    const transactions = adminFinancials?.transactions || [];
    const topSpenders: any[] = adminFinancials?.topSpenders || [];
    const topEarners: any[] = adminFinancials?.topEarners || [];

    // Widgets Data
    const salesTrendData = useMemo(() => {
        const grouped = transactions.reduce((acc: Record<string, number>, tx: any) => {
            const dateStr = new Date(tx.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
            if (!acc[dateStr]) acc[dateStr] = 0;
            acc[dateStr] += tx.amount;
            return acc;
        }, {});

        const labels = Object.keys(grouped).reverse();
        return labels.map(label => ({
            label,
            value: grouped[label]
        })).slice(-14);
    }, [transactions, isAr]);

    const handleSaveCommission = () => {
        setCommissionRate(tempRate);
        alert(t.admin.billing.alerts.commissionSuccess);
    };

    const handleSaveLimits = async () => {
        const success = await updateWithdrawalLimits(limits);
        if (success) alert(t.admin.billing.alerts.limitsSuccess);
    };



    // Helper for Premium Stat Card — React.memo used inside here to prevent flicker
    const StatCard = React.memo(({ label, value, subValue, icon: Icon, color, trend }: any) => (
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
    ));
    StatCard.displayName = 'StatCard';

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
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                            <input 
                                type="date" 
                                value={financialFilters.startDate || ''}
                                onChange={(e) => setFinancialFilters({ startDate: e.target.value })}
                                className="bg-transparent border-none text-[10px] text-white font-mono focus:ring-0 cursor-pointer outline-none"
                            />
                            <span className="text-white/20 text-xs">→</span>
                            <input 
                                type="date" 
                                value={financialFilters.endDate || ''}
                                onChange={(e) => setFinancialFilters({ endDate: e.target.value })}
                                className="bg-transparent border-none text-[10px] text-white font-mono focus:ring-0 cursor-pointer outline-none"
                            />
                        </div>
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
                            value={`${(kpis.totalSales || 0).toLocaleString()} AED`}
                            icon={TrendingUp}
                            color="#3b82f6"
                        />
                        <StatCard 
                            label={isAr ? 'الربح الصافي الحقيقي' : 'True Net Profit'}
                            value={`${(kpis.netCommission || 0).toLocaleString()} AED`}
                            icon={DollarSign}
                            color="#d4af37"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.logisticsRevenue}
                            value={`${(kpis.shippingProfit || 0).toLocaleString()} AED`}
                            icon={Activity}
                            color="#10b981"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.referralEcosystem}
                            value={`${(kpis.referralEarnings || 0).toLocaleString()} AED`}
                            subValue={`${kpis.referralCount || 0} ${t.admin.billing.kpis.activeReferrals}`}
                            icon={Users}
                            color="#8b5cf6"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.withdrawalQueue}
                            value={`${(kpis.pendingWithdrawals || 0).toLocaleString()} AED`}
                            subValue={`${kpis.pendingWithdrawalsCount || 0} ${t.admin.billing.kpis.pendingRequests}`}
                            icon={RefreshCw}
                            color="#f59e0b"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.escrowLocked}
                            value={`${(kpis.frozenFunds || 0).toLocaleString()} AED`}
                            icon={Lock}
                            color="#ef4444"
                        />
                        <StatCard 
                            label={isAr ? 'السيولة الكلية' : (t.admin.billing.kpis.overallLiquidity || 'Overall Liquidity')}
                            value={`${kpis.overallLiquidity?.toLocaleString() || 0} AED`}
                            subValue={isAr ? 'احتياطيات المنصة' : (t.admin.billing.kpis.platformReserves || 'Platform Reserves')}
                            icon={Wallet}
                            color="#22d3ee"
                        />
                        <StatCard 
                            label={isAr ? 'الالتزامات المعلقة' : 'Pending Liabilities'}
                            value={`${(kpis.pendingLiabilities || 0).toLocaleString()} AED`}
                            subValue={isAr ? 'نقاط الولاء وأرباح المستخدمين غير المسحوبة' : 'Unwithdrawn loyalty & referral points'}
                            icon={AlertOctagon}
                            color="#eab308"
                        />
                        <StatCard 
                            label={isAr ? 'التكاليف التشغيلية (البوابات)' : 'Gateway Fees'}
                            value={`${(kpis.gatewayFees || 0).toLocaleString()} AED`}
                            icon={CreditCard}
                            color="#94a3b8"
                        />
                        <StatCard 
                            label={isAr ? 'إجمالي المبالغ المستردة' : 'Total Refunds'}
                            value={`${(kpis.totalRefunds || 0).toLocaleString()} AED`}
                            icon={ArrowDownLeft}
                            color="#f87171"
                        />
                        <StatCard 
                            label={t.admin.billing.kpis.activityLoad}
                            value={kpis.todayTransactionsCount.toString()}
                            subValue={t.admin.billing.kpis.realtimeOps}
                            icon={RefreshCw}
                            color="#ffffff"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* 3a. Top Spenders & Top Earners Leaderboard (Col 1) */}
                        <GlassCard className="p-8 bg-[#151310] border-white/5 flex flex-col gap-10">
                            {/* Top Spenders (Blue Theme) */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className={`text-xs font-black uppercase ${isAr ? 'tracking-normal' : 'tracking-[0.3em]'} text-white/30 flex items-center gap-3`}>
                                        <Users size={16} className="text-blue-400" />
                                        {isAr ? 'الأعلى إنفاقاً' : 'Top Spenders'}
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    {topSpenders.length === 0 ? (
                                        <div className="py-10 text-center opacity-20">
                                            <Users size={32} className="mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase">{isAr ? 'لا توجد بيانات' : 'No data'}</p>
                                        </div>
                                    ) : topSpenders.map((item: any, idx: number) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => onNavigate && onNavigate('customer-profile', item.id)}
                                            className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all cursor-pointer"
                                        >
                                            {/* Rank */}
                                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                idx === 0 ? 'bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/10 text-white/40'
                                            }`}>
                                                {idx + 1}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                                {item.avatar ? (
                                                    <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={16} className="text-white/20" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-black text-white truncate group-hover:text-blue-400 transition-colors">{item.name}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-white/30 font-bold uppercase mt-0.5">
                                                    <Package size={10} />
                                                    <span>{item.ordersCount} {isAr ? 'عمليات' : 'Orders'}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="block text-xs font-black text-white font-mono">{item.totalSpent.toLocaleString()} <span className="text-[9px] text-blue-400">AED</span></span>
                                                <ArrowUpRight size={12} className="text-white/10 group-hover:text-blue-400 transition-colors inline-block mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                            {/* Top Earners (Gold Theme) */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className={`text-xs font-black uppercase ${isAr ? 'tracking-normal' : 'tracking-[0.3em]'} text-white/30 flex items-center gap-3`}>
                                        <Crown size={16} className="text-gold-400" />
                                        {isAr ? 'التجار الأعلى أرباحاً' : 'Top Earning Merchants'}
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    {topEarners.length === 0 ? (
                                        <div className="py-10 text-center opacity-20">
                                            <Crown size={32} className="mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase">{isAr ? 'لا توجد بيانات' : 'No data'}</p>
                                        </div>
                                    ) : topEarners.map((item: any, idx: number) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => onNavigate && onNavigate('store-profile', item.id)}
                                            className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold-500/30 hover:bg-white/5 transition-all cursor-pointer"
                                        >
                                            {/* Rank */}
                                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                idx === 0 ? 'bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10 text-white/40'
                                            }`}>
                                                {idx + 1}
                                            </div>

                                            {/* Logo */}
                                            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                                {item.logo ? (
                                                    <img src={item.logo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Crown size={16} className="text-white/20" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[13px] font-black text-white truncate group-hover:text-gold-400 transition-colors">{item.name}</span>
                                                    {item.rating > 0 && (
                                                        <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/5 shrink-0">
                                                            <span className="text-[8px] font-black text-gold-400">{item.rating}</span>
                                                            <TrendingUp size={8} className="text-gold-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] text-white/30 font-bold uppercase">
                                                    <Package size={10} />
                                                    <span>{item.ordersCount} {isAr ? 'طلبات' : 'Orders'}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="block text-xs font-black text-white font-mono">{item.totalEarned.toLocaleString()} <span className="text-[9px] text-gold-500">AED</span></span>
                                                <span className="text-[8px] text-green-400 font-black uppercase tracking-tighter">Growth</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>

                        {/* 3b. Sales Trend Chart (Col 2 & 3) */}
                        <GlassCard className="p-8 bg-[#151310] border-white/5 lg:col-span-2 flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className={`text-xs font-black uppercase ${isAr ? 'tracking-normal' : 'tracking-[0.3em]'} text-white flex items-center gap-3`}>
                                        <TrendingUp size={18} className="text-gold-500" />
                                        {isAr ? 'اتجاه المبيعات (نظرة لحظية)' : 'Sales Trend (Realtime)'}
                                    </h4>
                                    <p className="text-[10px] text-white/30 uppercase mt-2">
                                        {isAr ? 'نظرة شاملة على أداء المنصة المالي' : 'Overview of platform financial performance'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-gold-400 font-mono">{kpis.totalSales.toLocaleString()} AED</span>
                                    <span className="block text-[10px] text-white/30 mt-1 uppercase">{t.admin.billing.kpis.totalSales}</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-h-[250px] w-full">
                                <BarChart
                                    data={salesTrendData}
                                    height={250}
                                    color="#A88B3E"
                                />
                            </div>
                        </GlassCard>
                    </div>


                </div>
            )}

            {activeTab === 'TRANSACTIONS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex flex-col xl:flex-row justify-end items-center gap-4">
                        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                            {/* Search */}
                            <div className="relative flex-1 md:flex-none group">
                                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-white/20 group-focus-within:text-gold-500 transition-colors`} />
                                <input
                                    type="text"
                                    placeholder={isAr ? 'بحث سريع...' : 'Quick search...'}
                                    className={`w-full md:w-64 bg-[#050505] border border-white/10 rounded-xl ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-xs text-white focus:border-gold-500/50 focus:bg-[#080808] outline-none transition-all placeholder:text-white/10 font-bold shadow-inner`}
                                    value={financialFilters.search || ''}
                                    onChange={e => setFinancialFilters({ search: e.target.value })}
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="relative" ref={typeDropdownRef}>
                                <div 
                                    onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all cursor-pointer font-black uppercase tracking-tighter shadow-xl text-xs ${
                                    isTypeFilterOpen ? 'bg-white/10 border-gold-500 text-gold-500' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                                }`}>
                                    <Filter size={16} className={isTypeFilterOpen ? 'text-gold-500' : 'text-gold-500/50'} />
                                    <span className="min-w-[80px]">
                                        {financialFilters.type === 'ALL' ? t.admin.billing.ledger.filters.directions : 
                                         financialFilters.type === 'DEBIT' ? t.admin.billing.ledger.filters.debit : t.admin.billing.ledger.filters.credit}
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isTypeFilterOpen ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isTypeFilterOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full mt-3 right-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                                        >
                                            <div className="p-2 space-y-1">
                                                {[
                                                    { value: 'ALL', label: t.admin.billing.ledger.filters.directions },
                                                    { value: 'DEBIT', label: t.admin.billing.ledger.filters.debit },
                                                    { value: 'CREDIT', label: t.admin.billing.ledger.filters.credit }
                                                ].map((opt) => (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setFinancialFilters({ type: opt.value });
                                                            setIsTypeFilterOpen(false);
                                                        }}
                                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${
                                                            financialFilters.type === opt.value 
                                                            ? 'bg-gold-500 text-black font-black' 
                                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-tight">{opt.label}</span>
                                                        {financialFilters.type === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-black shadow-sm" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Role Filter */}
                            <div className="relative" ref={roleDropdownRef}>
                                <div 
                                    onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all cursor-pointer font-black uppercase tracking-tighter shadow-xl text-xs ${
                                    isRoleFilterOpen ? 'bg-white/10 border-gold-500 text-gold-500' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                                }`}>
                                    <Users size={16} className={isRoleFilterOpen ? 'text-gold-500' : 'text-gold-500/50'} />
                                    <span className="min-w-[80px]">
                                        {financialFilters.role === 'ALL' ? t.admin.billing.ledger.filters.roles : 
                                         financialFilters.role === 'VENDOR' ? t.admin.billing.ledger.filters.vendors : t.admin.billing.ledger.filters.customers}
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isRoleFilterOpen ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isRoleFilterOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full mt-3 right-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                                        >
                                            <div className="p-2 space-y-1">
                                                {[
                                                    { value: 'ALL', label: t.admin.billing.ledger.filters.roles },
                                                    { value: 'VENDOR', label: t.admin.billing.ledger.filters.vendors },
                                                    { value: 'CUSTOMER', label: t.admin.billing.ledger.filters.customers }
                                                ].map((opt) => (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setFinancialFilters({ role: opt.value });
                                                            setIsRoleFilterOpen(false);
                                                        }}
                                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${
                                                            financialFilters.role === opt.value 
                                                            ? 'bg-gold-500 text-black font-black' 
                                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-tight">{opt.label}</span>
                                                        {financialFilters.role === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-black shadow-sm" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Export */}
                            <button 
                                onClick={() => exportFinancialCSV()}
                                className="flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-2xl shadow-gold-500/20 active:scale-95 group"
                            >
                                <Download size={16} className="group-hover:bounce" />
                                <span>{isAr ? 'تصدير' : 'Export'}</span>
                            </button>
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
                                                    {/* Bank Details Button — always visible for any withdrawal */}
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedWithdrawalReq(req);
                                                            setShowBankModal(true);
                                                        }} 
                                                        className="w-11 h-11 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20 flex items-center justify-center group/btn"
                                                        title={isAr ? 'عرض البيانات البنكية' : 'View Bank Details'}
                                                    >
                                                        <Landmark size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>

                                                    {req.status === 'PENDING' && isSuperAdmin && (
                                                        <>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedWithdrawalReq(req);
                                                                    setShowPayoutModal(true);
                                                                }} 
                                                                className="w-11 h-11 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center group/btn"
                                                                title={t.admin.billing.withdrawals.actions.execute}
                                                            >
                                                                <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedWithdrawalReq(req);
                                                                    setShowRejectModal(true);
                                                                }} 
                                                                className="w-11 h-11 rounded-xl transition-all border flex items-center justify-center group/btn bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20"
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
            <ManualPayoutModal
                show={showPayoutModal}
                onClose={() => {
                    setShowPayoutModal(false);
                    setSelectedWithdrawalReq(null);
                }}
                currentAdmin={currentAdmin}
                t={t}
                isAr={isAr}
                sendManualPayout={sendManualPayout}
                processWithdrawal={processWithdrawal}
                selectedRequest={selectedWithdrawalReq}
            />

            {/* 6. Reject Withdrawal Modal */}
            <RejectWithdrawalModal 
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedWithdrawalReq(null);
                }}
                request={selectedWithdrawalReq}
            />

            {/* 7. Bank Details Modal */}
            {showBankModal && selectedWithdrawalReq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBankModal(false)} />
                    <div className="relative w-full max-w-md bg-[#0F1014] rounded-2xl border border-blue-500/20 shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500/10 bg-blue-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Landmark size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-blue-500 tracking-wider">
                                        {isAr ? 'البيانات البنكية' : 'Bank Details'}
                                    </h2>
                                </div>
                            </div>
                            <button onClick={() => setShowBankModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X size={20} className="text-white/40 hover:text-white" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(() => {
                                const entity = selectedWithdrawalReq.role === 'CUSTOMER' ? selectedWithdrawalReq.user : selectedWithdrawalReq.store;
                                if (!entity?.bankIban && !entity?.bankName) {
                                    return (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500">
                                            <AlertOctagon size={24} />
                                            <span className="text-sm font-bold">{isAr ? 'لم يقم المستخدم بإضافة بيانات بنكية بعد.' : 'User has not added bank details yet.'}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="space-y-4">
                                        <div className="bg-[#14151A] p-4 rounded-xl border border-white/5 space-y-3">
                                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                                <span className="text-xs text-white/40 uppercase">{isAr ? 'حالة التوثيق' : 'Verification Status'}</span>
                                                {entity.bankDetailsVerified ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                                                        <CheckCircle2 size={12} /> {isAr ? 'موثق' : 'Verified'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                                                        <AlertOctagon size={12} /> {isAr ? 'غير موثق' : 'Unverified'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-white/40 uppercase">{isAr ? 'اسم البنك' : 'Bank Name'}</span>
                                                <span className="text-sm font-bold text-white">{entity.bankName || '---'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-white/40 uppercase">{isAr ? 'اسم صاحب الحساب' : 'Account Holder'}</span>
                                                <span className="text-sm font-bold text-white">{entity.bankAccountHolder || '---'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-white/40 uppercase">IBAN</span>
                                                <span className="text-sm font-mono font-bold text-gold-500 break-all">{entity.bankIban || '---'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-white/40 uppercase">SWIFT Code</span>
                                                <span className="text-sm font-mono font-bold text-white break-all">{entity.bankSwift || '---'}</span>
                                            </div>

                                            {!entity.bankDetailsVerified && (
                                                <div className="pt-4 mt-2 border-t border-white/5">
                                                    <button
                                                        onClick={async () => {
                                                            const res = await verifyBankDetails(entity.id, selectedWithdrawalReq.role);
                                                            if (res.success) {
                                                                alert(isAr ? 'تم التوثيق بنجاح' : 'Verified successfully');
                                                            } else {
                                                                alert(isAr ? 'فشل التوثيق' : 'Verification failed');
                                                            }
                                                        }}
                                                        className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-500 hover:text-white transition-all text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 group/verifybtn"
                                                    >
                                                        <ShieldCheck size={18} className="group-hover/verifybtn:scale-110 transition-transform" />
                                                        {isAr ? 'توثيق البيانات البنكية للعميل' : 'Verify Bank Details'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
