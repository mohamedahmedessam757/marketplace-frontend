import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    CreditCard, 
    TrendingUp, 
    Clock, 
    ClipboardCheck, 
    ShieldCheck, 
    Percent, 
    Crown, 
    FileText, 
    Copy, 
    CheckCircle2, 
    Link as LinkIcon, 
    ArrowRightLeft, 
    Download, 
    Calendar, 
    Search,
    ChevronRight,
    ArrowUpRight,
    ExternalLink,
    AlertCircle,
    UserPlus,
    RotateCcw,
    ShoppingBag,
    Star,
    Share2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCustomerWalletStore, subscribeToWalletUpdates } from '../../../stores/useCustomerWalletStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

interface WalletViewProps {
    onNavigate?: (path: string, id?: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onNavigate }) => {
    const { language, t } = useLanguage();
    const { stats, transactions, isLoading, fetchWalletData } = useCustomerWalletStore();
    const { notifications, fetchNotifications } = useNotificationStore();
    const [copied, setCopied] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
    
    const isAr = language === 'ar';

    useEffect(() => {
        fetchWalletData();
        const sub = subscribeToWalletUpdates();
        return () => {
            sub?.unsubscribe();
        };
    }, [fetchWalletData]);

    const handleCopyReferral = () => {
        if (!stats?.referralCode) return;
        const url = `${window.location.origin}/register?ref=${stats.referralCode}`;
        
        const fallbackCopy = (text: string) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => setCopied(true))
                .catch(() => fallbackCopy(url));
        } else {
            fallbackCopy(url);
        }

        setTimeout(() => setCopied(false), 3000);
    };

    const filteredTransactions = useMemo(() => {
        if (filter === 'ALL') return transactions;
        if (filter === 'COMPLETED') return transactions.filter(tx => tx.status === 'SUCCESS' || tx.status === 'COMPLETED');
        if (filter === 'PENDING') return transactions.filter(tx => tx.status === 'PENDING');
        return transactions;
    }, [transactions, filter]);

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'COMPLETED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'SUCCESS': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'PENDING': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'FAILED': 'bg-red-500/10 text-red-400 border-red-500/20',
            'REFUNDED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'DELIVERED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'PAID': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'CANCELLED': 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return styles[status?.toUpperCase()] || 'bg-white/5 text-white/50 border-white/10';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'COMPLETED': isAr ? 'مكتمل' : 'Completed',
            'SUCCESS': isAr ? 'ناجح' : 'Success',
            'PENDING': isAr ? 'قيد الانتظار' : 'Pending',
            'FAILED': isAr ? 'فاشل' : 'Failed',
            'REFUNDED': isAr ? 'مسترجع' : 'Refunded',
            'DELIVERED': isAr ? 'تم التوصيل' : 'Delivered',
            'PAID': isAr ? 'تم الدفع' : 'Paid',
            'CANCELLED': isAr ? 'ملغي' : 'Cancelled',
        };
        return labels[status?.toUpperCase()] || status;
    };

    // Helper for Stat Card to avoid overlap
    const StatCard = ({ label, value, unit, icon: Icon, colorClass, borderClass, bgClass }: any) => (
        <GlassCard className={`p-4 sm:p-5 flex flex-col justify-between min-h-[100px] sm:min-h-[110px] ${borderClass || ''}`}>
            <div className="flex justify-between items-start w-full">
                <p className={`${colorClass || 'text-white/30'} text-[10px] font-black uppercase tracking-wider mb-1`}>{label}</p>
                <div className={`p-1.5 ${bgClass || 'bg-white/5'} rounded-lg ${colorClass || 'text-white/40'} border border-white/10 shrink-0`}>
                    <Icon size={14} className="sm:size-[16px]" />
                </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-none mt-2 truncate">
                {value} <span className="text-[10px] text-white/30 font-medium">{unit}</span>
            </h2>
        </GlassCard>
    );

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 px-2 sm:px-0" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* 1. Header Navigation & Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold-500/10 rounded-xl border border-gold-500/20 hidden sm:block">
                        <Wallet className="text-gold-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white leading-none truncate max-w-[250px] sm:max-w-none">
                            {isAr ? 'لوحة تحكم العميل (Dashboard)' : 'Customer Dashboard'}
                        </h1>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-1.5 font-medium">
                            {isAr ? 'أهلاً بك في منصتك المالية والولاء المتكاملة.' : 'Welcome to your integrated financial and loyalty platform.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-500 transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder={isAr ? 'البحث...' : 'Search...'} 
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-gold-500/50 transition-all w-full md:w-48"
                        />
                    </div>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/70">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* 2. Primary Stat Cards (Legacy Restoration) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <StatCard 
                    label={isAr ? 'الرصيد المتاح' : 'Available Balance'}
                    value={Number(stats?.customerBalance || 0).toLocaleString()}
                    unit="AED"
                    icon={Wallet}
                    colorClass="text-emerald-400"
                    bgClass="bg-emerald-500/10"
                    borderClass="border-emerald-500/10"
                />
                <StatCard 
                    label={isAr ? 'إجمالي المشتريات' : 'Total Spent'}
                    value={Number(stats?.totalSpent || 0).toLocaleString()}
                    unit="AED"
                    icon={ShoppingBag}
                />
                <StatCard 
                    label={isAr ? 'الطلبات المكتملة' : 'Completed Orders'}
                    value={stats?.completedOrders || 0}
                    unit={isAr ? 'طلب' : 'Orders'}
                    icon={ClipboardCheck}
                />
                <StatCard 
                    label={isAr ? 'المبالغ المستردة' : 'Refunded'}
                    value={Number(stats?.refundedAmount || 0).toLocaleString()}
                    unit="AED"
                    icon={RotateCcw}
                    colorClass="text-rose-400"
                    bgClass="bg-rose-500/10"
                    borderClass="border-rose-500/10"
                />
                <StatCard 
                    label={isAr ? 'نقاط الولاء' : 'Points'}
                    value={stats?.loyaltyPoints || 0}
                    unit=""
                    icon={Star}
                    colorClass="text-gold-500"
                    bgClass="bg-gold-500/10"
                    borderClass="border-gold-500/10"
                />
                <StatCard 
                    label={isAr ? 'المستوى' : 'Tier'}
                    value={stats?.loyaltyTier || 'BASIC'}
                    unit={`[${stats?.referralCount || 0} ${isAr ? 'إحالة' : 'Ref'}]`}
                    icon={Crown}
                    colorClass="text-purple-400"
                    bgClass="bg-purple-500/10"
                    borderClass="border-purple-500/10"
                />
            </div>

            {/* 3. Main Dashboard Row (Income Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <GlassCard className="p-5 sm:p-6 relative overflow-hidden group bg-gradient-to-br from-white/[0.04] to-transparent">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2">{isAr ? 'أرباح مكافآت (قيد الانتظار)' : 'Loyalty Profits (Pending)'}</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2">
                                {Number(stats?.pendingEarnings || 0).toLocaleString()} <span className="text-xs text-white/30 font-medium">AED</span>
                            </h2>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5 group-hover:bg-amber-500/20 transition-colors">
                            <Clock className="text-amber-400" size={20} />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5 sm:p-6 relative overflow-hidden group bg-gradient-to-br from-white/[0.04] to-transparent">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2">{isAr ? 'أرباح مكافآت هذا الشهر' : 'Loyalty Profits (Monthly)'}</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-baseline gap-2">
                                {Number(stats?.monthlySpent || 0).toLocaleString()} <span className="text-xs text-white/30 font-medium">AED</span>
                            </h2>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:bg-blue-500/20 transition-colors">
                            <TrendingUp className="text-blue-400" size={20} />
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:col-span-2 lg:col-span-1">
                    <GlassCard className="p-4 flex flex-col justify-center bg-white/[0.02] border-white/5 border-l-2 border-l-emerald-500/30">
                        <p className="text-[10px] text-white/30 uppercase font-black">{isAr ? 'نسبة القبول' : 'Acceptance'}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-emerald-400">
                            <ShieldCheck size={16} />
                            <span className="text-lg font-bold sm:text-xl tracking-tighter">{stats?.acceptanceRate || 0}%</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex flex-col justify-center bg-white/[0.02] border-white/5 border-l-2 border-l-purple-500/30">
                        <p className="text-[10px] text-white/30 uppercase font-black">{isAr ? 'نسبة الربح' : 'Profit'}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-purple-400">
                            <Percent size={16} />
                            <span className="text-lg font-bold sm:text-xl tracking-tighter">4%</span>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* 4. Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                
                {/* 4a. Transaction Table (Legacy Style) */}
                <div className="lg:col-span-3 space-y-6">
                    <GlassCard className="p-0 overflow-hidden relative border-white/5">
                        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                                {isAr ? 'سجل الطلبات والدفع' : 'Orders & Payment Log'}
                            </h3>
                            <div className="flex p-0.5 sm:p-1 bg-black/40 rounded-xl border border-white/5">
                                {['ALL', 'COMPLETED', 'PENDING'].map((f) => (
                                    <button 
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${filter === f ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {f === 'ALL' ? (isAr ? 'الكل' : 'All') : f === 'COMPLETED' ? (isAr ? 'المكتملة' : 'Completed') : (isAr ? 'قيد الانتظار' : 'Pending')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto relative">
                            {/* Mobile Scroll Indicator */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none sm:hidden" />
                            
                            <table className="w-full text-sm text-center border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] text-white/30 uppercase tracking-widest font-black">
                                        <th className="px-4 py-5 font-black">{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'التاريخ' : 'Date'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'المبلغ' : 'Amount'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'حالة الدفع' : 'Payment Status'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'حالة الطلب' : 'Order Status'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'نوع العملية' : 'Process Type'}</th>
                                        <th className="px-4 py-5 font-black">{isAr ? 'الإجراء' : 'Action'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={7} className="p-12 text-center text-white/20 font-black tracking-widest text-xs">{isAr ? 'جاري التحميل...' : 'LOADING DATA...'}</td></tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr><td colSpan={7} className="p-12 text-center text-white/20 font-black tracking-widest text-xs uppercase">{isAr ? 'لا توجد معاملات مطابقة' : 'NO DATA FOUND'}</td></tr>
                                    ) : (
                                        filteredTransactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-4 py-4">
                                                    <span className="font-mono font-bold text-white group-hover:text-gold-500 transition-colors">#{tx.order?.orderNumber || '---'}</span>
                                                </td>
                                                <td className="px-4 py-4 font-mono text-white/40 text-[11px]">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-US')}
                                                </td>
                                                <td className="px-4 py-4 font-bold text-white">
                                                    {Number(tx.totalAmount).toLocaleString()} <span className="text-[10px] text-white/20">AED</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase border tracking-tight ${getStatusStyle(tx.status)}`}>
                                                        {getStatusLabel(tx.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase border bg-white/5 border-white/10 text-white/60 tracking-tight`}>
                                                        {getStatusLabel(tx.order?.status || '---')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/60">
                                                        <span className={tx.status === 'REFUNDED' ? 'text-rose-400' : 'text-emerald-400 font-bold'}>
                                                            {tx.status === 'REFUNDED' ? '↙' : '↗'}
                                                        </span>
                                                        {tx.status === 'REFUNDED' ? (isAr ? 'استرداد' : 'Refund') : (isAr ? 'دفع' : 'Payment')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button 
                                                        onClick={() => onNavigate?.('order-details', tx.order?.id)}
                                                        className="p-2 bg-white/5 hover:bg-gold-500 hover:text-black text-white/30 rounded-lg transition-all border border-white/10 group-hover:border-gold-500/50"
                                                    >
                                                        <FileText size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 text-[10px] font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest outline-none">
                                {isAr ? 'عرض جميع السجلات المالية' : 'View Financial Records History'}
                            </button>
                        </div>
                    </GlassCard>

                    {/* Integrated Loyalty Progress */}
                    <GlassCard className="p-6 sm:p-8 relative overflow-hidden border-white/5 group">
                        <div className="absolute top-0 right-0 p-32 bg-gold-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-gold-500/10 transition-colors" />
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-black to-white/5 border border-gold-500/30 flex items-center justify-center shadow-[0_10px_40px_rgba(212,175,55,0.1)] group-hover:shadow-[0_10px_40px_rgba(212,175,55,0.2)] transition-shadow">
                                    <Crown className="text-gold-500 w-10 h-10 sm:w-12 sm:h-12" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-gold-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#1A1814] uppercase tracking-tighter">
                                    {stats?.loyaltyTier || 'BASIC'}
                                </div>
                            </div>

                            <div className="flex-1 w-full text-center md:text-start">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 uppercase tracking-tighter">{isAr ? 'تطور مستوى العضوية المستحقة' : 'Membership Loyalty Progression'}</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-white/40">
                                        <span className="flex items-center gap-2"><CreditCard size={12} className="text-gold-500/50" /> {Number(stats?.totalSpent || 0).toLocaleString()} AED</span>
                                        <span className="text-gold-500 flex items-center gap-1">GOAL: 25,000 <TrendingUp size={12} /></span>
                                    </div>
                                    <div className="h-4 bg-black/60 rounded-full border border-white/10 p-1 relative overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(((Number(stats?.totalSpent || 0)) / 25000) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                        />
                                    </div>
                                    <p className="text-[9px] text-white/20 uppercase font-black text-center md:text-start leading-relaxed">
                                        {isAr ? 'قم بإنفاق المزيد للوصول إلى المستوى الفضي والاستمتاع بمكافآت حصرية' : 'SPEND MORE TO REACH SILVER TIER AND UNLOCK EXCLUSIVE BENEFITS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 4b. Sidebar (Real Notifications & Referrals) */}
                <div className="space-y-6">
                    
                    {/* Real Notifications Section */}
                    <GlassCard className="p-6 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h3 className="text-[10px] font-black text-white/80 uppercase tracking-widest">{isAr ? 'أحدث التنبيهات' : 'Activity Feed'}</h3>
                            </div>
                            <button 
                                onClick={() => onNavigate?.('notifications')}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/30 hover:text-white hover:border-gold-500/30 transition-all active:scale-95"
                            >
                                VIEW ALL
                            </button>
                        </div>
                        <div className="space-y-5">
                            {notifications?.length > 0 ? (
                                notifications.slice(0, 3).map(notif => (
                                    <div key={notif.id} className="flex gap-3 items-start group relative">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-white/30 group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-all border border-white/5 group-hover:border-gold-500/20">
                                            {notif.type === 'PAYMENT' ? <Wallet size={14} /> : <AlertCircle size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-white/70 leading-relaxed font-medium line-clamp-2">
                                                {isAr ? notif.messageAr : notif.messageEn}
                                            </p>
                                            <span className="block text-[9px] text-white/20 mt-1 font-black uppercase tracking-tighter">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • JUST NOW
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-white/5 mb-2 flex justify-center"><Wallet size={32} /></div>
                                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{isAr ? 'لا توجد تنبيهات' : 'Quiet for now'}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* PREMIUM Referral Link Card */}
                    <GlassCard className="p-6 border-blue-500/20 relative group bg-gradient-to-br from-blue-600/[0.08] via-transparent to-transparent overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
                        
                        <div className="flex items-center gap-3 mb-5 relative z-10">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-400/20 text-blue-400">
                                <Share2 size={16} />
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{isAr ? 'نظام الإحالات الذهبي' : 'Affiliate Power'}</h3>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl opacity-20 group-hover/input:opacity-40 transition-opacity blur" />
                                <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl overflow-hidden">
                                     <input 
                                        readOnly 
                                        value={stats?.referralCode ? `${window.location.origin}/register?ref=${stats.referralCode}` : '---'} 
                                        className="flex-1 bg-transparent px-4 py-3.5 text-[10px] font-mono font-bold text-blue-400 outline-none truncate"
                                    />
                                    <button 
                                        onClick={handleCopyReferral}
                                        className="p-3.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-blue-400 transition-all border-l border-white/10"
                                        title={isAr ? 'نسخ الرابط' : 'Copy link'}
                                    >
                                        <AnimatePresence mode="wait">
                                            {copied ? (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="check">
                                                    <CheckCircle2 size={16} className="text-blue-400" />
                                                </motion.div>
                                            ) : (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="copy">
                                                    <Copy size={16} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCopyReferral}
                                className={`w-full py-3.5 rounded-xl transition-all shadow-xl font-black text-[10px] uppercase tracking-[2px] relative overflow-hidden group/btn flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:-translate-y-0.5'}`}
                            >
                                {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} className="group-hover/btn:rotate-12 transition-transform" />}
                                {copied ? (isAr ? 'تم النسخ!' : 'LINK COPIED!') : (isAr ? 'دعوة صديق الآن' : 'INVITE PARTNER')}
                            </button>
                            
                            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                <p className="text-[9px] text-white/40 leading-relaxed font-bold">
                                    {isAr ? 'شارك رابطك الخاص واحصل على عمولة 2% من كل عملية ناجحة يقوم بها أصدقاؤك.' : 'SHARE YOUR LINK AND EARN 2% LIFETIME COMMISSION ON EVERY SUCCESSFUL TRANSACTION.'}
                                </p>
                            </div>

                            {/* Enhanced Referral Workflow Steps - Redesigned for Symmetry */}
                            <div className="relative pt-4 pb-2">
                                <div className="relative z-10 flex justify-between items-start">
                                    {[
                                        { icon: Share2, lab: isAr ? 'شارك الرابط' : 'Share Link', act: true },
                                        { icon: UserPlus, lab: isAr ? 'انضمام صديق' : 'Friend Joined', act: stats?.referralCount && stats.referralCount > 0 },
                                        { icon: Star, lab: isAr ? 'احصد مكافأتك' : 'Get Rewards', act: stats?.referralCount && stats.referralCount > 5 }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-3 w-1/3">
                                            {/* Step Icon Container */}
                                            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${step.act ? 'bg-blue-600 border-blue-400 text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)]' : 'bg-black/40 border-white/5 text-white/20'}`}>
                                                <step.icon size={20} />
                                            </div>

                                            {/* Label */}
                                            <div className="text-center px-1">
                                                <span className={`text-[9px] font-black uppercase tracking-tight leading-none block ${step.act ? 'text-blue-400' : 'text-white/20'}`}>
                                                    {step.lab}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* PREMIUM Wallet Quick Panel */}
                    <GlassCard className="p-6 border-gold-500/20 bg-gradient-to-br from-gold-500/[0.04] via-transparent to-transparent group">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-400/20 text-gold-500 group-hover:scale-110 transition-transform">
                                    <Wallet size={16} />
                                </div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{isAr ? 'العمليات السريعة' : 'Instant Actions'}</h3>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer">
                                <ArrowUpRight size={14} />
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">{isAr ? 'رصيد المحفظة الإجمالي' : 'Total Portfolio Value'}</p>
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">+2.4%</span>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tighter">
                                    {((Number(stats?.customerBalance || 0)) + (Number(stats?.totalSpent || 0))).toLocaleString()} 
                                    <span className="text-xs text-gold-500/60 font-medium ml-2">AED</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                                <button 
                                    onClick={() => onNavigate?.('payouts')}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-black rounded-xl border border-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-[2px] group/item outline-none"
                                >
                                    <Download size={14} className="text-gold-500 transition-transform group-hover/item:-translate-y-0.5" />
                                    {isAr ? 'سحب الارباح' : 'Withdraw Profits'}
                                </button>

                                <button 
                                    onClick={() => onNavigate?.('orders')}
                                    className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-black text-[10px] font-black rounded-xl transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-3 uppercase tracking-[2px] active:scale-95 group/pay outline-none"
                                >
                                    <ShieldCheck size={14} className="group-hover/pay:scale-110 transition-transform" />
                                    {isAr ? 'استخدام الرصيد للدفع' : 'Use Balance Pay'}
                                </button>
                            </div>
                            
                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 mt-2 opacity-30 group-hover:opacity-60 transition-opacity">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white">{isAr ? 'نظام تشفير فائق السرعة' : 'AES-256 Quantum Shield Active'}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
