
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useCustomerStore } from '../../../stores/useCustomerStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, User, Mail, Phone, Lock, Unlock, Shield, Smartphone, Globe, Package, Scale, RefreshCcw } from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface AdminCustomerProfileProps {
  customerId: string;
  onBack: () => void;
  onNavigate?: (path: string, id: any) => void;
}

export const AdminCustomerProfile: React.FC<AdminCustomerProfileProps> = ({ customerId, onBack, onNavigate }) => {
  const { t, language } = useLanguage();
  const { getCustomerById, toggleStatus } = useCustomerStore();
  const { orders } = useOrderStore();
  const { cases } = useResolutionStore();
  
  const customer = getCustomerById(customerId);
  const [activeTab, setActiveTab] = useState<'orders' | 'disputes' | 'payments'>('orders');

  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronRight : ChevronLeft;

  if (!customer) return <div className="text-white">Customer not found</div>;

  // LINK: Filter orders by customer ID logic (Assuming ID mapping logic from AdminOrderDetails: Math.floor(order.id/10))
  // In a real app, orders would have a customerId field.
  const customerOrders = orders.filter(o => Math.floor(o.id / 10) === parseInt(customer.id));
  
  // LINK: Filter cases by customer name (Mock logic since we don't have customer ID in resolution store yet, or use order link)
  // We'll filter based on the orders we found for this customer.
  const customerOrderIds = customerOrders.map(o => o.id);
  const customerCases = cases.filter(c => customerOrderIds.includes(c.orderId));

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
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${customer.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'}`}>
                        {customer.status}
                    </span>
                </h1>
                <div className="text-xs text-white/40">{customer.email}</div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Col 1: Identity Card */}
            <div className="space-y-6">
                <GlassCard className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-gold-600 to-gold-400 p-[2px] rounded-full mb-4">
                        <div className="w-full h-full bg-[#1A1814] rounded-full flex items-center justify-center">
                            <User size={40} className="text-gold-400" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">{customer.name}</h2>
                    <p className="text-white/40 text-sm mb-6">Joined {customer.joinedAt}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-left border-t border-white/5 pt-6">
                        <div>
                            <div className="text-xs text-white/40 mb-1">{t.admin.customerProfile.info}</div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <Mail size={14} className="text-gold-500" />
                                {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
                                <Phone size={14} className="text-gold-500" />
                                {customer.phone}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-white/40 mb-1">Balance</div>
                            <div className="text-xl font-bold text-white font-mono">{customer.balance} {t.common.sar}</div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <button 
                            onClick={() => toggleStatus(customer.id)}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition-colors border ${
                                customer.status === 'ACTIVE' 
                                ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border-red-500/20' 
                                : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border-green-500/20'
                            }`}
                        >
                            {customer.status === 'ACTIVE' ? t.admin.customerProfile.suspendAccount : t.common.unban}
                        </button>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm border border-white/10 transition-colors">
                            {t.admin.customerProfile.resetPass}
                        </button>
                    </div>
                </GlassCard>

                {/* Security Section */}
                <GlassCard className="p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                        <Shield size={16} className="text-gold-500" />
                        {t.admin.customerProfile.security}
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-white/40 mb-2">{t.admin.customerProfile.devices}</div>
                            {customer.devices.map(device => (
                                <div key={device.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 mb-2">
                                    <div className="flex items-center gap-2">
                                        {device.type === 'Mobile' ? <Smartphone size={16} /> : <Globe size={16} />}
                                        <span className="text-sm text-white">{device.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white/40">{device.lastActive}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div>
                            <div className="text-xs text-white/40 mb-2">{t.admin.customerProfile.lastLogin}</div>
                            {customer.loginHistory.map(log => (
                                <div key={log.id} className="flex justify-between items-center text-xs p-2 border-b border-white/5 last:border-0">
                                    <span className="text-white/60">{log.date}</span>
                                    <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>{log.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Col 2 & 3: Activity Center */}
            <div className="lg:col-span-2">
                <GlassCard className="h-full flex flex-col bg-[#1A1814]">
                    <div className="flex gap-4 border-b border-white/10 p-4">
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'orders' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-white/40 hover:text-white'}`}
                        >
                            {t.admin.customerProfile.orders}
                        </button>
                        <button 
                            onClick={() => setActiveTab('disputes')}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'disputes' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-white/40 hover:text-white'}`}
                        >
                            {t.admin.customerProfile.disputes}
                        </button>
                        <button 
                            onClick={() => setActiveTab('payments')}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'payments' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-white/40 hover:text-white'}`}
                        >
                            {t.dashboard.checkout.steps.payment}
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {activeTab === 'orders' && (
                            <div className="space-y-3">
                                {customerOrders.map(order => (
                                    <div 
                                        key={order.id} 
                                        onClick={() => onNavigate && onNavigate('admin-order-details', order.id)}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-black/30 text-gold-400">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{order.part}</div>
                                                <div className="text-xs text-white/40">#{order.id} • {order.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge status={order.status} />
                                            <div className="text-sm font-mono text-white mt-1">{order.price || '-'}</div>
                                        </div>
                                    </div>
                                ))}
                                {customerOrders.length === 0 && <div className="text-center text-white/30 py-8">No orders found.</div>}
                            </div>
                        )}

                        {activeTab === 'disputes' && (
                            <div className="space-y-3">
                                {customerCases.map(c => (
                                    <div key={c.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
                                                {c.type === 'dispute' ? <Scale size={20} /> : <RefreshCcw size={20} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{c.reason}</div>
                                                <div className="text-xs text-white/40">Order #{c.orderId}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-red-400 uppercase">{c.status}</div>
                                    </div>
                                ))}
                                {customerCases.length === 0 && <div className="text-center text-white/30 py-8">{t.admin.alerts.noAlerts}</div>}
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="text-center text-white/30 py-8">No payment history available (Mock).</div>
                        )}
                    </div>
                </GlassCard>
            </div>

        </div>
    </div>
  );
};
