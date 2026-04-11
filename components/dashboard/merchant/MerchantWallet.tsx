import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    TrendingUp, 
    Clock, 
    AlertCircle, 
    ArrowDownLeft, 
    ArrowUpRight, 
    Download, 
    Calendar, 
    Search,
    ChevronRight,
    FileText,
    RotateCcw,
    Star,
    Crown,
    ShieldCheck,
    Target,
    Zap,
    Percent,
    MessageCircle,
    Copy,
    Share2,
    ExternalLink,
    CheckCircle2,
    LayoutGrid,
    CreditCard,
    UserPlus,
    Bell,
    ShoppingBag,
    Link as LinkIcon
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMerchantWalletStore, subscribeToMerchantWalletUpdates } from '../../../stores/useMerchantWalletStore';
import { getCurrentUser } from '../../../utils/auth';

interface MerchantWalletProps {
    onNavigate?: (path: string, id?: any) => void;
}

export const MerchantWallet: React.FC<MerchantWalletProps> = ({ onNavigate }) => {
    const { language } = useLanguage();
    const { stats, transactions, notifications, fetchWallet, isLoading } = useMerchantWalletStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [filter, setFilter] = useState<'ALL' | 'DONE' | 'PENDING'>('ALL');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const isAr = language === 'ar';
    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchWallet();
        if (currentUser?.id) {
            const unsubscribe = subscribeToMerchantWalletUpdates(currentUser.id);
            return () => {
                unsubscribe();
            };
        }
    }, [fetchWallet, currentUser?.id]);

    const handleCopyReferral = () => {
        if (!stats?.referralCode) return;
        const url = `${window.location.origin}/register?ref=${stats.referralCode}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleWithdrawalRequest = () => {
        // Redirection to Stripe/Settings as per user request
        alert(isAr ? 'سيتم توجيهك الآن لربط حساب Stripe. يرجى إتمام العملية ثم إرسال الكود للإدارة.' : 'Redirecting to Stripe linking. Please complete the process and share account info with admin.');
        onNavigate?.('settings');
    };

    // Filtering Logic (Preserved)
    const filteredTransactions = useMemo(() => {
        let result = transactions;

        if (filter === 'DONE') {
            result = result.filter(tx => tx.type === 'CREDIT');
        } else if (filter === 'PENDING') {
            result = result.filter(tx => tx.transactionType === 'PENDING' || tx.type === 'PENDING');
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(tx => 
                (tx.id && tx.id.toLowerCase().includes(q)) || 
                (tx.payment?.order?.orderNumber && tx.payment.order.orderNumber.toLowerCase().includes(q)) ||
                (tx.amount?.toString().includes(q))
            );
        }

        if (dateRange.start) {
            const start = new Date(dateRange.start);
            result = result.filter(tx => new Date(tx.createdAt) >= start);
        }
        if (dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            result = result.filter(tx => new Date(tx.createdAt) <= end);
        }

        return result;
    }, [transactions, filter, searchQuery, dateRange]);

    const handleDownloadReport = async () => {
        setIsGeneratingReport(true);
        try {
            const date = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
            const html = `
                <div style="padding: 40px; font-family: 'Inter', 'Segoe UI', sans-serif; color: #1a1a1a; background: white; min-height: 100vh; line-height: 1.5; position: relative;" dir="${isAr ? 'rtl' : 'ltr'}">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 150px; color: rgba(168, 139, 62, 0.03); font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; user-select: none;">
                        E-TASHLEH MERCHANT
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E5E7EB; padding-bottom: 30px; margin-bottom: 40px; position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="/logo.png" style="width: 50px; height: 50px; object-fit: contain;" />
                            <div>
                                <h1 style="color: #A88B3E; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">E-TASHLEH</h1>
                                <p style="margin: 5px 0 0; font-size: 14px; color: #666; font-weight: 800; text-transform: uppercase;">${isAr ? 'كشف المبيعات والتحصيل المالي' : 'Merchant Earnings Statement'}</p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="margin: 0; font-size: 14px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px;">${isAr ? 'رقم التقرير' : 'Report No.'}</h2>
                            <p style="margin: 2px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a; font-family: monospace;">#MR-${new Date().getTime().toString().slice(-8)}</p>
                        </div>
                    </div>
                    <!-- Table Body (Omitting full CSS for brevity but keeping logic) -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; position: relative; z-index: 1;">
                        <thead>
                            <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB;">
                                <th style="padding: 15px 12px; text-align: ${isAr ? 'right' : 'left'}; font-size: 11px; font-weight: 800;">ORDER #</th>
                                <th style="padding: 15px 12px; text-align: right;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredTransactions.map(tx => `
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 15px 12px;">#${tx.payment?.order?.orderNumber || tx.id.slice(0, 8)}</td>
                                    <td style="padding: 15px 12px; text-align: right;">${Math.abs(Number(tx.amount)).toLocaleString()} AED</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><body>${html}</body></html>`);
                printWindow.document.close();
                setTimeout(() => { printWindow.print(); setIsGeneratingReport(false); }, 500);
            }
        } catch (error) { setIsGeneratingReport(false); }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            'COMPLETED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'SUCCESS': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'SHIPPED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'PREPARATION': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'CANCELLED': 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tight ${styles[status?.toUpperCase()] || 'bg-white/5 text-white/50 border-white/10'}`}>
                {isAr ? (status === 'COMPLETED' ? 'مكتمل' : status === 'SHIPPED' ? 'تم الشحن' : 'تجهيز') : status}
            </span>
        );
    };

    const StatCard = ({ label, value, unit, icon: Icon, colorClass, bgClass, borderClass }: any) => (
        <GlassCard className={`p-4 sm:p-5 flex flex-col justify-between min-h-[110px] ${borderClass || 'border-white/5'}`}>
            <div className="flex justify-between items-start w-full">
                <p className={`${colorClass || 'text-white/30'} text-[10px] font-black uppercase tracking-wider mb-1`}>{label}</p>
                <div className={`p-1.5 ${bgClass || 'bg-white/5'} rounded-lg ${colorClass || 'text-white/40'} border border-white/10 shrink-0`}>
                    <Icon size={14} />
                </div>
            </div>
            <h2 className="text-xl font-bold text-white leading-none mt-2 truncate">
                {Number(value || 0).toLocaleString()} <span className="text-[10px] text-white/30 font-medium">{unit}</span>
            </h2>
        </GlassCard>
    );

    return (
        <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            {/* 1. Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold-500/10 rounded-xl border border-gold-500/20 shadow-lg shadow-gold-500/5">
                        <Wallet className="text-gold-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {isAr ? 'لوحة تحكم التاجر (Financial)' : 'Merchant Dashboard'}
                        </h1>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-1 font-medium">
                            {isAr ? 'إدارة مبيعاتك، أرباح الولاء، والعمليات المالية.' : 'Manage your sales, loyalty profits, and financial operations.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative group flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-500 transition-colors" size={14} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isAr ? 'بحث برقم الطلب...' : 'Search Order ID...'} 
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-gold-500/50 transition-all w-full md:w-56"
                            />
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                            <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-2 py-2 text-[10px] outline-none focus:border-gold-500/50 transition-all w-40 text-white/70"
                            />
                        </div>
                    </div>
                    <button 
                        disabled={isGeneratingReport} onClick={handleDownloadReport}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-gold-500/20 hover:border-gold-500/40 transition-all text-white/70 hover:text-gold-500 disabled:opacity-50"
                    >
                        {isGeneratingReport ? <RotateCcw size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                </div>
            </div>

            {/* 2. Primary Stat Cards (Legacy Stats Restored) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <StatCard label={isAr ? 'الرصيد المستحق' : 'Available Balance'} value={stats.available} unit="AED" icon={Wallet} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" borderClass="border-emerald-500/10" />
                <StatCard label={isAr ? 'الرصيد المعلق' : 'Pending Balance'} value={stats.pending} unit="AED" icon={Clock} colorClass="text-amber-400" bgClass="bg-amber-500/10" borderClass="border-amber-500/10" />
                <StatCard label={isAr ? 'أرصدة مجمدة' : 'Frozen Funds'} value={stats.frozen} unit="AED" icon={ShieldCheck} colorClass="text-rose-400" bgClass="bg-rose-500/10" borderClass="border-rose-500/10" />
                <StatCard label={isAr ? 'إجمالي المبيعات' : 'Total Sales'} value={stats.totalSales} unit="AED" icon={LayoutGrid} colorClass="text-blue-400" bgClass="bg-blue-500/10" borderClass="border-blue-500/10" />
                <StatCard label={isAr ? 'صافي الأرباح' : 'Net Earnings'} value={stats.netEarnings} unit="AED" icon={TrendingUp} colorClass="text-purple-400" bgClass="bg-purple-500/10" borderClass="border-purple-500/10" />
                <StatCard label={isAr ? 'الطلبات الناجحة' : 'Successful Orders'} value={stats.completedOrders} unit={isAr ? 'طلب' : 'Orders'} icon={FileText} colorClass="text-gold-500" bgClass="bg-gold-500/10" borderClass="border-gold-500/10" />
            </div>

            {/* 3. Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                
                {/* 3a. Transaction Table & Loyalty Progression */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Transaction Ledger */}
                    <GlassCard className="p-0 overflow-hidden relative border-white/5">
                        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
                            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tighter">
                                {isAr ? 'سجل الطلبات والدفع' : 'Orders & Payment Log'}
                            </h3>
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                                {['ALL', 'DONE', 'PENDING'].map((f) => (
                                    <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 text-[10px] sm:text-xs font-black rounded-lg transition-all ${filter === f ? 'bg-gold-500 text-black' : 'text-white/40 hover:text-white'}`}>
                                        {f === 'ALL' ? (isAr ? 'الكل' : 'All') : f === 'DONE' ? (isAr ? 'المنجزة' : 'Done') : (isAr ? 'المعلقة' : 'Pending')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] text-white/30 uppercase tracking-widest font-black">
                                        <th className="px-4 py-5 font-black">{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'المبلغ' : 'Amount'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'حالة الدفع' : 'Payment Status'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'حالة الطلب' : 'Order Status'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'نوع العملية' : 'Process Type'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-white/20 font-black text-xs">LOADING...</td></tr>
                                    ) : filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-all group">
                                            <td className="px-4 py-4"><code className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-gold-500/80">#{tx.payment?.order?.orderNumber || tx.id.slice(0, 8).toUpperCase()}</code></td>
                                            <td className="px-4 py-4 font-bold text-white"><span className={tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-amber-400'}>{tx.type === 'CREDIT' ? '+' : '-'}{Math.abs(Number(tx.amount)).toLocaleString()}</span> <small>AED</small></td>
                                            <td className="px-4 py-4"><StatusBadge status="SUCCESS" /></td>
                                            <td className="px-4 py-4"><StatusBadge status={tx.payment?.order?.status || 'PREPARATION'} /></td>
                                            <td className="px-4 py-4 text-[10px] font-black uppercase text-white/40">{isAr ? (tx.transactionType === 'REFERRAL_PROFIT' ? 'ربح إحالة' : 'مبيعات') : tx.transactionType || 'PAYMENT'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Integrated Merchant Loyalty Progression (REFINED) */}
                    <GlassCard className="p-6 sm:p-8 relative overflow-hidden group bg-gradient-to-br from-gold-500/5 to-transparent border-white/5">
                        <div className="absolute top-0 right-0 p-32 bg-gold-500/5 rounded-full -mr-16 -mt-16 blur-4xl pointer-events-none group-hover:bg-gold-500/10 transition-colors" />
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10">
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-black to-white/5 border border-gold-500/30 flex items-center justify-center shadow-2xl group-hover:shadow-gold-500/10 transition-colors">
                                    <Crown className="text-gold-500 w-10 h-10 sm:w-12 sm:h-12" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-gold-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#1A1814] uppercase">{stats.loyaltyTier}</div>
                            </div>
                            <div className="flex-1 w-full">
                                <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-tighter mb-4 text-center md:text-start">
                                    {isAr ? 'تطور مستوى العضوية المستحقة' : 'Merchant Tier Progression'}
                                </h3>
                                {(() => {
                                    const nextMap: Record<string, number> = { BRONZE: 5000, SILVER: 20000, GOLD: 100000, PLATINUM: 500000 };
                                    const nextLimit = nextMap[stats.loyaltyTier] || 1000000;
                                    const progress = Math.min((stats.totalSales / nextLimit) * 100, 100);
                                    return (
                                        <div className="space-y-3">
                                            <div className="h-2.5 bg-black/60 rounded-full border border-white/10 p-0.5 relative overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-gold-700 to-gold-400 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-white/30 tracking-widest">
                                                <span>{stats.totalSales.toLocaleString()} / {nextLimit.toLocaleString()} AED</span>
                                                <span className="text-gold-500/70">{Math.round(progress)}% {isAr ? 'مكتمل' : 'COMPLETE'}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3b. Sidebar (MATCHED TO CUSTOMER) */}
                <div className="space-y-6">
                    
                    {/* Activity Feed Notifications */}
                    <GlassCard className="p-6 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h3 className="text-[10px] font-black text-white/80 uppercase tracking-widest">{isAr ? 'أحدث التنبيهات' : 'Activity Feed'}</h3>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {notifications.length > 0 ? notifications.slice(0, 3).map((n, i) => (
                                <div key={i} className="flex gap-3 items-start group relative">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:text-gold-500 group-hover:bg-gold-500/10 transition-colors">
                                        <Bell size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-white/70 leading-relaxed font-medium line-clamp-2">{isAr ? n.titleAr : n.titleEn}</p>
                                        <span className="block text-[9px] text-white/20 mt-1 font-black uppercase tracking-tighter">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • JUST NOW
                                        </span>
                                    </div>
                                </div>
                            )) : <p className="text-center text-[10px] text-white/20 py-8 uppercase tracking-widest">Quiet for now</p>}
                        </div>
                    </GlassCard>

                    {/* PREMIUM Referral Social Hub (STOLEN FROM CUSTOMER) */}
                    <GlassCard className="p-6 border-blue-500/20 relative group bg-gradient-to-br from-blue-600/[0.08] via-transparent to-transparent overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none" />
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2 relative z-10">
                            {isAr ? 'نظام الإحالات' : 'Referral Hub'}
                            <span className="w-1 h-4 bg-gold-500 rounded-full" />
                        </h3>
                        <div className="mt-2 mb-5 px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full inline-block relative z-10">
                            <span className="text-[10px] font-black text-gold-500 uppercase tracking-tighter">{isAr ? 'عدد الإحالات' : 'REFS'} {stats.referralCount}</span>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl opacity-20 group-hover/input:opacity-40 transition-opacity blur" />
                                <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl overflow-hidden">
                                     <input readOnly value={`${window.location.origin}/register?ref=${stats.referralCode || ''}`} className="flex-1 bg-transparent px-4 py-3.5 text-[10px] font-mono font-bold text-blue-400 outline-none truncate" />
                                    <button onClick={handleCopyReferral} className="p-3.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-blue-400 border-l border-white/10">
                                        <AnimatePresence mode="wait">
                                            {copied ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key="check"><CheckCircle2 size={16} className="text-blue-400" /></motion.div> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key="copy"><Copy size={16} /></motion.div>}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleCopyReferral} className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                                {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                                {copied ? (isAr ? 'تم النسخ!' : 'LINK COPIED!') : (isAr ? 'دعوة صديق الآن' : 'INVITE PARTNER')}
                            </button>

                            {/* Referral Progression Timeline */}
                            <div className="relative pt-6 pb-2">
                                <div className="absolute top-[38px] left-[15%] right-[15%] h-[2px] bg-white/5 z-0 hidden sm:block rounded-full">
                                    <motion.div initial={{ width: 0 }} animate={{ width: stats.referralCount > 0 ? (stats.referralCount > 5 ? '100%' : '50%') : '0%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                </div>
                                <div className="relative z-10 flex justify-between items-start">
                                    {[
                                        { icon: Share2, label: isAr ? 'شارك' : 'Share', act: true },
                                        { icon: UserPlus, label: isAr ? 'انضمام' : 'Join', act: stats.referralCount > 0 },
                                        { icon: Star, label: isAr ? 'اربح' : 'Earn', act: stats.referralCount > 5 }
                                    ].map((s, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 w-1/3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${s.act ? 'bg-blue-600 border-blue-400 text-white scale-110' : 'bg-[#151310] border-white/5 text-white/20'}`}>
                                                <s.icon size={16} />
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-tight text-center ${s.act ? 'text-blue-400' : 'text-white/20'}`}>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* PREMIUM Wallet Quick Panel (REFINED AS PER REQUEST) */}
                    <GlassCard className="p-6 border-gold-500/20 bg-gradient-to-br from-gold-500/[0.04] via-transparent to-transparent group">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-400/20 text-gold-500"><Wallet size={16} /></div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{isAr ? 'العمليات السريعة' : 'Instant Actions'}</h3>
                            </div>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">{isAr ? 'أرباح الولاء والعمولات' : 'Total Loyalty & Commissions'}</p>
                                    <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                        <Star size={10} /><span className="text-[10px] font-black">{stats.loyaltyPoints} pts</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <h2 className="text-2xl font-black text-white tracking-tighter">
                                        {Number(stats.available).toLocaleString()} <span className="text-xs text-gold-500/60 font-medium ml-2">AED</span>
                                    </h2>
                                    <div className="text-[10px] font-bold text-white/40">+{stats.pendingRewards} {isAr ? 'معلق' : 'Pending'}</div>
                                </div>
                            </div>
                            <button onClick={handleWithdrawalRequest} className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-black text-[10px] font-black rounded-xl transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-3 uppercase tracking-[2px]">
                                <Download size={14} />{isAr ? 'سحب الارباح' : 'Withdraw Profits'}
                            </button>
                            <div className="flex items-center justify-center gap-2 mt-2 opacity-30">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white">{isAr ? 'نظام تشفير فائق السرعة' : 'SECURE QUANTUM SHIELD ACTIVE'}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
