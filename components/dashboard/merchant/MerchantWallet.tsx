

import React, { useEffect } from 'react';
import { Wallet, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, AlertCircle, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMerchantWalletStore, subscribeToMerchantWalletUpdates } from '../../../stores/useMerchantWalletStore';
import { GlassCard } from '../../ui/GlassCard';
import { getCurrentUser } from '../../../utils/auth';

export const MerchantWallet: React.FC = () => {
    const { t, language } = useLanguage();
    const { balance, transactions, fetchWallet, isLoading } = useMerchantWalletStore();
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

    const getTransactionTypeAr = (type: string, transactionType: string) => {
        const arMap: Record<string, string> = {
            'PAYOUT': 'تحويل بنكي',
            'CREDIT': 'إيداع',
            'COMMISSION': 'خصم عمولة',
            'REFUND': 'استرجاع مالي',
            'PAYMENT': 'تحصيل مبيعات',
            'WITHDRAWAL': 'سحب مالي',
            'PENALTY': 'غرامة إدارية'
        };
        const key = transactionType?.toUpperCase() || type;
        return isAr ? (arMap[key] || key) : key;
    };

    const getStatusAr = (status: string) => {
        const arMap: Record<string, string> = {
            'SUCCESS': 'ناجح',
            'COMPLETED': 'مكتمل',
            'PENDING': 'قيد الانتظار',
            'FAILED': 'فاشل',
            'RELEASED': 'تم الإفراج عنه',
        };
        return isAr ? (arMap[status] || status) : status;
    };

    const StatCard = ({ label, value, icon: Icon, color, subText, trend }: any) => {
        const colorClasses = {
            green: 'from-green-500/20 to-transparent text-green-400 border-green-500/20',
            yellow: 'from-yellow-500/20 to-transparent text-yellow-400 border-yellow-500/20',
            red: 'from-red-500/20 to-transparent text-red-400 border-red-500/20',
            gold: 'from-gold-500/20 to-transparent text-gold-400 border-gold-500/20',
            blue: 'from-blue-500/20 to-transparent text-blue-400 border-blue-500/20',
            indigo: 'from-indigo-500/20 to-transparent text-indigo-400 border-indigo-500/20',
        }[color as "green" | "yellow" | "red" | "gold" | "blue" | "indigo"];

        return (
            <GlassCard className="p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${colorClasses.split(' ')[0]} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${colorClasses.split(' ')[2]}`}>
                            <Icon size={20} />
                        </div>
                        {trend && (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                {trend}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <h3 className="text-2xl font-bold text-white font-mono tracking-tight">
                                {Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{isAr ? 'درهم' : 'AED'}</span>
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{label}</p>
                    </div>
                    {subText && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                            <AlertCircle size={10} className={color === 'red' ? 'text-red-400' : 'text-white/20'} />
                            <p className="text-[9px] text-white/30 leading-tight">
                                {subText}
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>
        );
    };

    return (
        <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gold-500/10 rounded-2xl border border-gold-500/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                        <Wallet className="text-gold-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            {t.dashboard.merchant.earnings.title}
                        </h1>
                        <p className="text-white/40 text-sm mt-1 max-w-md leading-relaxed">
                            {t.dashboard.merchant.earnings.payoutInfo}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">{t.dashboard.merchant.wallet.today}</div>
                        <div className="text-white font-mono text-sm flex items-center gap-2">
                            {new Date().toLocaleDateString(isAr ? 'ar-AE' : 'en-AE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <Calendar className="text-white/20" size={20} />
                </div>
            </div>

            {/* Stats Grid - 6 Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    label={isAr ? 'الرصيد المستحق' : 'Available Balance'}
                    value={balance.available}
                    icon={Wallet}
                    color="green"
                    subText={isAr ? 'جاهز للسحب الفوري' : 'Ready for instant payout'}
                    trend="+12%"
                />
                <StatCard
                    label={isAr ? 'الرصيد المعلق' : 'Pending Balance'}
                    value={balance.pending}
                    icon={Clock}
                    color="yellow"
                    subText={isAr ? 'تحت فترة الضمان (24 ساعة)' : 'Under 24h safety period'}
                />
                <StatCard
                    label={isAr ? 'أرصدة مجمدة' : 'Frozen Funds'}
                    value={balance.frozen}
                    icon={AlertCircle}
                    color="red"
                    subText={isAr ? 'أموال مرتبطة بنزاعات نشطة' : 'Tied to active disputes'}
                />
                <StatCard
                    label={isAr ? 'إجمالي المبيعات' : 'Total Sales'}
                    value={balance.totalSales}
                    icon={TrendingUp}
                    color="gold"
                    subText={isAr ? 'حجم المبيعات الكلي' : 'Total sales volume'}
                />
                <StatCard
                    label={isAr ? 'صافي الأرباح' : 'Net Earnings'}
                    value={balance.available + balance.pending}
                    icon={ArrowDownLeft}
                    color="blue"
                    subText={isAr ? 'بعد خصم العمولات' : 'After platform commission'}
                />
                <StatCard
                    label={isAr ? 'الطلبات الناجحة' : 'Successful Orders'}
                    value={transactions.filter(t => t.type === 'CREDIT').length}
                    icon={FileText}
                    color="indigo"
                    subText={isAr ? 'إجمالي عمليات البيع' : 'Total sales operations'}
                />
            </div>

            {/* Transactions Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <ArrowDownLeft className="text-white/20" size={18} />
                        {t.dashboard.merchant.wallet.recentTx}
                    </h2>
                    <button className="text-[10px] text-white/40 hover:text-gold-500 transition-colors uppercase tracking-widest font-bold">
                        {t.dashboard.merchant.wallet.export}
                    </button>
                </div>

                <GlassCard className="p-0 overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] text-white/30 uppercase tracking-[0.15em] font-black">
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.date}</th>
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.type}</th>
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.order}</th>
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.amount}</th>
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الرصيد النهائي' : 'Post Balance'}</th>
                                    <th className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.earnings.table.status}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-20 text-center"><div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto" /></td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="p-20 text-center text-white/20 font-mono text-sm">{t.dashboard.merchant.wallet.noTx}</td></tr>
                                ) : transactions.map((tx: any) => {
                                    const isPositive = tx.type === 'CREDIT';
                                    const orderData = tx.payment?.order;
                                    return (
                                        <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                <div className="text-white/70 text-sm font-mono tracking-tight">
                                                    {new Date(tx.createdAt).toLocaleDateString(isAr ? 'ar-AE' : 'en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {isPositive ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                    </div>
                                                    <span className="text-white/80 text-xs font-bold uppercase tracking-wide">
                                                        {getTransactionTypeAr(tx.type, tx.transactionType)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                {orderData?.orderNumber ? (
                                                    <code className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gold-500/70 group-hover:text-gold-500 transition-colors">
                                                        #{orderData.orderNumber}
                                                    </code>
                                                ) : <span className="text-white/10 text-xs">-</span>}
                                            </td>
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                <div className={`font-mono font-bold text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isPositive ? '+' : '-'}{Math.abs(Number(tx.amount)).toLocaleString()}
                                                    <span className="text-[9px] ml-1 opacity-50 font-sans tracking-normal">{isAr ? 'درهم' : 'AED'}</span>
                                                </div>
                                            </td>
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                <div className="text-white/50 font-mono text-xs">
                                                    {Number(tx.balanceAfter || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className={`p-5 ${isAr ? 'text-right' : 'text-left'}`}>
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    tx.type === 'CREDIT' ? 'bg-green-500/5 text-green-400 border-green-500/20' : 'bg-blue-500/5 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {getStatusAr(tx.type === 'CREDIT' ? 'COMPLETED' : 'SUCCESS')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

