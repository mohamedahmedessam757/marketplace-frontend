
import React, { useMemo } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { Clock, ChevronRight, BellRing, AlertOctagon } from 'lucide-react';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';

export const AdminAlerts: React.FC = () => {
    const { t, language } = useLanguage();
    const { dashboardStats } = useAdminStore(); // Use global dash stats
    // We can keep specific stores if we need clickable actions later, but for the list, use backend stats.

    const alerts = useMemo(() => {
        if (!dashboardStats?.alerts) return [];

        return dashboardStats.alerts.map(a => {
            let title = '';
            let msg = '';

            // Map Codes to Translations
            switch (a.code) {
                case 'LATE_RESPONSE':
                    title = t.admin.alerts.types.no_response;
                    msg = `${a.count} orders waiting > 24h`;
                    break;
                case 'LATE_PREP':
                    title = t.admin.alerts.types.late_prep;
                    msg = `${a.count} orders delayed > 48h`;
                    break;
                case 'LICENSE_EXPIRING':
                    title = t.admin.alerts.types.license_expiry;
                    msg = `${a.count} Stores Expiring Soon`;
                    break;
                case 'LICENSE_EXPIRED':
                    title = t.admin.alerts.types.license_expired;
                    msg = `${a.count} Stores Expired`;
                    break;
                case 'DISPUTES_OPEN':
                    title = t.admin.alerts.types.dispute;
                    msg = `${a.count} Active Cases`;
                    break;
                default:
                    title = 'System Alert';
                    msg = `Code: ${a.code}`;
            }

            return {
                id: a.code,
                type: a.type,
                title,
                msg,
                priority: a.priority
            };
        }).sort((a, b) => (a.priority === 'critical' ? -1 : 1)); // Sort critical first
    }, [dashboardStats, t]);

    return (
        <GlassCard className="h-full bg-[#1A1814]/80 flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold flex items-center gap-3">
                    <div className="relative">
                        <BellRing className="text-gold-500" size={24} />
                        {alerts.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
                        {alerts.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1A1814]" />}
                    </div>
                    {t.admin.alerts.title}
                </h3>
                <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-1 rounded">{alerts.length} Active</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="text-green-500" size={32} />
                        </div>
                        <p className="text-white/60 text-sm">{t.admin.alerts.noAlerts}</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div
                            key={alert.id + idx}
                            className={`
                            relative p-4 rounded-xl border flex items-center gap-4 transition-all hover:translate-x-1 cursor-pointer group
                            ${alert.type === 'error'
                                    ? 'bg-gradient-to-r from-red-900/20 to-transparent border-red-500/30'
                                    : 'bg-gradient-to-r from-orange-900/20 to-transparent border-orange-500/30'}
                        `}
                        >
                            {/* Left Color Bar */}
                            <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-orange-500'}`} />

                            <div className={`p-3 rounded-full shrink-0 ${alert.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {alert.type === 'error' ? <AlertOctagon size={20} /> : <Clock size={20} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold truncate ${alert.type === 'error' ? 'text-red-200' : 'text-orange-200'}`}>
                                    {alert.title}
                                </h4>
                                <p className="text-xs text-white/50 mt-1 truncate">{alert.msg}</p>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-white/10 rounded-full text-white">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
};

// Helper component for empty state
const CheckCircle2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
