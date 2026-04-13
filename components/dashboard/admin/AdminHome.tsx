
import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { Users, Store, Activity, DollarSign, Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, MoreHorizontal, ShieldCheck, CheckCircle2, Download, Filter, Search, Plus, Trash2, Edit } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useSystemAutomation } from '../../../stores/useSystemAutomation'; // Import Automation Store
import { useShipmentStore } from '../../../stores/useShipmentStore';
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
import { AdminResolutionPage } from './AdminResolutionPage';
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

// Ultra-Modern 2026 Skeleton Pre-loader (No flashes, extremely fast structural rendering)
const AdminHomeSkeleton = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
        {/* HEADER HEADER SKELETON */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-[#1A1814] to-transparent p-6 rounded-3xl border border-white/5">
            <div className="space-y-3 w-full max-w-sm">
                <div className="w-24 h-6 bg-white/10 rounded-full animate-pulse"></div>
                <div className="w-64 h-10 bg-white/10 rounded-xl animate-pulse"></div>
                <div className="w-48 h-4 bg-white/10 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex gap-2">
                <div className="w-32 h-10 bg-white/10 rounded-xl animate-pulse"></div>
                <div className="w-24 h-10 bg-white/10 rounded-xl animate-pulse"></div>
            </div>
        </div>

        {/* KPI GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <GlassCard key={i} className="p-5 border-white/5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3 w-full">
                            <div className="w-16 h-3 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="w-24 h-8 bg-white/10 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse"></div>
                    </div>
                </GlassCard>
            ))}
        </div>

        {/* CHARTS SKELETON */}
        <div className="grid lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 p-6 md:p-8 flex flex-col bg-[#1A1814]/80 min-h-[400px] justify-between">
                <div className="flex justify-between w-full">
                    <div className="w-32 h-6 bg-white/10 rounded-xl animate-pulse"></div>
                    <div className="w-24 h-8 bg-white/10 rounded-xl animate-pulse"></div>
                </div>
                <div className="w-full h-[300px] bg-white/5 rounded-xl animate-pulse mt-8"></div>
            </GlassCard>
            <GlassCard className="p-6 bg-[#1A1814]/80 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-48 h-48 rounded-full bg-white/5 animate-pulse"></div>
                <div className="w-full grid grid-cols-2 gap-3 mt-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="w-full h-8 bg-white/10 rounded-xl animate-pulse"></div>)}
                </div>
            </GlassCard>
        </div>
    </div>
);

// --- KPI CARD COMPONENT ---
const KPICard = ({ label, value, icon: Icon, color, trend, children }: any) => (
    <GlassCard className="relative overflow-hidden group p-5 border-white/5 hover:border-gold-500/30 transition-all duration-500">
        <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 bg-${color.split('-')[1]}-500 group-hover:opacity-20 transition-opacity`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{label}</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">{value}</h3>
                {children}
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
            <span className="text-[10px] text-white/30">vs last period</span>
        </div>
    </GlassCard>
);

export const AdminHome: React.FC<AdminHomeProps> = ({ subPath, viewId }) => {
    const { t, language } = useLanguage();
    const { currentAdmin, isLoadingStats, commissionRate, fetchDashboardStats, dashboardStats, subscribeToStats, unsubscribeFromStats } = useAdminStore();
    const { cases } = useResolutionStore();
    const { isRunning } = useSystemAutomation();

    const isAr = language === 'ar';

    // Date Filters State (Default last 30 days)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Fetch Real-time Stats on Mount & on Filter Change
    React.useEffect(() => {
        fetchDashboardStats(dateRange);
        subscribeToStats();
        
        // Start Global Shipment Sync
        useShipmentStore.getState().startRealtime();

        return () => {
            unsubscribeFromStats();
            useShipmentStore.getState().stopRealtime();
        };
    }, [dateRange]);

    // Helper for internal nav bubbling
    const navigate = (path: string, id?: any) => {
        window.dispatchEvent(new CustomEvent('admin-nav', { detail: { path, id } }));
    };

    // --- ANALYTICS ENGINE (KPIs) ---
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
            totalSalesTrend: dashboardStats.salesTrendPercent || 0,
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

        const salesTrend = dashboardStats.salesTrend.map(d => d.value);
        const salesLabels = dashboardStats.salesTrend.map(d => {
            const date = new Date(d.date);
            // Always use Gregorian (English locales usually do, but let's be explicit)
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        });

        const sDist = dashboardStats.statusDistribution;
        const getCount = (statuses: string[]) => sDist.filter(s => statuses.includes(s.status)).reduce((acc, curr) => acc + curr.count, 0);

        const donutData = [
            { label: t.admin.alerts.legend.completed, value: getCount(['COMPLETED', 'DELIVERED']), color: '#4ade80' },
            { label: t.admin.alerts.legend.active, value: getCount(['SHIPPED', 'PREPARATION']), color: '#fbbf24' },
            { label: t.admin.alerts.legend.pending, value: getCount(['AWAITING_OFFERS', 'AWAITING_PAYMENT']), color: '#3b82f6' },
            { label: t.admin.alerts.legend.issues, value: getCount(['CANCELLED', 'DISPUTED', 'REFUNDED', 'RETURNED']), color: '#f87171' }
        ];

        const barData = dashboardStats.topStores.map(s => ({
            label: s.name,
            value: s.ordersCount
        }));

        return { salesTrend, salesLabels, donutData, barData };
    }, [dashboardStats, language, t]);

    if (subPath === 'billing' || subPath === 'financials') return <AdminBilling onNavigate={navigate} />;
    if (subPath === 'invoice-details' && viewId) return <InvoiceViewer invoiceId={viewId} onBack={() => navigate('billing')} />;
    if (subPath === 'resolution') return <AdminResolutionPage onNavigate={navigate} />;
    if (subPath === 'admin-dispute-details' && viewId) return <AdminDisputeDetails caseId={viewId} onBack={() => navigate('resolution')} />;
    if (subPath === 'users') return <StoreManagement onNavigate={navigate} />;
    if (subPath === 'store-profile' && viewId) return <AdminStoreProfile vendorId={viewId} onBack={() => navigate('users')} onNavigate={navigate} />;
    if (subPath === 'customers') return <CustomerManagement onNavigate={navigate} />;
    if (subPath === 'customer-profile' && viewId) return <AdminCustomerProfile customerId={viewId} onBack={() => navigate('customers')} onNavigate={navigate} />;
    if (subPath === 'reviews') return <ReviewsControl />;
    if (subPath === 'orders-control') return <OrderControl onNavigate={navigate} />;
    if (subPath === 'admin-order-details' && viewId) return <AdminOrderDetails orderId={viewId} onBack={() => navigate('orders-control')} onNavigate={navigate} />;
    if (subPath === 'audit-logs') return <AdminAuditLogs />;
    if (subPath === 'shipping') return <AdminShipping initialSearch={viewId} />;
    if (subPath === 'settings') return <AdminSettings />;
    if (subPath === 'support') return <AdminSupport />;
    if (subPath === 'security-audit') return <SecurityAudit />;

    if (!dashboardStats || isLoadingStats) {
        return <AdminHomeSkeleton />;
    }

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
                    <button
                        onClick={() => navigate('security-audit')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <ShieldCheck size={14} />
                        {t.admin.security.title}
                    </button>
                    <button 
                        onClick={() => fetchDashboardStats(dateRange)}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black rounded-xl text-xs font-bold shadow-lg shadow-gold-500/20 transition-all"
                    >
                        {t.admin.actions.refresh}
                    </button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard label={t.admin.kpi.totalSales} value={`${stats.totalSales.toLocaleString()} AED`} icon={DollarSign} color="text-gold-400" trend={stats.totalSalesTrend} />
                <KPICard 
                    label={t.admin.kpi.commission} 
                    value={`${stats.totalCommission.toLocaleString()} AED`} 
                    icon={TrendingUp} 
                    color="text-green-400" 
                    trend={8.2} 
                >
                    <p className="text-[10px] text-white/40 mt-1">{t.admin.kpi.profitSub}</p>
                </KPICard>
                <KPICard label={t.admin.kpi.orders} value={stats.totalOrders} icon={Package} color="text-blue-400" trend={-2.1} />
                <KPICard label={t.admin.kpi.customers} value={stats.activeCustomers.toLocaleString()} icon={Users} color="text-purple-400" trend={5.4} />
                <KPICard label={t.admin.kpi.stores} value={stats.activeVendors} icon={Store} color="text-pink-400" trend={0} />
                <KPICard label={t.admin.kpi.disputes} value={stats.openDisputes} icon={AlertTriangle} color="text-red-400" trend={15} />
            </div>

            {/* MAIN ANALYTICS SECTION */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Sales Chart (Large) */}
                <GlassCard className="lg:col-span-2 p-6 md:p-8 flex flex-col bg-[#1A1814]/80">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {t.admin.charts.salesTrend} ({Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 3600 * 24))} {isAr ? 'يوم' : 'Days'})
                            </h3>
                            <p className="text-xs text-white/40">{isAr ? 'نظرة شاملة على أداء المنصة المالي' : 'Overview of platform financial performance'}</p>
                        </div>
                        
                        {/* Date Pickers */}
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                            <input 
                                type="date" 
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="bg-transparent border-none text-[10px] text-white font-mono focus:ring-0 cursor-pointer"
                            />
                            <span className="text-white/20 text-xs">→</span>
                            <input 
                                type="date" 
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="bg-transparent border-none text-[10px] text-white font-mono focus:ring-0 cursor-pointer"
                            />
                        </div>

                        <div className="text-right">
                            <span className="block text-2xl font-bold text-gold-400 font-mono">{stats.totalSales.toLocaleString()} AED</span>
                            <span className="block text-[10px] text-green-400">+12.5% vs prev week</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
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
                <GlassCard className="p-6 bg-[#1A1814]/80 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">{t.admin.charts.topStores}</h3>
                        <button 
                            onClick={() => navigate('users')}
                            className="px-3 py-1 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 rounded-lg text-[10px] font-bold transition-all"
                        >
                            {t.admin.actions.viewReport}
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        {dashboardStats.topStores.map((store: any, index: number) => (
                            <div 
                                key={store.storeId}
                                onClick={() => navigate('store-profile', store.storeId)}
                                className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-gold-500/30 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                {/* Rank Badge */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    index === 0 ? 'bg-gold-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                                    index === 1 ? 'bg-slate-300 text-black' :
                                    index === 2 ? 'bg-amber-700 text-white' :
                                    'bg-white/10 text-white/40'
                                }`}>
                                    {index + 1}
                                </div>

                                {/* Store Logo */}
                                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                    {store.logo ? (
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store size={18} className="text-white/20" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-bold text-white truncate group-hover:text-gold-400 transition-colors">{store.name}</span>
                                        {store.rating > 0 && (
                                            <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/5">
                                                <span className="text-[10px] font-bold text-gold-400">{store.rating}</span>
                                                <TrendingUp size={8} className="text-gold-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                        <Package size={10} />
                                        <span>{store.ordersCount} {isAr ? 'طلبات' : 'Orders'}</span>
                                    </div>
                                </div>

                                {/* Financial Value */}
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-white font-mono">AED {store.revenue.toLocaleString()}</span>
                                    <span className="text-[9px] text-green-400 font-bold uppercase tracking-tighter">Growth</span>
                                </div>

                                <ArrowUpRight size={14} className="text-white/20 group-hover:text-gold-400 transition-colors ml-1" />
                            </div>
                        ))}

                        {dashboardStats.topStores.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 py-10">
                                <Activity size={40} strokeWidth={1} className="mb-2 opacity-20" />
                                <span className="text-xs">{isAr ? 'لا توجد بيانات متاجر حالياً' : 'No store data available'}</span>
                            </div>
                        )}
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
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-[#0F0E0C] text-[10px] uppercase text-white/30 font-bold tracking-wider">
                            <tr>
                                <th className="p-4 text-start">{t.admin.ordersTable.id}</th>
                                <th className="p-4 text-start">{isAr ? 'القطعة (Part)' : 'Part'}</th>
                                <th className="p-4 text-start">{t.admin.ordersTable.date}</th>
                                <th className="p-4 text-start">{t.admin.ordersTable.status}</th>
                                <th className="p-4 text-end px-8">{isAr ? 'التفاصيل المالية' : 'Financials'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {dashboardStats.recentOrders.map((order: any) => {
                                const allAccepted = order.offers?.filter((of: any) => ['ACCEPTED', 'COMPLETED', 'SHIPPED', 'DELIVERED'].includes(String(of.status).toUpperCase())) || [];
                                const calculatedPrice = allAccepted.length > 0 
                                    ? allAccepted.reduce((total: number, of: any) => {
                                        const base = Number(of.unitPrice || 0);
                                        const shipping = Number(of.shippingCost || 0);
                                        const percentCommission = Math.round(base * 0.25);
                                        const commission = base > 0 ? Math.max(percentCommission, 100) : 0;
                                        return total + base + shipping + commission;
                                      }, 0)
                                    : (order.totalAmount ? Number(order.totalAmount) : null);

                                const displayOffer = order.acceptedOffer || allAccepted[0];

                                return (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate('admin-order-details', order.id)}>
                                    <td className="p-4 font-mono text-gold-400 font-bold group-hover:text-gold-300">
                                        #{order.id.split('-').pop()}
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[150px]">{order.partName}</span>
                                            <span className="text-[10px] text-white/40 mt-1">{order.vehicleMake} {order.vehicleModel} {order.vehicleYear}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/50 text-xs">
                                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            year: 'numeric',
                                            numberingSystem: 'latn' 
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${
                                            order.status === 'COMPLETED' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                            order.status === 'SHIPPED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                            order.status === 'CANCELLED' ? 'text-red-400 bg-red-500/10 border-red-500/10' :
                                            'text-yellow-400 bg-yellow-500/10 border-yellow-500/10'
                                        }`}>
                                            {t.common.status[order.status]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-end px-8">
                                        <div className="flex flex-col items-end gap-0.5">
                                            {calculatedPrice ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-mono text-gold-400 font-bold text-sm">
                                                        {calculatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                                                    </div>
                                                    {!['AWAITING_OFFERS', 'AWAITING_PAYMENT', 'CANCELLED'].includes(String(order.status).toUpperCase()) && (
                                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/20">
                                                            <CheckCircle2 size={10} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="font-mono text-gold-400 font-bold text-sm">— AED</div>
                                            )}
                                            
                                            {displayOffer?.store?.name && (
                                                <div className="text-[9px] text-white/30">{displayOffer.store.name}</div>
                                            )}
                                            {!displayOffer && (
                                                <div className="text-[9px] text-white/30 flex items-center gap-1">
                                                    <span>{order._count?.offers ?? 0}</span>
                                                    <span>{isAr ? 'عرض' : 'offers'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
