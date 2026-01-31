
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { TrendingUp, Package, DollarSign, Clock, CheckCircle2, Box, RefreshCcw, Activity, Zap, Star, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export const MerchantHome: React.FC = () => {
    const { t, language } = useLanguage();
    const { orders } = useOrderStore();
    const { performance, documents, vendorStatus } = useVendorStore();
    const { addNotification, notifications } = useNotificationStore();
    const isAr = language === 'ar';

    // --- LOGIC: License Expiry Check ---
    const license = documents.license;
    let licenseWarning = null;

    // Notification Logic
    useEffect(() => {
        if (license.expiryDate) {
            const today = new Date();
            const expiry = new Date(license.expiryDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 30 && diffDays > 0) {
                const alreadyNotified = notifications.some(n => n.type === 'docExpiry' && !n.isRead);
                if (!alreadyNotified) {
                    addNotification({
                        type: 'docExpiry',
                        titleKey: 'docExpiry',
                        message: isAr
                            ? `تنبيه: رخصة البلدية تنتهي خلال ${diffDays} يوم. يرجى التجديد.`
                            : `Warning: Municipality License expires in ${diffDays} days.`,
                        linkTo: 'docs',
                        priority: 'urgent',
                        channels: ['app']
                    });
                }
            }
        }
    }, [license.expiryDate, addNotification, notifications, isAr]);

    // UI Banner Logic
    if (license.expiryDate) {
        const today = new Date();
        const expiry = new Date(license.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0 || vendorStatus === 'LICENSE_EXPIRED') {
            licenseWarning = { type: 'expired', title: t.dashboard.merchant.alerts.accountRestricted, msg: t.dashboard.merchant.alerts.licenseExpired };
        } else if (diffDays <= 30) {
            licenseWarning = { type: 'warning', title: t.dashboard.merchant.alerts.attention, msg: `${t.dashboard.merchant.alerts.licenseExpiring} (${diffDays} ${t.common.days})` };
        }
    }

    // KPI Calculations (Connected to store)
    const newRequests = orders.filter(o => o.status === 'AWAITING_OFFERS').length;
    const submittedOffers = orders.filter(o => o.status === 'AWAITING_PAYMENT').length;
    const acceptedOffers = orders.filter(o => ['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status)).length;
    const preparingOrders = orders.filter(o => o.status === 'PREPARATION').length;
    const totalSales = orders
        .filter(o => ['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status) && o.price)
        .reduce((acc, curr) => acc + parseFloat(curr.price?.replace(/[^0-9.]/g, '') || '0'), 0);
    const dueBalance = totalSales * 0.8;

    const orderStats = [
        { label: t.dashboard.merchant.kpi.newRequests, value: newRequests, icon: Box, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: t.dashboard.merchant.kpi.submittedOffers, value: submittedOffers, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: t.dashboard.merchant.kpi.acceptedOffers, value: acceptedOffers, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: t.dashboard.merchant.kpi.preparing, value: preparingOrders, icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: t.dashboard.merchant.kpi.totalSales, value: totalSales.toLocaleString(), unit: t.common.sar, icon: TrendingUp, color: 'text-gold-400', bg: 'bg-gold-500/10' },
        { label: t.dashboard.merchant.kpi.dueBalance, value: dueBalance.toLocaleString(), unit: t.common.sar, icon: DollarSign, color: 'text-white', bg: 'bg-white/10' },
    ];

    // Dynamic KPIs from Vendor Store
    const kpiCards = [
        { label: t.dashboard.merchant.kpi.responseSpeed, value: `${performance.responseSpeed} ${t.dashboard.merchant.kpi.hours}`, icon: Zap, status: performance.responseSpeed < 4 ? 'good' : 'bad' },
        { label: t.dashboard.merchant.kpi.prepSpeed, value: `${performance.prepSpeed} ${t.dashboard.merchant.kpi.hours}`, icon: Activity, status: performance.prepSpeed < 24 ? 'good' : 'bad' },
        { label: t.dashboard.merchant.kpi.acceptanceRate, value: `${performance.acceptanceRate}%`, icon: CheckCircle2, status: performance.acceptanceRate > 50 ? 'good' : 'bad' },
        { label: t.dashboard.merchant.kpi.rating, value: performance.rating, icon: Star, status: performance.rating > 4.5 ? 'good' : 'risk' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* LICENSE WARNING BANNER */}
            {licenseWarning && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border flex items-start gap-4 ${licenseWarning.type === 'expired'
                            ? 'bg-red-500/10 border-red-500/30 text-red-200'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                        }`}
                >
                    <div className={`p-2 rounded-full ${licenseWarning.type === 'expired' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">{licenseWarning.title}</h3>
                        <p className="opacity-80 text-sm mb-3">{licenseWarning.msg}</p>
                        {/* Add action button if expired */}
                        {licenseWarning.type === 'expired' && (
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
                                {t.dashboard.merchant.alerts.updateLicense}
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1814] to-[#2A2620] border border-gold-500/20 shadow-xl p-8">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.merchant.home.welcome}</h1>
                        <p className="text-white/60">{t.dashboard.merchant.home.welcomeSub}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm font-bold">{t.dashboard.merchant.home.online}</span>
                    </div>
                </div>
            </div>

            {/* KPI SECTION */}
            <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Activity className="text-gold-500" />
                    {t.dashboard.merchant.kpi.title}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((kpi, idx) => (
                        <GlassCard key={idx} className="p-4 bg-[#151310] border-white/5 hover:border-gold-500/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{kpi.label}</span>
                                <kpi.icon size={16} className={kpi.status === 'good' ? 'text-green-400' : kpi.status === 'risk' ? 'text-yellow-400' : 'text-red-400'} />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${kpi.status === 'good' ? 'bg-green-500/10 text-green-400' :
                                    kpi.status === 'risk' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-red-500/10 text-red-400'
                                }`}>
                                {kpi.status === 'good' ? t.dashboard.merchant.kpi.excellent : kpi.status === 'risk' ? t.dashboard.merchant.kpi.good : t.dashboard.merchant.kpi.risk}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Order Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {orderStats.map((stat, idx) => (
                    <GlassCard key={idx} className="p-4 flex flex-col justify-between h-32 hover:border-gold-500/30 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white leading-none mb-1">
                                {stat.value} <span className="text-[10px] text-white/40 align-top">{stat.unit}</span>
                            </h3>
                            <p className="text-white/50 text-xs font-medium whitespace-nowrap">{stat.label}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Alerts & Earnings */}
            <div className="grid lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-2 min-h-[350px] p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-8 shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-white">{t.dashboard.merchant.kpi.earnings}</h3>
                            <p className="text-xs text-white/40">{t.dashboard.merchant.kpi.weekly}</p>
                        </div>
                        <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                            <RefreshCcw size={16} />
                        </button>
                    </div>

                    {/* Mock Graph Visual */}
                    <div className="flex-1 flex items-end justify-between gap-3 h-48 w-full">
                        {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-3 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                                    className="w-full bg-gradient-to-t from-gold-900/40 via-gold-500 to-gold-400 rounded-t-md relative group-hover:brightness-110 transition-all shadow-[0_0_10px_rgba(168,139,62,0.2)]"
                                />
                                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider">
                                    {t.common.daysShort?.[i] || ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="min-h-[350px] bg-red-900/5 border-red-500/10">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {t.dashboard.merchant.alerts.urgent}
                    </h3>

                    <div className="space-y-4">
                        {preparingOrders > 0 ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Package className="text-red-400 mt-1" size={16} />
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{t.dashboard.merchant.alerts.latePrep}</h4>
                                        <p className="text-xs text-white/60 leading-relaxed mb-2">
                                            {isAr ? `لديك ${preparingOrders} طلبات مدفوعة يجب شحنها خلال 24 ساعة.` : `You have ${preparingOrders} paid orders to ship within 24 hours.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="text-green-400" size={16} />
                                <span className="text-xs text-green-200">{t.dashboard.merchant.alerts.none}</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

        </div>
    );
};
