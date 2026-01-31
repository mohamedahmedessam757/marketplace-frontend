
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge, StatusType } from '../../ui/Badge';
import { Search, Filter, Download, ArrowRight, ArrowLeft } from 'lucide-react';

export const OrderControl: React.FC<{ onNavigate?: (path: string, id: any) => void }> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { orders, fetchOrders } = useOrderStore();
    const { currentAdmin } = useAdminStore();
    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const hasWriteAccess = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN';

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesSearch = order.id.toString().includes(searchQuery) ||
            order.part.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.car.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleRowClick = (id: string | number) => {
        if (onNavigate) onNavigate('admin-order-details', id);
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">{t.admin.orders}</h1>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.common.search}
                            className="bg-[#151310] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none w-48 md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-white transition-colors">
                            <Filter size={16} />
                            <span>{filterStatus === 'ALL' ? t.common.filter : filterStatus}</span>
                        </button>
                        {/* Dropdown would go here or use a select for simplicity */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="AWAITING_OFFERS">Awaiting Offers</option>
                            <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                            <option value="PREPARATION">Preparation</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="DISPUTED">Disputed</option>
                        </select>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-xl text-sm transition-colors shadow-lg shadow-gold-500/20">
                        <Download size={16} />
                        <span className="hidden sm:inline">{t.common.export}</span>
                    </button>
                </div>
            </div>

            <GlassCard className="p-0 bg-[#151310] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-white/40 uppercase font-bold tracking-wider">
                            <tr>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.id}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.customer}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.merchant}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.amount}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.status}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => handleRowClick(order.id)}
                                >
                                    <td className="p-4 font-mono text-gold-400 font-bold">#{order.id.toString().slice(0, 8)}</td>
                                    <td className="p-4">
                                        <div className="text-white font-medium">{order.customer?.name || 'Customer'}</div>
                                        <div className="text-[10px] text-white/40">{order.car}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white/80">{order.merchantName || '-'}</div>
                                    </td>
                                    <td className="p-4 font-mono text-white/90">
                                        {order.price || '-'}
                                    </td>
                                    <td className="p-4"><Badge status={order.status} /></td>
                                    <td className="p-4 text-right">
                                        <ArrowIcon size={16} className="text-white/20 group-hover:text-gold-500 transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-white/30 text-sm">
                        No orders found matching criteria.
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
