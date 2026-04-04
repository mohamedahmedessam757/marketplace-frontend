import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useCustomerStore, Customer } from '../../../stores/useCustomerStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
    ChevronLeft, ChevronRight, User, Mail, Phone, Lock, Unlock,
    Shield, Smartphone, Globe, Package, Scale, RefreshCcw,
    DollarSign, Target, MessageSquare, CheckCircle2, Loader2,
    Calendar, Clock, ShieldAlert
} from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface AdminCustomerProfileProps {
    customerId: string;
    onBack: () => void;
    onNavigate?: (path: string, id: any) => void;
}

export const AdminCustomerProfile: React.FC<AdminCustomerProfileProps> = ({ customerId, onBack, onNavigate }) => {
    const { t, language } = useLanguage();
    const { fetchCustomerById, toggleStatus, updateNotes } = useCustomerStore();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'disputes' | 'sessions' | 'security'>('orders');
    const [internalNotes, setInternalNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ChevronRight : ChevronLeft;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchCustomerById(customerId);
            if (data) {
                setCustomer(data);
                setInternalNotes(data.adminNotes || '');
            }
            setIsLoading(false);
        };
        loadData();
    }, [customerId]);

    const handleToggleStatus = async () => {
        if (!customer) return;
        await toggleStatus(customer.id);
        // Refresh local state
        setCustomer(prev => prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : null);
    };

    const handleSaveNotes = async () => {
        if (!customer) return;
        setIsSavingNotes(true);
        try {
            await updateNotes(customer.id, internalNotes);
            setCustomer(prev => prev ? { ...prev, adminNotes: internalNotes } : null);
        } finally {
            setIsSavingNotes(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-gold-400" size={32} />
            </div>
        );
    }

    if (!customer) return <div className="text-white p-8 text-center">{isAr ? 'العميل غير موجود' : 'Customer not found'}</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                    <ArrowIcon size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {customer.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${customer.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'}`}>
                            {customer.status || 'ACTIVE'}
                        </span>
                    </h1>
                    <div className="text-xs text-white/40">{customer.email}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Col 1: Identity & Stats */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-gold-600 to-gold-400 p-[2px] rounded-full mb-4">
                            <div className="w-full h-full bg-[#1A1814] rounded-full flex items-center justify-center overflow-hidden">
                                {customer.avatar ? (
                                    <img src={customer.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gold-400" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-white text-center mb-1">{customer.name}</h2>
                        <p className="text-white/40 text-xs text-center mb-6 border-b border-white/5 pb-4">
                            {isAr ? 'انضم في ' : 'Joined '}
                            {new Date(customer.joinedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                        </p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <DollarSign size={16} />
                                    </div>
                                    <span className="text-xs text-white/50">{t.admin.customersTable.ltv}</span>
                                </div>
                                <span className="font-mono font-bold text-green-400">{customer.ltv?.toFixed(2) || '0.00'} AED</span>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
                                        <Target size={16} />
                                    </div>
                                    <span className="text-xs text-white/50">{t.admin.customersTable.successRate}</span>
                                </div>
                                <span className="font-bold text-white">{customer.successRate || 0}%</span>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <Package size={16} />
                                    </div>
                                    <span className="text-xs text-white/50">{isAr ? 'عدد الطلبات' : 'Total Orders'}</span>
                                </div>
                                <span className="font-bold text-white">{customer.ordersCount || 0}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-white/5 text-sm text-white/80">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gold-500" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gold-500" />
                                <span>{customer.phone || '-'}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-2">
                            <button
                                onClick={handleToggleStatus}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all border shadow-lg flex items-center justify-center gap-2 ${customer.status === 'ACTIVE'
                                    ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border-red-500/20'
                                    : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border-green-500/20'
                                    }`}
                            >
                                {customer.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                                {customer.status === 'ACTIVE' ? (isAr ? 'حظر الحساب' : 'Suspend Account') : (isAr ? 'تنشيط الحساب' : 'Activate Account')}
                            </button>
                        </div>
                    </GlassCard>

                    {/* Admin Privacy Notes */}
                    <GlassCard className="p-5 bg-gold-500/5 border-gold-500/20">
                        <div className="flex items-center justify-between mb-3 text-gold-400 uppercase tracking-widest text-[10px] font-bold">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={14} />
                                {t.admin.customersTable.adminNotes}
                            </div>
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes || internalNotes === customer.adminNotes}
                                className="hover:text-gold-300 disabled:opacity-30 transition-all flex items-center gap-1"
                            >
                                {isSavingNotes ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                {isAr ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder={isAr ? 'اكتب ملاحظات سرية هنا...' : 'Write confidential notes here...'}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold-500/30 min-h-[100px] transition-all resize-none"
                        />
                    </GlassCard>
                </div>

                {/* Col 2 & 3: Activity Tracking */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full flex flex-col bg-[#1A1814] overflow-hidden">
                        <div className="flex gap-4 border-b border-white/5 p-4 bg-black/20">
                            {[
                                { id: 'orders', label: t.admin.customerProfile.orders, icon: Package },
                                { id: 'disputes', label: t.admin.customerProfile.disputes, icon: Scale },
                                { id: 'sessions', label: isAr ? 'الجلسات' : 'Sessions', icon: Smartphone },
                                { id: 'security', label: isAr ? 'الأمان' : 'Security', icon: Shield }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-gold-400' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-400 rounded-full shadow-[0_0_10px_#D4AF37]" />}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto">
                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-3">
                                    {customer.orders?.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => onNavigate && onNavigate('admin-order-details', order.id)}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-black/30 text-gold-400 group-hover:scale-110 transition-transform">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{order.partName}</div>
                                                    <div className="text-[10px] text-white/30 flex items-center gap-2">
                                                        <span>#{order.orderNumber}</span>
                                                        <span>•</span>
                                                        <span>{new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge status={order.status} />
                                                <div className="text-sm font-mono text-white mt-1">
                                                    {order.acceptedOffer ? (Number(order.acceptedOffer.unitPrice) + Number(order.acceptedOffer.shippingCost)).toFixed(2) + ' AED' : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!customer.orders || customer.orders.length === 0) && (
                                        <div className="text-center text-white/20 py-12 flex flex-col items-center gap-3">
                                            <Package size={40} className="opacity-20" />
                                            {isAr ? 'لم يقم بطلب أي قطعة بعد' : 'No orders placed yet.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Disputes Tab */}
                            {activeTab === 'disputes' && (
                                <div className="space-y-3">
                                    {customer.disputes?.map(caseItem => (
                                        <div key={caseItem.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 group-hover:rotate-12 transition-transform">
                                                    <Scale size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{caseItem.reason || (isAr ? 'نزاع مفتوح' : 'Open Dispute')}</div>
                                                    <div className="text-[10px] text-white/30">ID: {caseItem.id}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-red-500 uppercase px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                                                {caseItem.status}
                                            </div>
                                        </div>
                                    ))}
                                    {(!customer.disputes || customer.disputes.length === 0) && (
                                        <div className="text-center text-white/20 py-12 flex flex-col items-center gap-3">
                                            <Scale size={40} className="opacity-20" />
                                            {isAr ? 'لا توجد نزاعات أو مشاكل' : 'No active disputes.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sessions Tab */}
                            {activeTab === 'sessions' && (
                                <div className="space-y-3">
                                    {customer.Session?.map(session => (
                                        <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                    {session.device?.includes('iPhone') || session.device?.includes('Android') ? <Smartphone size={18} /> : <Globe size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{session.device || (isAr ? 'جهاز غير معروف' : 'Unknown Device')}</div>
                                                    <div className="text-[10px] text-white/30 font-mono">{session.ip || '0.0.0.0'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gold-400 font-bold mb-1 flex items-center justify-end gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    {isAr ? 'نشط الآن' : 'Active Now'}
                                                </div>
                                                <div className="text-[10px] text-white/40 italic">
                                                    {new Date(session.lastActive).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!customer.Session || customer.Session.length === 0) && (
                                        <div className="text-center text-white/20 py-12">{isAr ? 'لا توجد جلسات نشطة' : 'No active sessions found.'}</div>
                                    )}
                                </div>
                            )}

                            {/* Security Logs Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    {customer.securityLogs?.map(log => (
                                        <div key={log.id} className="flex gap-4 relative pl-8 rtl:pl-0 rtl:pr-8">
                                            <div className="absolute left-3 rtl:left-auto rtl:right-3 top-0 bottom-0 w-[1px] bg-white/10" />
                                            <div className={`absolute left-[5px] rtl:left-auto rtl:right-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-black ${log.action.includes('FAIL') || log.action.includes('BLOCK') ? 'bg-red-500' : 'bg-gold-500'
                                                }`} />
                                            <div className="flex-1 pb-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-white">{log.action}</span>
                                                    <span className="text-[10px] text-white/30 flex items-center gap-1 font-mono">
                                                        <Clock size={10} />
                                                        {new Date(log.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-white/50 bg-white/5 p-2 rounded-lg border border-white/5">
                                                    IP: <span className="font-mono text-gold-500/70">{log.ipAddress}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!customer.securityLogs || customer.securityLogs.length === 0) && (
                                        <div className="text-center text-white/20 py-12 flex flex-col items-center gap-3">
                                            <ShieldAlert size={40} className="opacity-20" />
                                            {isAr ? 'لا توجد سجلات أمنية حالياً' : 'No security logs recorded.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
