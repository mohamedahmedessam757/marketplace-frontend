
import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { Users, Store, Activity, DollarSign, Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useSystemAutomation } from '../../../stores/useSystemAutomation'; // Import Automation Store
import { LineChart, DonutChart, BarChart } from '../../ui/Charts';
import { AdminAlerts } from './AdminAlerts';

// SUB-COMPONENTS
import { StoreManagement } from './StoreManagement';
import { OrderControl } from './OrderControl';
import { AdminStoreProfile } from './AdminStoreProfile';
import { AdminOrderDetails } from './AdminOrderDetails';
import { CustomerManagement } from './CustomerManagement';
import { AdminCustomerProfile } from './AdminCustomerProfile';
import { ReviewsControl } from './ReviewsControl';
import { AdminDisputes } from './AdminDisputes';
import { AdminDisputeDetails } from './AdminDisputeDetails';
import { AdminBilling } from './AdminBilling';
import { InvoiceViewer } from './InvoiceViewer';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminShipping } from './AdminShipping';
import { AdminSettings } from './AdminSettings';
import { AdminSupport } from './AdminSupport';
import { SecurityAudit } from './SecurityAudit'; // NEW

interface AdminHomeProps {
    subPath?: string;
    viewId?: any; // ID passed from routing
}

export const AdminHome: React.FC<AdminHomeProps> = ({ subPath, viewId }) => {
    const { t, language } = useLanguage();
    const { currentAdmin, commissionRate, fetchDashboardStats, dashboardStats, subscribeToStats, unsubscribeFromStats } = useAdminStore();
    const { orders } = useOrderStore(); // Still kept for table, but stats come from backend now
    const { cases } = useResolutionStore();
    const { isRunning } = useSystemAutomation();

    const isAr = language === 'ar';

    // Fetch Real-time Stats on Mount
    React.useEffect(() => {
        fetchDashboardStats();
        subscribeToStats();

        return () => {
            unsubscribeFromStats();
        };
    }, []);

    // Helper for internal nav bubbling
    const navigate = (path: string, id?: any) => {
        window.dispatchEvent(new CustomEvent('admin-nav', { detail: { path, id } }));
    };

    // --- SUB-VIEW ROUTING --- (Kept same)
    if (subPath === 'billing' || subPath === 'financials') return <AdminBilling onNavigate={navigate} />;
    if (subPath === 'invoice-details' && viewId) return <InvoiceViewer invoiceId={viewId} onBack={() => navigate('billing')} />;
    if (subPath === 'resolution') return <AdminDisputes onNavigate={navigate} />;
    if (subPath === 'admin-dispute-details' && viewId) return <AdminDisputeDetails caseId={viewId} onBack={() => navigate('resolution')} />;
    if (subPath === 'users') return <StoreManagement onNavigate={navigate} />;
    if (subPath === 'store-profile' && viewId) return <AdminStoreProfile vendorId={viewId} onBack={() => navigate('users')} />;
    if (subPath === 'customers') return <CustomerManagement onNavigate={navigate} />;
    if (subPath === 'customer-profile' && viewId) return <AdminCustomerProfile customerId={viewId} onBack={() => navigate('customers')} onNavigate={navigate} />;
    if (subPath === 'reviews') return <ReviewsControl />;
    if (subPath === 'orders-control') return <OrderControl onNavigate={navigate} />;
    if (subPath === 'admin-order-details' && viewId) return <AdminOrderDetails orderId={viewId} onBack={() => navigate('orders-control')} />;
    if (subPath === 'audit-logs') return <AdminAuditLogs />;
    if (subPath === 'shipping') return <AdminShipping />;
    if (subPath === 'settings') return <AdminSettings />;
    if (subPath === 'support') return <AdminSupport />;
    if (subPath === 'security-audit') return <SecurityAudit />;

    // --- ANALYTICS ENGINE (KPIs) ---
    // Use Real Stats from Backend or Fallback to 0
    const stats = useMemo(() => {
        if (!dashboardStats) return {
            totalSales: 0,
            totalCommission: 0,
            totalOrders: 0,
            openDisputes: 0,
            activeVendors: 0,
            activeCustomers: 0
        };

        return {
            totalSales: dashboardStats.totalSales || 0,
            totalCommission: dashboardStats.totalCommission || 0,
            totalOrders: dashboardStats.totalOrders || 0,
            openDisputes: dashboardStats.openDisputes || 0,
            activeVendors: dashboardStats.activeStores || 0,
            activeCustomers: dashboardStats.activeCustomers || 0
        };
    }, [dashboardStats]);

    // --- CHARTS DATA ENGINE ---
    const chartsData = useMemo(() => {
        if (!dashboardStats) return {
            salesTrend: [],
            salesLabels: [],
            donutData: [],
            barData: []
        };

        // Trend Data
        // Map backend date string to localized label if needed, or just day
        const salesTrend = dashboardStats.salesTrend.map(d => d.value);
        const salesLabels = dashboardStats.salesTrend.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { day: '2-digit', month: '2-digit' });
        });

        // Donut Data
        // Aggregate status distribution
        const sDist = dashboardStats.statusDistribution;
        const getCount = (statuses: string[]) => sDist.filter(s => statuses.includes(s.status)).reduce((acc, curr) => acc + curr.count, 0);

        const donutData = [
            { label: t.admin.alerts.legend.completed, value: getCount(['COMPLETED', 'DELIVERED']), color: '#4ade80' },
            { label: t.admin.alerts.legend.active, value: getCount(['SHIPPED', 'PREPARATION']), color: '#fbbf24' },
            { label: t.admin.alerts.legend.pending, value: getCount(['AWAITING_OFFERS', 'AWAITING_PAYMENT']), color: '#3b82f6' },
            { label: t.admin.alerts.legend.issues, value: getCount(['CANCELLED', 'DISPUTED', 'REFUNDED', 'RETURNED']), color: '#f87171' }
        ];

        // Top Stores
        const barData = dashboardStats.topStores.map(s => ({
            label: s.name,
            value: s.ordersCount // Visualizing Order Volume
        }));

        return { salesTrend, salesLabels, donutData, barData };
    }, [dashboardStats, language, t]);

    // --- KPI CARD COMPONENT ---
    const KPICard = ({ label, value, icon: Icon, color, trend }: any) => (
        <GlassCard className="relative overflow-hidden group p-5 border-white/5 hover:border-gold-500/30 transition-all duration-500">
            <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 bg-${color.split('-')[1]}-500 group-hover:opacity-20 transition-opacity`} />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{label}</p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${color} shadow-lg`}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-2">
                <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </span>
                <span className="text-[10px] text-white/30">vs last week</span>
            </div>
        </GlassCard>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-[#1A1814] to-transparent p-6 rounded-3xl border border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full border border-white/10">
                            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
                                {isRunning ? t.admin.automations.active : t.admin.automations.stopped}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{t.admin.welcome}</h1>
                    <p className="text-white/50 text-sm flex items-center gap-2">
                        {t.admin.welcomeSub}
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className={`font-mono font-bold ${currentAdmin?.role === 'SUPER_ADMIN' ? 'text-red-400' : 'text-blue-400'}`}>
                            {currentAdmin?.role}
                        </span>
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Security Entry Point */}
                    <button
                        onClick={() => navigate('security-audit')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <ShieldCheck size={14} />
                        {t.admin.security.title}
                    </button>
                    <button className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black rounded-xl text-xs font-bold shadow-lg shadow-gold-500/20 transition-all">
                        {t.admin.actions.refresh}
                    </button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label={t.admin.kpi.totalSales} value={stats.totalSales.toLocaleString()} icon={DollarSign} color="text-gold-400" trend={12.5} />
                <KPICard label={t.admin.kpi.commission} value={stats.totalCommission.toLocaleString()} icon={TrendingUp} color="text-green-400" trend={8.2} />
                <KPICard label={t.admin.kpi.orders} value={stats.totalOrders} icon={Package} color="text-blue-400" trend={-2.1} />
                <KPICard label={t.admin.kpi.customers} value={stats.activeCustomers.toLocaleString()} icon={Users} color="text-purple-400" trend={5.4} />
                <KPICard label={t.admin.kpi.stores} value={stats.activeVendors} icon={Store} color="text-pink-400" trend={0} />
                <KPICard label={t.admin.kpi.disputes} value={stats.openDisputes} icon={AlertTriangle} color="text-red-400" trend={15} />
            </div>

            {/* MAIN ANALYTICS SECTION */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Sales Chart (Large) */}
                <GlassCard className="lg:col-span-2 p-6 md:p-8 flex flex-col bg-[#1A1814]/80">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{t.admin.charts.salesTrend}</h3>
                            <p className="text-xs text-white/40">{t.admin.welcomeSub}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-white font-mono">{stats.totalSales.toLocaleString()} SAR</span>
                                <span className="block text-[10px] text-green-400">+12.5% vs prev week</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        {/* Switched to BarChart as requested 'like best selling' */}
                        <div className="w-full h-[300px]">
                            <BarChart
                                data={chartsData.salesTrend.map((val, i) => ({
                                    label: chartsData.salesLabels[i] || '',
                                    value: val
                                }))}
                                height={300}
                                color="#A88B3E" // Gold
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Side Column: Alerts & Status */}
                <div className="space-y-6">
                    {/* Status Donut */}
                    <GlassCard className="p-6 bg-[#1A1814]/80 flex flex-col items-center justify-center min-h-[350px]">
                        <h3 className="text-sm font-bold text-white mb-6 w-full text-left">{t.admin.charts.orderStatus}</h3>
                        <DonutChart data={chartsData.donutData} size={220} />

                        <div className="w-full grid grid-cols-2 gap-3 mt-8">
                            {chartsData.donutData.map((d, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-[10px] text-white/60">{d.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-white">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* BOTTOM SECTION: Top Stores & Alerts */}
            <div className="grid lg:grid-cols-3 gap-6">
                <GlassCard className="p-6 bg-[#1A1814]/80">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">{t.admin.charts.topStores}</h3>
                        <button className="text-xs text-gold-400 hover:text-white">{t.admin.actions.viewReport}</button>
                    </div>
                    <div className="h-[250px] mt-auto">
                        <BarChart data={chartsData.barData} height={250} />
                    </div>
                </GlassCard>

                <div className="lg:col-span-2">
                    <AdminAlerts />
                </div>
            </div>

            {/* RECENT ORDERS TABLE */}
            <GlassCard className="p-0 overflow-hidden bg-[#1A1814]/90 border-white/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-gold-500" />
                        {t.admin.headers.recentOrders}
                    </h3>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0F0E0C] text-[10px] uppercase text-white/30 font-bold tracking-wider">
                            <tr>
                                <th className="p-4">{t.admin.ordersTable.id}</th>
                                <th className="p-4">{t.admin.billing.invoiceViewer.item}</th>
                                <th className="p-4">{t.admin.ordersTable.date}</th>
                                <th className="p-4">{t.admin.ordersTable.status}</th>
                                <th className="p-4 text-right">{t.admin.ordersTable.amount}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {orders.slice(0, 5).map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-mono text-gold-400 font-bold group-hover:text-gold-300">
                                        #{order.id}
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        {order.part}
                                        <div className="text-[10px] text-white/40">{order.car}</div>
                                    </td>
                                    <td className="p-4 text-white/50 text-xs">
                                        {order.date}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${order.status === 'COMPLETED' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                            order.status === 'SHIPPED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                                order.status === 'CANCELLED' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                                    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                                            }`}>
                                            {t.common.status[order.status]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-white">
                                        {order.price || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

        </div>
    );
};
