
import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useBillingStore } from '../../../stores/useBillingStore';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, FileText, Download, ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, CreditCard, Save, Lock, Settings, AlertOctagon, CheckCircle2, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminBillingProps {
    onNavigate?: (path: string, id: any) => void;
}

export type InvoiceType = 'CUSTOMER_INVOICE' | 'COMMISSION_INVOICE' | 'PAYOUT_INVOICE';

export const AdminBilling: React.FC<AdminBillingProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();

    // Mocking invoices array to bypass faulty mock integration with real store
    const invoices: any[] = [];
    const generateInvoicesFromOrders = () => { };
    const markInvoicePaid = (id: string) => { };

    const { 
        commissionRate, 
        setCommissionRate, 
        currentAdmin,
        pendingWithdrawals,
        withdrawalLimits,
        isLoadingWithdrawals,
        fetchWithdrawalLimits,
        updateWithdrawalLimits,
        processWithdrawal,
        subscribeToWithdrawals,
        unsubscribeFromWithdrawals,
        dashboardStats,
        silentFetchDashboardStats
    } = useAdminStore();

    const [tempRate, setTempRate] = useState(commissionRate);
    const [limits, setLimits] = useState(withdrawalLimits);

    const [filterType, setFilterType] = useState<string>('ALL');
    const [activeTab, setActiveTab] = useState<'INVOICES' | 'WITHDRAWALS'>('INVOICES');
    const [search, setSearch] = useState('');
    const [withdrawalRoleFilter, setWithdrawalRoleFilter] = useState<'VENDOR' | 'CUSTOMER'>('VENDOR');

    const isAr = language === 'ar';
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    useEffect(() => {
        generateInvoicesFromOrders();
        fetchWithdrawalLimits();
        subscribeToWithdrawals();
        silentFetchDashboardStats();
        return () => unsubscribeFromWithdrawals();
    }, []);

    useEffect(() => {
        setLimits(withdrawalLimits);
    }, [withdrawalLimits]);

    const handleSaveCommission = () => {
        setCommissionRate(tempRate);
        alert(isAr ? 'تم تحديث نسبة العمولة بنجاح' : 'Commission rate updated successfully');
    };

    const handleSaveLimits = async () => {
        const success = await updateWithdrawalLimits(limits);
        if (success) {
            alert(isAr ? 'تم تحديث حدود السحب بنجاح' : 'Withdrawal limits updated successfully');
        } else {
            alert(isAr ? 'فشل تحديث الحدود' : 'Failed to update limits');
        }
    };

    const handleProcessPayout = (id: string) => {
        if (confirm('Are you sure you want to mark this payout as PAID? This action cannot be undone.')) {
            markInvoicePaid(id);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesType = filterType === 'ALL' || inv.type === filterType;
        const matchesSearch = inv.id.toLowerCase().includes(search.toLowerCase()) ||
            inv.merchantName?.toLowerCase().includes(search.toLowerCase()) ||
            (inv.orderId && inv.orderId.toString().includes(search));
        return matchesType && matchesSearch;
    });

    const stats = useMemo(() => {
        const totalPayouts = pendingWithdrawals
            .filter(w => w.status === 'PENDING')
            .reduce((acc, w) => acc + Number(w.amount), 0);
        
        return {
            totalRevenue: dashboardStats?.totalSales || 0,
            netIncome: dashboardStats?.totalCommission || 0,
            payouts: totalPayouts,
            frozenFunds: 0 // In production, aggregate from disputed orders
        };
    }, [dashboardStats, pendingWithdrawals]);

    const getTypeBadge = (type: InvoiceType) => {
        switch (type) {
            case 'CUSTOMER_INVOICE': return <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-[10px] border border-green-500/20"><ArrowDownLeft size={12} /> {t.admin.billing.types.CUSTOMER_INVOICE}</span>;
            case 'COMMISSION_INVOICE': return <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-[10px] border border-blue-500/20"><DollarSign size={12} /> {t.admin.billing.types.COMMISSION_INVOICE}</span>;
            case 'PAYOUT_INVOICE': return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-[10px] border border-red-500/20"><ArrowUpRight size={12} /> {t.admin.billing.types.PAYOUT_INVOICE}</span>;
            default: return <span className="text-white/50">{type}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-gold-500" />
                    {t.admin.billing.title}
                </h1>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.admin.billing.invoiceId}
                            className="w-full bg-[#151310] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none md:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg text-sm shadow-lg flex items-center gap-2">
                        <Download size={16} />
                        <span className="hidden sm:inline">{t.common.export}</span>
                    </button>
                </div>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-white/5 gap-8">
                <button 
                    onClick={() => setActiveTab('INVOICES')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'INVOICES' ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
                >
                    {isAr ? 'الفواتير والعمليات' : 'Invoices & Transactions'}
                    {activeTab === 'INVOICES' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 rounded-t-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                </button>
                <button 
                    onClick={() => setActiveTab('WITHDRAWALS')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'WITHDRAWALS' ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
                >
                    {isAr ? 'طلبات السحب' : 'Withdrawal Requests'}
                    {activeTab === 'WITHDRAWALS' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 rounded-t-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {/* KPI Cards */}
                <GlassCard className="p-6 flex items-center justify-between border-green-500/20 bg-green-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{t.admin.billing.totalRevenue}</p>
                        <h3 className="text-2xl font-bold text-white font-mono">{stats.totalRevenue.toLocaleString()} AED</h3>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full text-green-400"><TrendingUp size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-gold-500/20 bg-gold-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{t.admin.billing.netIncome}</p>
                        <h3 className="text-2xl font-bold text-gold-400 font-mono">{stats.netIncome.toLocaleString()} AED</h3>
                    </div>
                    <div className="p-3 bg-gold-500/10 rounded-full text-gold-400"><DollarSign size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-red-500/20 bg-red-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{isAr ? 'سحوبات معلقة' : 'Pending Withdrawals'}</p>
                        <h3 className="text-2xl font-bold text-white font-mono">{stats.payouts.toLocaleString()} AED</h3>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full text-red-400"><CreditCard size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-orange-500/20 bg-orange-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full" />
                    <div className="relative z-10">
                        <p className="text-orange-300/60 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                            <AlertOctagon size={10} /> {t.admin.billing.frozen}
                        </p>
                        <h3 className="text-2xl font-bold text-orange-400 font-mono">{stats.frozenFunds.toLocaleString()} AED</h3>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-full text-orange-400 z-10"><Lock size={24} /></div>
                </GlassCard>
            </div>

            {/* Content Area */}
            {activeTab === 'INVOICES' ? (
                <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[
                            { id: 'ALL', label: t.common.viewAll },
                            { id: 'CUSTOMER_INVOICE', label: t.admin.billing.types.CUSTOMER_INVOICE },
                            { id: 'COMMISSION_INVOICE', label: t.admin.billing.types.COMMISSION_INVOICE },
                            { id: 'PAYOUT_INVOICE', label: t.admin.billing.types.PAYOUT_INVOICE },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilterType(f.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterType === f.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <GlassCard className="p-0 overflow-hidden bg-[#151310]">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs text-white/40 uppercase">
                                <tr>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.billing.invoiceId}</th>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.billing.type}</th>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.billing.amount}</th>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.billing.date}</th>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.billing.status}</th>
                                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-mono text-white font-bold">{inv.id}</td>
                                        <td className="p-4">{getTypeBadge(inv.type)}</td>
                                        <td className={`p-4 font-mono font-bold ${inv.type === 'PAYOUT_INVOICE' ? 'text-red-400' : 'text-green-400'}`}>
                                            {inv.type === 'PAYOUT_INVOICE' ? '-' : '+'}{inv.totalAmount.toLocaleString()} SAR
                                        </td>
                                        <td className="p-4 text-sm text-white/60">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${inv.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                inv.status === 'REFUNDED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    inv.status === 'FROZEN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            {inv.type === 'PAYOUT_INVOICE' && inv.status === 'PENDING' && isSuperAdmin && (
                                                <button
                                                    onClick={() => handleProcessPayout(inv.id)}
                                                    className="p-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition-colors border border-green-500/20"
                                                    title="Mark Paid"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onNavigate && onNavigate('invoice-details', inv.id)}
                                                className="p-2 bg-white/5 hover:bg-gold-500 hover:text-white text-gold-400 rounded-lg transition-colors border border-white/10"
                                                title="View Invoice"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInvoices.length === 0 && (
                            <div className="p-10 text-center text-white/30">{t.common.noData}</div>
                        )}
                    </GlassCard>

                    {/* Commission Settings Section */}
                    {isSuperAdmin && (
                        <GlassCard className="p-6 border-gold-500/20 bg-gold-900/5">
                            <div className="flex items-center gap-4 mb-6">
                                <Settings className="text-gold-500" />
                                <h4 className="text-lg font-bold text-white uppercase tracking-tight">{isAr ? 'إعدادات العمولة المالية' : 'Financial Commission Settings'}</h4>
                            </div>
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs text-white/40 font-black uppercase tracking-widest">{isAr ? 'نسبة عمولة السوق (%)' : 'Marketplace Commission Rate (%)'}</label>
                                    <div className="relative group">
                                        <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-500" />
                                        <input 
                                            type="number" 
                                            value={tempRate}
                                            onChange={(e) => setTempRate(Number(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-gold-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSaveCommission}
                                    className="px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-black font-black text-xs rounded-xl shadow-xl transition-all flex items-center gap-2 uppercase tracking-widest"
                                >
                                    <Save size={16} />
                                    {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </div>
                        </GlassCard>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Withdrawal Requests List */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Role Filter Sub-tabs */}
                            <div className="flex gap-4 mb-2">
                                <button 
                                    onClick={() => setWithdrawalRoleFilter('VENDOR')}
                                    className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${withdrawalRoleFilter === 'VENDOR' ? 'text-gold-500 border-gold-500' : 'text-white/20 border-transparent hover:text-white/50'}`}
                                >
                                    {isAr ? 'تجار (Vendors)' : 'Merchants (Vendors)'}
                                </button>
                                <button 
                                    onClick={() => setWithdrawalRoleFilter('CUSTOMER')}
                                    className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${withdrawalRoleFilter === 'CUSTOMER' ? 'text-blue-400 border-blue-400' : 'text-white/20 border-transparent hover:text-white/50'}`}
                                >
                                    {isAr ? 'عملاء (Customers)' : 'Customers'}
                                </button>
                            </div>

                            <GlassCard className="p-0 overflow-hidden bg-[#151310]">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-xs text-white/40 uppercase">
                                        <tr>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                                                {withdrawalRoleFilter === 'VENDOR' ? (isAr ? 'التاجر' : 'Merchant') : (isAr ? 'العميل' : 'Customer')}
                                            </th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المبلغ' : 'Amount'}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'طريقة السحب' : 'Method'}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التاريخ' : 'Date'}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الحالة' : 'Status'}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoadingWithdrawals ? (
                                            <tr><td colSpan={6} className="p-12 text-center text-white/20 font-black text-xs uppercase">{isAr ? 'جاري التحميل...' : 'LOADING...'}</td></tr>
                                        ) : pendingWithdrawals.filter(r => r.role === withdrawalRoleFilter).length === 0 ? (
                                            <tr><td colSpan={6} className="p-12 text-center text-white/20 font-black text-xs uppercase">{isAr ? 'لا توجد طلبات معلقة' : `NO PENDING ${withdrawalRoleFilter} REQUESTS`}</td></tr>
                                        ) : pendingWithdrawals.filter(r => r.role === withdrawalRoleFilter).map((req) => (
                                            <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        {req.role === 'VENDOR' ? (
                                                            <>
                                                                <span className="text-white font-bold">{req.store?.name}</span>
                                                                <span className="text-[10px] text-white/30 uppercase font-bold">{req.store?.owner?.name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-white font-bold">{req.user?.name}</span>
                                                                <span className="text-[10px] text-blue-400/50 uppercase font-bold lowercase">{req.user?.email}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-gold-500">{req.amount.toLocaleString()} AED</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${
                                                        req.payoutMethod === 'STRIPE' 
                                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            : 'bg-gold-500/10 text-gold-500 border-gold-500/20'
                                                    }`}>
                                                        {req.payoutMethod === 'STRIPE' ? 'Stripe' : (isAr ? 'تحويل بنكي' : 'Bank Transfer')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-white/60">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${
                                                        req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex gap-2 justify-end">
                                                    {req.status === 'PENDING' && isSuperAdmin && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(isAr ? 'هل أنت متأكد من الموافقة؟ سيتم تحويل المبلغ عبر Stripe فوراً.' : 'Approve and transfer via Stripe?')) {
                                                                        const res = await processWithdrawal(req.id, 'approve');
                                                                        alert(res.message);
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const reason = prompt(isAr ? 'سبب الرفض:' : 'Rejection Reason:');
                                                                    if (reason) {
                                                                        const res = await processWithdrawal(req.id, 'reject', reason);
                                                                        alert(res.message);
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                                                            >
                                                                <AlertOctagon size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </GlassCard>
                        </div>

                        {/* Payout Settings Sidebar */}
                        <div className="space-y-6">
                            <GlassCard className="p-6 border-gold-500/20 bg-gradient-to-br from-gold-500/[0.04] to-transparent">
                                <div className="flex items-center gap-3 mb-6">
                                    <Settings className="text-gold-500" size={18} />
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{isAr ? 'حدود السحب العالمية' : 'Global Payout Limits'}</h4>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">{isAr ? 'الحد الأدنى' : 'Minimum Amount'}</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20">AED</span>
                                            <input 
                                                type="number"
                                                value={limits.min}
                                                onChange={(e) => setLimits(prev => ({ ...prev, min: Number(e.target.value) }))}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-gold-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">{isAr ? 'الحد الأقصى' : 'Maximum Amount'}</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20">AED</span>
                                            <input 
                                                type="number"
                                                value={limits.max}
                                                onChange={(e) => setLimits(prev => ({ ...prev, max: Number(e.target.value) }))}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-gold-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSaveLimits}
                                        disabled={!isSuperAdmin}
                                        className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-[10px] rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[2px] disabled:opacity-50"
                                    >
                                        <Save size={14} />
                                        {isAr ? 'حفظ الحدود' : 'Save Limits'}
                                    </button>
                                </div>
                                <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[9px] text-blue-400 font-bold leading-relaxed">
                                        {isAr 
                                            ? 'سيتم تطبيق هذه الحدود على جميع التجار فور الحفظ. تأكد من مراجعة سيولة المنصة قبل التغيير.' 
                                            : 'These limits will apply to all merchants immediately. Ensure platform liquidity review before changing.'}
                                    </p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
