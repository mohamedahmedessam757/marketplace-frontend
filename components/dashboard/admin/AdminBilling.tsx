
import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useBillingStore, InvoiceType } from '../../../stores/useBillingStore';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, FileText, Download, ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, CreditCard, Save, Lock, Settings, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AdminBillingProps {
    onNavigate?: (path: string, id: any) => void;
}

export const AdminBilling: React.FC<AdminBillingProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { invoices, generateInvoicesFromOrders, markInvoicePaid } = useBillingStore();

    const { commissionRate, setCommissionRate, currentAdmin } = useAdminStore();
    const [tempRate, setTempRate] = useState(commissionRate);

    const [filterType, setFilterType] = useState<string>('ALL');
    const [search, setSearch] = useState('');

    const isAr = language === 'ar';
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    useEffect(() => {
        generateInvoicesFromOrders();
    }, []);

    useEffect(() => {
        setTempRate(commissionRate);
    }, [commissionRate]);

    const handleSaveCommission = () => {
        setCommissionRate(tempRate);
        alert(isAr ? 'تم تحديث نسبة العمولة بنجاح' : 'Commission rate updated successfully');
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
        const totalRevenue = invoices
            .filter(i => i.type === 'CUSTOMER_INVOICE' && (i.status === 'PAID' || i.status === 'FROZEN'))
            .reduce((acc, i) => acc + i.totalAmount, 0);

        const frozenFunds = invoices
            .filter(i => i.status === 'FROZEN')
            .reduce((acc, i) => acc + i.totalAmount, 0);

        const netIncome = invoices
            .filter(i => i.type === 'COMMISSION_INVOICE')
            .reduce((acc, i) => acc + i.totalAmount, 0);

        const payouts = invoices
            .filter(i => i.type === 'PAYOUT_INVOICE')
            .reduce((acc, i) => acc + i.totalAmount, 0);

        return { totalRevenue, netIncome, payouts, frozenFunds };
    }, [invoices]);

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

            <div className="grid md:grid-cols-4 gap-4">
                {/* KPI Cards */}
                <GlassCard className="p-6 flex items-center justify-between border-green-500/20 bg-green-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{t.admin.billing.totalRevenue}</p>
                        <h3 className="text-2xl font-bold text-white font-mono">{stats.totalRevenue.toLocaleString()} SAR</h3>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full text-green-400"><TrendingUp size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-gold-500/20 bg-gold-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{t.admin.billing.netIncome}</p>
                        <h3 className="text-2xl font-bold text-gold-400 font-mono">{stats.netIncome.toLocaleString()} SAR</h3>
                    </div>
                    <div className="p-3 bg-gold-500/10 rounded-full text-gold-400"><DollarSign size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-red-500/20 bg-red-900/5">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase mb-1">{t.admin.billing.pendingPayouts}</p>
                        <h3 className="text-2xl font-bold text-white font-mono">{stats.payouts.toLocaleString()} SAR</h3>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full text-red-400"><CreditCard size={24} /></div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between border-orange-500/20 bg-orange-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full" />
                    <div className="relative z-10">
                        <p className="text-orange-300/60 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                            <AlertOctagon size={10} /> {t.admin.billing.frozen}
                        </p>
                        <h3 className="text-2xl font-bold text-orange-400 font-mono">{stats.frozenFunds.toLocaleString()} SAR</h3>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-full text-orange-400 z-10"><Lock size={24} /></div>
                </GlassCard>
            </div>

            {/* Invoice Table */}
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
            </div>
        </div>
    );
};
