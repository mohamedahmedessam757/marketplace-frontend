
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAuditStore, ActionType } from '../../../stores/useAuditStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Filter, Database, Clock, User, FileText, ChevronRight, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminAuditLogs: React.FC = () => {
    const { t, language } = useLanguage();
    const { logs, fetchLogs } = useAuditStore();
    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    React.useEffect(() => {
        fetchLogs();
    }, []);

    const isAr = language === 'ar';

    const filteredLogs = logs.filter(l => {
        const matchesAction = filterAction === 'ALL' || l.action === filterAction;
        const matchesSearch = l.id.toLowerCase().includes(search.toLowerCase()) ||
            l.actorName.toLowerCase().includes(search.toLowerCase()) ||
            (l.orderId && l.orderId.toString().includes(search));
        return matchesAction && matchesSearch;
    });

    const getActionColor = (action: ActionType) => {
        switch (action) {
            case 'CREATE': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'DELETE': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'UPDATE': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'STATUS_CHANGE': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'FINANCIAL': return 'text-gold-400 bg-gold-500/10 border-gold-500/20';
            default: return 'text-white/50 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Database className="text-gold-500" />
                    {t.admin.auditPage.title}
                </h1>
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.common.search}
                            className="bg-[#151310] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="bg-[#151310] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-gold-500 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="STATUS_CHANGE">Status</option>
                        <option value="FINANCIAL">Financial</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors text-sm">
                        <Download size={14} />
                        CSV
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <GlassCard className="p-0 overflow-hidden bg-[#151310]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-white/40 uppercase font-bold tracking-wider">
                            <tr>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.auditPage.timestamp}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.auditPage.filterActor}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.auditPage.filterAction}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.auditPage.filterEntity}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.auditPage.details}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        className={`hover:bg-white/5 transition-colors cursor-pointer ${expandedLogId === log.id ? 'bg-white/5' : ''}`}
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                    >
                                        <td className="p-4 font-mono text-white/60 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-white/30 mt-1">{log.id}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                                                    <User size={12} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{log.actorName}</div>
                                                    <div className="text-[10px] text-white/40">{log.actorType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] border font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/80">
                                            {log.entity} {log.orderId ? `(#${log.orderId})` : ''}
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronDown
                                                size={16}
                                                className={`text-white/40 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`}
                                            />
                                        </td>
                                    </tr>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedLogId === log.id && (
                                            <tr>
                                                <td colSpan={5} className="p-0">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="bg-[#0F0E0C] border-y border-white/5 overflow-hidden"
                                                    >
                                                        <div className="p-6 grid md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-white/40 uppercase mb-3">{t.admin.auditPage.changes}</h4>
                                                                <div className="bg-[#1A1814] rounded-xl border border-white/10 p-4 font-mono text-xs text-green-400 overflow-x-auto">
                                                                    <pre>{JSON.stringify({
                                                                        previous: log.previousState,
                                                                        new: log.newState,
                                                                        metadata: log.metadata
                                                                    }, null, 2)}</pre>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-white/40 uppercase mb-1">Reason</h4>
                                                                    <p className="text-white text-sm">{log.reason || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-white/40 uppercase mb-1">Actor ID</h4>
                                                                    <p className="text-white text-sm font-mono">{log.actorId}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && <div className="p-10 text-center text-white/30 text-sm">No logs found.</div>}
                </div>
            </GlassCard>
        </div>
    );
};
