
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore, Vendor } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ShieldAlert, Store, Search, Filter, Eye } from 'lucide-react';

interface StoreManagementProps {
    onNavigate?: (path: string, id: any) => void;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { stores, fetchAllStores, isLoadingStores } = useAdminStore();
    const [filter, setFilter] = useState<'all' | 'pending'>('all');
    const [search, setSearch] = useState('');

    const isAr = language === 'ar';

    React.useEffect(() => {
        fetchAllStores();
    }, []);

    const filteredStores = stores.filter(store => {
        const matchesFilter = filter === 'all' || (filter === 'pending' && (store.status === 'PENDING_REVIEW' || store.status === 'PENDING_DOCUMENTS'));
        // Search by Name or Owner Name
        const matchesSearch =
            (store.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (store.owner?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] border border-green-500/20 font-bold">Active</span>;
            case 'PENDING_REVIEW': return <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-[10px] border border-yellow-500/20 font-bold animate-pulse">Pending Review</span>;
            case 'PENDING_DOCUMENTS': return <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-[10px] border border-orange-500/20 font-bold">Pending Docs</span>;
            case 'LICENSE_EXPIRED': return <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-[10px] border border-red-500/20 font-bold">License Expired</span>;
            case 'BLOCKED': return <span className="bg-black text-white/50 px-2 py-1 rounded text-[10px] border border-white/10 font-bold">Blocked</span>;
            default: return <span className="bg-white/10 text-white/50 px-2 py-1 rounded text-[10px]">Inactive</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">{t.admin.users}</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                        <input
                            type="text"
                            placeholder={t.common.search}
                            className="bg-[#151310] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none w-48 transition-all focus:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>All</button>
                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>Pending</button>
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden bg-[#151310] min-h-[400px]">
                {isLoadingStores ? (
                    <div className="flex items-center justify-center h-48 text-white/30">Loading stores...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-white/40 uppercase">
                            <tr>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.usersTable.name}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.usersTable.owner}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.usersTable.joined}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.usersTable.status}</th>
                                <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.usersTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStores.map(store => (
                                <tr key={store.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-gold-400 transition-colors">
                                                <Store size={20} />
                                            </div>
                                            <div className="font-bold text-white group-hover:text-gold-400 transition-colors">{store.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/70">
                                        <div className="font-semibold text-white">{store.owner?.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-white/30">{store.owner?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-white/50 font-mono">
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(store.status)}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => onNavigate && onNavigate('store-profile', store.id)}
                                            className="p-2 bg-white/5 hover:bg-gold-500 hover:text-white text-gold-400 rounded-lg transition-colors border border-white/10"
                                            title={t.common.details}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoadingStores && filteredStores.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                        <Store size={48} className="text-white/20 mb-4" />
                        <p className="text-white/50">No stores found matching your criteria</p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
