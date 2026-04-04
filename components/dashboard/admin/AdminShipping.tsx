import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Truck, Search, MapPin, Package, ExternalLink, AlertTriangle, CheckCircle2, Factory, ShieldCheck, Box, RefreshCcw, XCircle, FileText, ChevronRight, Save, Settings2, History } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { shipmentsApi, Shipment, ShipmentStatusLog } from '../../../services/api/shipments.api';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusTimeline } from '../../ui/StatusTimeline';
import { ShipmentTracker } from '../shipments/ShipmentTracker';
import { useShipmentStore } from '../../../stores/useShipmentStore';

// These MUST match the Prisma ShipmentStatus enum exactly
const shipmentStatuses = [
    'RECEIVED_AT_HUB',
    'QUALITY_CHECK_PASSED',
    'PACKAGED_FOR_SHIPPING',
    'AWAITING_CARRIER_PICKUP',
    'PICKED_UP_BY_CARRIER',
    'IN_TRANSIT_TO_DESTINATION',
    'ARRIVED_AT_LOCAL_FACILITY',
    'CUSTOMS_CLEARANCE',
    'AT_LOCAL_WAREHOUSE',
    'OUT_FOR_DELIVERY',
    'DELIVERY_ATTEMPTED',
    'DELIVERED_TO_CUSTOMER',
];

// Return statuses shown separately
const returnStatuses = [
    'RETURN_TO_SENDER_INITIATED',
    'RETURNED_TO_SENDER',
];

const statusTranslations: Record<string, { ar: string, en: string }> = {
    'RECEIVED_AT_HUB':           { ar: '1️⃣ تم استلام الطلب', en: '1️⃣ Order Received' },
    'QUALITY_CHECK_PASSED':      { ar: '2️⃣ قيد تجهيز المتجر', en: '2️⃣ Store Preparing' },
    'PACKAGED_FOR_SHIPPING':     { ar: '3️⃣ تم توثيق القطعة', en: '3️⃣ Part Verified' },
    'AWAITING_CARRIER_PICKUP':   { ar: '4️⃣ جاهز للتسليم', en: '4️⃣ Ready for Pickup' },
    'PICKED_UP_BY_CARRIER':      { ar: '5️⃣ تم التسليم لشركة الشحن', en: '5️⃣ Handed to Carrier' },
    'IN_TRANSIT_TO_DESTINATION': { ar: '6️⃣ قيد الشحن الدولي', en: '6️⃣ International Transit' },
    'ARRIVED_AT_LOCAL_FACILITY': { ar: '7️⃣ في منطقة العبور (Transit)', en: '7️⃣ In Transit Zone' },
    'CUSTOMS_CLEARANCE':         { ar: '8️⃣ وصل إلى دولة العميل / الجمارك', en: '8️⃣ Arrived / Customs' },
    'AT_LOCAL_WAREHOUSE':        { ar: '9️⃣ وصل لمستودع مدينتك', en: '9️⃣ At Local Warehouse' },
    'OUT_FOR_DELIVERY':          { ar: '🔟 خرج للتوصيل', en: '🔟 Out for Delivery' },
    'DELIVERY_ATTEMPTED':        { ar: '📍 محاولة توصيل', en: '📍 Delivery Attempt' },
    'DELIVERED_TO_CUSTOMER':     { ar: '✅ تم التسليم', en: '✅ Delivered' },
    'RETURN_TO_SENDER_INITIATED':{ ar: '↩️ بدء الإرجاع', en: '↩️ Return Initiated' },
    'RETURNED_TO_SENDER':        { ar: '🔄 تم الإرجاع', en: '🔄 Returned' },
};

interface AdminShippingProps {
    initialSearch?: string;
}

export const AdminShipping: React.FC<AdminShippingProps> = ({ initialSearch }) => {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const { shipments, isLoading: storeLoading, silentFetchShipments } = useShipmentStore();
    const [search, setSearch] = useState(initialSearch || '');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

    // Form inputs
    const [formCarrierType, setFormCarrierType] = useState('EXTERNAL');
    const [formCarrierName, setFormCarrierName] = useState('');
    const [formTrackingNumber, setFormTrackingNumber] = useState('');
    const [formStatus, setFormStatus] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formCustomsDelayNote, setFormCustomsDelayNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [logs, setLogs] = useState<ShipmentStatusLog[]>([]);
    const [view, setView] = useState<'list' | 'detail'>('list');

    useEffect(() => {
        // We only fetch if the list is empty to provide a real-time experience
        // The subscription in AdminHome handles background updates
        if (shipments.length === 0) {
            useShipmentStore.getState().fetchShipments();
        }
    }, [shipments.length]);

    // Sync effect: If the selected shipment is updated in the store (via realtime), update the local details view
    useEffect(() => {
        if (selectedShipment) {
            const updated = shipments.find(s => s.id === selectedShipment.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(selectedShipment)) {
                setSelectedShipment(updated);
            }
        }
    }, [shipments, selectedShipment]);

    // Effect to auto-select if initialSearch matches an order perfectly
    useEffect(() => {
        if (initialSearch && shipments.length > 0) {
            const found = shipments.find(s => 
                s.orderId === initialSearch || 
                (s.order as any)?.orderNumber === initialSearch ||
                s.id === initialSearch
            );
            if (found) {
                handleSelectShipment(found);
                setView('detail');
            }
        }
    }, [initialSearch, shipments]);

    const loadShipments = async () => {
        await silentFetchShipments();
    };

    const handleSelectShipment = async (s: Shipment) => {
        setSelectedShipment(s);
        setView('detail');
        setFormCarrierType(s.carrierType);
        setFormCarrierName(s.carrierName || '');
        setFormTrackingNumber(s.trackingNumber || '');
        setFormStatus(s.status);
        setFormCustomsDelayNote(s.customsDelayNote || '');
        setFormNotes('');
        try {
            const history = await shipmentsApi.getLogs(s.id);
            setLogs(history || []);
        } catch (e) {
            console.error("Failed to fetch logs", e);
            setLogs([]);
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedShipment) return;
        setIsSaving(true);
        try {
            const updated = await shipmentsApi.updateStatus(selectedShipment.id, {
                status: formStatus,
                notes: formNotes,
                customsDelayNote: formCustomsDelayNote,
                carrierName: formCarrierName,
                trackingNumber: formTrackingNumber
            });
            alert(isAr ? 'تم حفظ التعديلات وتحديث حالة الطلب وإشعار العميل.' : 'Changes saved, order status updated and customer notified.');
            
            // The store's silent fetch will trigger the sync useEffect above
            await silentFetchShipments();
            setSelectedShipment(updated);
            setFormNotes('');
            const history = await shipmentsApi.getLogs(updated.id);
            setLogs(history || []);
        } catch (error: any) {
            console.error('Save error', error);
            alert(isAr ? 'خطأ في الحفظ.' : 'Save failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredShipments = shipments.filter(s => {
        const query = search.toLowerCase();
        const orderNumber = (s.order as any)?.orderNumber || s.orderId;
        return orderNumber.toLowerCase().includes(query)
            || (s.trackingNumber || '').toLowerCase().includes(query)
            || (s.carrierName || '').toLowerCase().includes(query);
    });

    const allStatuses = [...shipmentStatuses, ...returnStatuses];
    const getStatusIndex = (st: string) => allStatuses.indexOf(st);

    if (view === 'detail' && selectedShipment) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between bg-[#1A1814] p-6 rounded-2xl border border-white/5 sticky top-0 z-30 shadow-xl">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setView('list')}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group"
                        >
                            <ChevronRight size={20} className="rtl:rotate-0 rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Truck className="text-purple-400" />
                                {isAr ? 'إدارة الشحنة التفصيلية' : 'Detailed Shipment Management'}
                            </h2>
                            <p className="text-white/50 text-sm flex items-center gap-2">
                                <Badge status={selectedShipment.status} />
                                <span>{isAr ? `طلب #${selectedShipment.orderId}` : `Order #${selectedShipment.orderId}`}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                             onClick={handleSaveChanges} 
                             disabled={isSaving}
                             className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold transition-all shadow-lg flex items-center gap-2"
                        >
                             {isSaving ? <RefreshCcw className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>}
                             {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Progress Column */}
                    <div className="lg:col-span-3">
                        <GlassCard className="p-0 overflow-hidden bg-[#1A1814]">
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <MapPin size={18} className="text-purple-400"/> 
                                    {isAr ? 'نظرة عامة على حالة الطلب' : 'Order Status Overview'}
                                </h3>
                                <StatusTimeline currentStatus={selectedShipment.status as any} />
                            </div>
                            
                            <div className="p-8 bg-black/20">
                                <ShipmentTracker status={selectedShipment.status} variant="admin" />
                            </div>
                        </GlassCard>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-6 bg-[#1A1814]">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings2 size={18} className="text-blue-400"/> {isAr ? 'تحديث الحالة والخدمات' : 'Update Status & Services'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-white/40 font-bold uppercase mb-2 tracking-widest">{isAr ? 'الحالة المستهدفة' : 'Target Status'}</label>
                                        <select 
                                            value={formStatus} 
                                            onChange={(e) => setFormStatus(e.target.value)}
                                            className="w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-purple-500 outline-none transition-all font-bold"
                                        >
                                            {shipmentStatuses.map(st => (
                                                <option key={st} value={st}>{statusTranslations[st]?.[isAr ? 'ar' : 'en'] || st}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 font-bold uppercase mb-2 tracking-widest">{isAr ? 'ملاحظة التحديث' : 'Update Note'}</label>
                                        <textarea 
                                            value={formNotes}
                                            onChange={e => setFormNotes(e.target.value)}
                                            placeholder={isAr ? 'اكتب ملاحظات للشحنة هنا...' : 'Write shipment notes here...'}
                                            className="w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-purple-500 outline-none h-32 resize-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-xs text-white/40 font-bold uppercase mb-2 tracking-widest">{isAr ? 'رقم التتبع' : 'Tracking Number'}</label>
                                        <div className="relative">
                                            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text" 
                                                value={formTrackingNumber}
                                                onChange={e => setFormTrackingNumber(e.target.value)}
                                                className="w-full bg-[#151310] border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white font-mono focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 font-bold uppercase mb-2 tracking-widest">{isAr ? 'شركة الشحن' : 'Carrier'}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['ARAMEX', 'SMSA', 'SPL', 'DHL', 'FEDEX', 'OTHER'].map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setFormCarrierName(c === 'OTHER' ? '' : c)}
                                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${formCarrierName === c ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/5 text-white/20 hover:text-white-40'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder={isAr ? 'اسم شركة الشحن...' : 'Carrier name...'}
                                            value={formCarrierName}
                                            onChange={e => setFormCarrierName(e.target.value)}
                                            className="w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-3 mt-3 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Logs in Detail View */}
                        <GlassCard className="p-6 bg-[#1A1814]">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <History size={18} className="text-orange-400"/> 
                                {isAr ? 'سجل تتبع الشحنة المفصل' : 'Detailed Shipment Audit Log'}
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-white/5">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-black/20 text-white/40 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="p-4">{isAr ? 'التاريخ' : 'Date'}</th>
                                            <th className="p-4">{isAr ? 'من' : 'From'}</th>
                                            <th className="p-4">{isAr ? 'إلى' : 'To'}</th>
                                            <th className="p-4">{isAr ? 'بواسطة' : 'By'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.map(log => (
                                            <tr key={log.id} className="hover:bg-white/5">
                                                <td className="p-4 text-white/60 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                                                <td className="p-4 text-white/40">{statusTranslations[log.fromStatus || '']?.[isAr?'ar':'en'] || '-'}</td>
                                                <td className="p-4 text-purple-400 font-bold">{statusTranslations[log.toStatus]?.[isAr?'ar':'en'] || log.toStatus}</td>
                                                <td className="p-4 text-white/60 font-bold">{log.source}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Order Meta Column */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/20">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Box size={16}/> {isAr ? 'ملخص الطلب' : 'Order Summary'}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-white/40 text-xs">{isAr ? 'رقم الطلب' : 'Order ID'}</span>
                                    <span className="text-white font-mono text-xs">#{(selectedShipment.order as any)?.orderNumber || selectedShipment.orderId.substring(0,8)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-white/40 text-xs">{isAr ? 'العميل' : 'Customer'}</span>
                                    <span className="text-white font-bold text-xs">{(selectedShipment.order as any)?.customer?.name || 'Customer'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-white/40 text-xs">{isAr ? 'آخر تحديث' : 'Last Sync'}</span>
                                    <span className="text-white/40 text-[10px]">{new Date(selectedShipment.updatedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
            



            {/* Main Screen Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Truck className="text-purple-500" />
                        {isAr ? 'إدارة التوصيل وشركات الشحن' : 'Shipping & Logistics Management'}
                    </h1>
                    <p className="text-white/50 text-sm mt-1">{isAr ? 'التحكم في حركة الشحنات للطلبات وإشعارات شركات الشحن' : 'Manage order operations and logistics tracking'}</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                    <input 
                        type="text" 
                        placeholder={isAr ? "رقم الطلب، رقم التتبع..." : "Order ID, Tracking..."}
                        className="w-full bg-[#151310] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none md:w-64 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden bg-[#1A1814] border-white/5">
                <table className="w-full text-right" dir="rtl">
                    <thead className="bg-[#151310] text-xs text-white/40 uppercase font-bold tracking-wider border-b border-white/5">
                        <tr>
                            <th className="p-4 text-right w-[25%]">{isAr ? 'الشحنة / الطلب' : 'Shipment / Order'}</th>
                            <th className="p-4 text-right w-[20%]">{isAr ? 'شركة الشحن' : 'Carrier'}</th>
                            <th className="p-4 text-right w-[20%]">{isAr ? 'الحالة الحالية' : 'Current Status'}</th>
                            <th className="p-4 text-right w-[20%]">{isAr ? 'تاريخ التحديث' : 'Last Updated'}</th>
                            <th className="p-4 text-center w-[15%]">{isAr ? 'الإجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredShipments.map(shipment => (
                            <tr key={shipment.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Package size={20} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white mb-1">
                                                    {(shipment.order as any)?.orderNumber ? `#${(shipment.order as any).orderNumber}` : `Order #${shipment.orderId.substring(0,8)}`}
                                                </div>
                                                <div className="text-[10px] text-white/30 font-mono tracking-wider">{shipment.id.substring(0,8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                <td className="p-4">
                                    <div className="font-bold text-white/90">{shipment.carrierName || '-'}</div>
                                    <div className="text-xs text-white/30 font-mono mt-0.5">{shipment.trackingNumber || '-'}</div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[11px] font-bold leading-none">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"/>
                                        {statusTranslations[shipment.status]?.[isAr ? 'ar' : 'en'] || shipment.status}
                                    </span>
                                </td>
                                <td className="p-4 text-white/50 text-xs font-mono">
                                    {new Date(shipment.updatedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleSelectShipment(shipment)}
                                        className="py-2 px-4 bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl transition-all border border-purple-500/20 inline-flex items-center gap-2 text-[11px] font-bold shadow-lg shadow-purple-500/0 hover:shadow-purple-500/20"
                                    >
                                        <ExternalLink size={14} />
                                        {isAr ? 'إدارة الشحنة' : 'Manage'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredShipments.length === 0 && (
                    <div className="p-16 text-center flex flex-col items-center">
                        <Truck size={48} className="text-white/10 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">{isAr ? 'لا توجد شحنات نشطة' : 'No active shipments'}</h3>
                        <p className="text-white/40">{isAr ? 'لم يتم العثور على بيانات شحن حالياً.' : 'No shipping data found at the moment.'}</p>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
