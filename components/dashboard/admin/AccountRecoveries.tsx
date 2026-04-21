import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { ShieldAlert, CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { client } from '../../../services/api/client';

interface RecoveryRequest {
    id: string;
    userId: string;
    userName: string; // Joined from user table
    oldPhone: string | null;
    newPhone: string;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
    balanceSnapshot: number;
    openOrdersCount: number;
    disputesCount: number;
    createdAt: string;
}

export const AccountRecoveries: React.FC = () => {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const [requests, setRequests] = useState<RecoveryRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await client.get('/auth/recovery/admin/requests');
            const data = res.data;

            const mapped = data.map((r: any) => ({
                id: r.id,
                userId: r.userId,
                userName: r.user?.name || 'Unknown',
                oldPhone: r.oldPhone,
                newPhone: r.newPhone,
                status: r.status,
                balanceSnapshot: Number(r.balanceSnapshot),
                openOrdersCount: r.openOrdersCount,
                disputesCount: r.disputesCount,
                createdAt: r.createdAt
            }));
            setRequests(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!window.confirm(isAr ? 'هل أنت متأكد من هذا الإجراء؟' : 'Are you sure about this action?')) return;

        try {
            await client.post('/auth/recovery/admin/resolve', { requestId: id, action });

            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r));
        } catch (err) {
            alert(isAr ? 'فشلت العملية' : 'Action failed');
        }
    };

    return (
        <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="text-orange-500" />
                    {isAr ? 'مراجعات استرجاع الحسابات' : 'Account Recovery Reviews'}
                </h3>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                        type="text"
                        placeholder={isAr ? 'بحث بالرقم أو المعرف...' : 'Search phone or ID...'}
                        className="bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-xs text-white/50 uppercase tracking-wider">
                            <th className="py-3 px-4">{isAr ? 'رقم الطلب' : 'Request ID'}</th>
                            <th className="py-3 px-4">{isAr ? 'العميل' : 'Customer'}</th>
                            <th className="py-3 px-4">{isAr ? 'الرقم القديم → الجديد' : 'Old → New Phone'}</th>
                            <th className="py-3 px-4">{isAr ? 'ملخص المخاطر/الرصيد' : 'Risk/Balance Snapshot'}</th>
                            <th className="py-3 px-4">{isAr ? 'تاريخ الطلب' : 'Date'}</th>
                            <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                            <th className="py-3 px-4 text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-white/40">Loading...</td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-white/40">
                                    {isAr ? 'لا توجد طلبات معلقة' : 'No pending requests'}
                                </td>
                            </tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 font-mono text-xs text-gold-400">{req.id}</td>
                                <td className="py-4 px-4 text-sm text-white font-bold">{req.userName}</td>
                                <td className="py-4 px-4 text-sm">
                                    <div className="flex items-center gap-2" dir="ltr">
                                        <span className="text-white/40">{req.oldPhone || 'N/A'}</span>
                                        <span className="text-gold-500">→</span>
                                        <span className="text-white font-mono">{req.newPhone}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="text-sm text-white flex flex-col gap-1">
                                        <span className="text-gold-400 font-bold">{req.balanceSnapshot.toFixed(2)} AED</span>
                                        <span className="text-xs text-white/50">
                                            Orders: {req.openOrdersCount} | Disputes: {req.disputesCount}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-xs text-white/40">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    {req.status === 'PENDING_REVIEW' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, 'APPROVE')}
                                                className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors tooltip"
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'REJECT')}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors tooltip"
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="text-white/40 hover:text-white" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};
