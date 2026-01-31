
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useOrderStore } from '../../../stores/useOrderStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Truck, Search, MapPin, Package, ExternalLink, AlertTriangle } from 'lucide-react';

export const AdminShipping: React.FC = () => {
  const { t, language } = useLanguage();
  const { orders } = useOrderStore();
  const [filter, setFilter] = useState<'all' | 'transit' | 'delayed'>('all');
  const [search, setSearch] = useState('');

  const isAr = language === 'ar';

  const shippedOrders = orders.filter(o => 
      ['SHIPPED', 'DELIVERED', 'RETURNED'].includes(o.status) && o.waybillNumber
  );

  const filteredOrders = shippedOrders.filter(o => {
      const matchesSearch = o.waybillNumber?.toLowerCase().includes(search.toLowerCase()) || 
                            o.id.toString().includes(search);
      
      if (!matchesSearch) return false;
      if (filter === 'transit') return o.status === 'SHIPPED';
      // Mock "Delayed" logic based on date > 5 days ago
      if (filter === 'delayed') {
          const shippedDate = o.shippedAt ? new Date(o.shippedAt).getTime() : 0;
          return o.status === 'SHIPPED' && (Date.now() - shippedDate > 5 * 24 * 60 * 60 * 1000);
      }
      return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Truck className="text-purple-500" />
                {t.admin.shippingPage.title}
            </h1>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                    <input 
                        type="text" 
                        placeholder={t.admin.shippingPage.waybill}
                        className="w-full bg-[#151310] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-purple-500 outline-none md:w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/50'}`}>All</button>
                <button onClick={() => setFilter('transit')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'transit' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'}`}>In Transit</button>
                <button onClick={() => setFilter('delayed')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'delayed' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/50'}`}>Delayed</button>
            </div>
        </div>

        <GlassCard className="p-0 overflow-hidden bg-[#151310]">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-xs text-white/40 uppercase font-bold tracking-wider">
                    <tr>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.shippingPage.waybill}</th>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.ordersTable.id}</th>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.shippingPage.courier}</th>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.shippingPage.expectedDelivery}</th>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.admin.shippingPage.status}</th>
                        <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-mono text-white font-bold">{order.waybillNumber}</div>
                                <div className="text-[10px] text-white/40">{order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : '-'}</div>
                            </td>
                            <td className="p-4 text-gold-400 font-bold">#{order.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-white">
                                    <Package size={14} className="text-white/40" />
                                    {order.courier}
                                </div>
                            </td>
                            <td className="p-4 text-white/70">{order.expectedDeliveryDate || 'TBD'}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] border font-bold uppercase ${
                                    order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                    order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <a 
                                    href="#" 
                                    className="p-2 bg-white/5 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg transition-colors border border-white/10 inline-flex items-center gap-2 text-xs font-bold"
                                >
                                    <ExternalLink size={14} />
                                    {t.admin.shippingPage.track}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredOrders.length === 0 && <div className="p-10 text-center text-white/30">{t.admin.alerts.noAlerts}</div>}
        </GlassCard>
    </div>
  );
};
