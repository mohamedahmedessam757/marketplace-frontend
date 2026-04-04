
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useCustomerStore } from '../../../stores/useCustomerStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Filter, Eye, Lock, Unlock, User, Mail, Phone, DollarSign, Target, Loader2 } from 'lucide-react';

interface CustomerManagementProps {
    onNavigate?: (path: string, id: any) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { customers, fetchCustomers, toggleStatus, isLoading } = useCustomerStore();
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [search, setSearch] = useState('');

    const isAr = language === 'ar';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c => {
        const matchesFilter = filter === 'all' || (c.status || '').toLowerCase() === filter;
        const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {t.admin.customers}
                    {isLoading && <Loader2 size={18} className="animate-spin text-gold-400" />}
                </h1>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.common.search}
                            className="w-full bg-[#151310] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none md:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'all' ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>{t.common.viewAll}</button>
                    <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'active' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'}`}>{t.common.active}</button>
                    <button onClick={() => setFilter('suspended')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'suspended' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/50'}`}>{t.common.ban}</button>
                </div>
            </div>

            {/* Table */}
            <GlassCard className="p-0 overflow-hidden bg-[#151310]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-white/40 uppercase">
                            <tr>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.name}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.contact}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.ltv}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.successRate}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.status}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.customersTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 p-[1px]">
                                                <div className="w-full h-full rounded-full bg-[#151310] flex items-center justify-center overflow-hidden">
                                                    {customer.avatar ? (
                                                        <img src={customer.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={16} className="text-gold-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{customer.name}</div>
                                                <div className="text-[10px] text-white/30">{new Date(customer.joinedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/70">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail size={12} className="text-white/30" />
                                            {customer.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} className="text-white/30" />
                                            {customer.phone}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-green-400 font-mono font-bold">
                                            <DollarSign size={14} />
                                            {customer.ltv?.toFixed(2) || '0.00'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white/70 text-xs">
                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${customer.successRate && customer.successRate > 70 ? 'bg-green-500' : 'bg-red-500'}`}
                                                    style={{ width: `${customer.successRate || 0}%` }}
                                                />
                                            </div>
                                            <span>{customer.successRate || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded border font-bold ${customer.status === 'ACTIVE'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {customer.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onNavigate && onNavigate('customer-profile', customer.id)}
                                                className="p-2 bg-white/5 hover:bg-gold-500 hover:text-white text-gold-400 rounded-lg transition-colors border border-white/10"
                                                title={t.common.details}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(customer.id)}
                                                className={`p-2 rounded-lg transition-colors border ${customer.status === 'ACTIVE'
                                                    ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border-red-500/20'
                                                    : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border-green-500/20'
                                                    }`}
                                                title={customer.status === 'ACTIVE' ? t.common.ban : t.common.unban}
                                            >
                                                {customer.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCustomers.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-white/30 text-sm">{isAr ? 'لا يوجد عملاء مطابقين' : 'No matching customers found'}</div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
