import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { waybillsApi } from './../../../services/api/waybills';
import { useLanguage } from './../../../contexts/LanguageContext';
import { FileText, Printer, ChevronDown, ChevronUp, Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlassCard } from './../../ui/GlassCard';
import { supabase } from '../../../services/supabase';

interface OrderWaybillsPanelProps {
    orderId: string;
    orderStatus: string;
    role: 'ADMIN' | 'SUPER_ADMIN' | 'MERCHANT' | 'CUSTOMER';
    initialData?: any[];
}

export const OrderWaybillsPanel: React.FC<OrderWaybillsPanelProps> = ({ orderId, orderStatus, role, initialData }) => {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const isRTL = isAr;
    const [waybills, setWaybills] = useState<any[]>(initialData && initialData.length > 0 ? initialData : []);
    const [isLoading, setIsLoading] = useState(true);

    const [isIssuing, setIsIssuing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeWaybill, setActiveWaybill] = useState<any | null>(null);
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const fetchWaybills = async () => {
        try {
            const res = await waybillsApi.getByOrder(orderId);
            const list = Array.isArray(res.waybills) ? res.waybills : [];
            setWaybills(list);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch waybills:', err);
            setError(err.response?.data?.message || 'Failed to load waybills');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCollapse = (id: string) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        // Always fetch fresh data from backend to ensure accuracy.
        // initialData is only used as an optimistic pre-fill.
        fetchWaybills();

        // Subscribe to realtime insert events for this order's waybills
        const channel = supabase
            .channel(`waybills:order:${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'shipping_waybills',
                    filter: `order_id=eq.${orderId}`
                },
                () => {
                    // Refetch when a new waybill arrives
                    fetchWaybills();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    const handleIssueWaybill = async () => {
        if (!window.confirm(isAr ? 'تأكيد إصدار بوليصات الشحن لهذا الطلب؟' : 'Confirm issuing waybills for this order?')) {
            return;
        }
        setIsIssuing(true);
        setError(null);
        try {
            await waybillsApi.issue(orderId);
            await fetchWaybills();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to issue waybills');
        } finally {
            setIsIssuing(false);
        }
    };

    const handlePrint = (wb: any) => {
        setActiveWaybill(wb);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setActiveWaybill(null);
        }, 300);
    };

    if (isLoading) {
        return <div className="text-white/50 text-center py-8">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>;
    }

    const canIssue = (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        (['VERIFICATION_SUCCESS', 'READY_FOR_SHIPPING'].includes(orderStatus) && waybills.length === 0) ||
        (orderStatus === 'RETURN_APPROVED')
    );

    // Shared Visual Content for Screen/Print
    const WaybillVisualContent: React.FC<{ wb: any, isPrint?: boolean }> = ({ wb, isPrint = false }) => {
        const isReturn = wb.waybillNumber?.startsWith('RTN');
        const qrData = `E-Tashleh|WB|${wb.waybillNumber}|Order:${wb.orderId}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        // 2026 Dynamic Color Palette (Blue for Returns, Gold for Shipping)
        const themeColor = isReturn ? 'cyan' : 'amber';
        const themeHex = isReturn ? '#06b6d4' : '#f59e0b';

        return (
            <div className={`${isPrint ? 'bg-white text-black p-8' : 'bg-white/5 text-white p-6 md:p-8'} relative overflow-hidden transition-all duration-500`}>
                {/* Watermark Logo */}
                <div className={`absolute inset-0 flex items-center justify-center ${isPrint ? 'opacity-[0.04]' : 'opacity-[0.06]'} pointer-events-none`}>
                    <img src="/logo.png" alt="" className={isPrint ? 'w-[400px] filter invert' : 'w-[300px]'} />
                </div>

                <div className={`flex justify-between items-start mb-8 border-b ${isPrint ? 'border-gray-200' : 'border-white/10'} pb-6 relative z-10`}>
                    <div className="flex gap-4 items-center">
                        <img src="/logo.png" alt="Logo" className={`w-16 h-16 object-contain ${isPrint ? 'filter invert' : ''}`} />
                        <div>
                            <h2 className={`text-2xl font-black tracking-tighter uppercase ${isPrint ? 'text-black' : 'text-white'}`}>
                                {isAr ? (isReturn ? 'بوليصة إرجاع' : 'بوليصة شحن') : (isReturn ? 'RETURN WAYBILL' : 'SHIPPING WAYBILL')}
                            </h2>
                            <p className={`${isPrint ? 'text-gray-500' : 'text-white/40'} text-[10px] font-black mt-1 uppercase tracking-[0.3em]`}>
                                E-TASHLEH.NET MARKETPLACE
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <img src={qrUrl} alt="QR Code" className={`w-24 h-24 border ${isPrint ? 'border-gray-200' : 'border-white/10'} p-1 bg-white`} />
                        <div className={`font-mono text-[10px] font-black mt-2 text-center ${isPrint ? 'text-gray-800' : (isReturn ? 'text-cyan-500' : 'text-amber-500/70')}`}>{wb.waybillNumber}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 relative z-10">
                    <div className="space-y-4">
                        <div>
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isPrint ? 'text-gray-400 border-gray-100' : `text-${themeColor}-500/40 border-${themeColor}-500/10`} border-b pb-1`}>
                                {isAr ? 'المرسِل (From)' : 'Sender (From)'}
                            </h3>
                            
                            {/* Header Logic: Returns show Sender Name, Forward shows Platform Authority */}
                            <div className={`font-black text-xl tracking-tighter ${isPrint ? 'text-black' : 'text-white'}`}>
                                {isReturn ? (wb.senderName || 'Customer') : 'E-TASHLEH.NET'}
                            </div>

                            {/* Store Authorization (Crucial for Forward Shipments) */}
                            {!isReturn && (
                                <div className={`text-sm font-semibold mt-1 ${isPrint ? 'text-gray-700' : 'text-white/70'}`}>
                                    {isAr ? 'مفوّض عن المتجر:' : 'Authorized for Store:'} <span className={isPrint ? '' : 'text-amber-500'}>{wb.storeName}</span>
                                </div>
                            )}

                            {/* Detailed Logistics Metadata (2026 Schema) */}
                            {(wb.senderPhone || wb.senderCity) ? (
                                <>
                                    <div className={`text-sm font-bold mt-1 ${isPrint ? 'text-gray-700' : 'text-white/70'}`}>
                                        {wb.senderPhone}
                                    </div>
                                    <div className={`text-xs font-black mt-1 uppercase tracking-wider ${isPrint ? 'text-gray-800' : `text-${themeColor}-500`}`}>
                                        {wb.senderCity}{wb.senderCity && wb.senderCountry ? ', ' : ''}{wb.senderCountry}
                                    </div>
                                    <div className={`text-xs mt-2 leading-relaxed max-w-xs ${isPrint ? 'text-gray-600' : 'text-white/40'}`}>
                                        {wb.senderAddress}
                                    </div>
                                </>
                            ) : (
                                /* Legacy/Missing Data Fallback: Store Code */
                                !isReturn && wb.storeCode && (
                                    <div className={`text-[10px] mt-1 uppercase font-mono ${isPrint ? 'text-gray-500' : 'text-white/30'}`}>
                                        Store Code: {wb.storeCode}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-left md:text-right">
                        <div>
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isPrint ? 'text-gray-400 border-gray-100' : `text-${themeColor}-500/40 border-${themeColor}-500/10`} border-b pb-1`}>
                                {isAr ? 'المرسَل إليه (To)' : 'Recipient (To)'}
                            </h3>
                            
                            {/* Platform Branding for Return Journey */}
                            {isReturn && (
                                <div className={`text-[10px] font-black text-gold-500/80 uppercase tracking-[0.3em] mb-2`}>
                                    E-TASHLEH.NET MARKETPLACE
                                </div>
                            )}

                            <div className={`font-black text-xl tracking-tighter ${isPrint ? 'text-black' : 'text-white'}`}>{wb.recipientName}</div>
                            <div className={`text-sm font-bold mt-1 font-mono ${isPrint ? 'text-gray-700' : 'text-white/60'}`}>{wb.recipientPhone}</div>
                            <div className={`text-xs font-black mt-1 uppercase tracking-wider ${isPrint ? 'text-gray-800' : `text-${themeColor}-500`}`}>{wb.recipientCity}, {wb.recipientCountry}</div>
                            <div className={`text-xs mt-2 leading-relaxed md:ml-auto max-w-xs ${isPrint ? 'text-gray-600' : 'text-white/40'}`}>{wb.recipientAddress}</div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {wb.customerCode && (
                                    <div className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg ${isPrint ? 'bg-gray-100 text-gray-700' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                                        {isAr ? 'معرف العميل' : 'Client Node ID'}: {wb.customerCode}
                                    </div>
                                )}
                                {isReturn && wb.storeCode && (
                                    <div className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg ${isPrint ? 'bg-gray-100 text-gray-700' : 'bg-gold-500/10 text-gold-500/70 border border-gold-500/20'}`}>
                                        {isAr ? 'كود المتجر' : 'Store Code'}: {wb.storeCode}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`border rounded-xl overflow-hidden relative z-10 ${isPrint ? 'border-gray-200' : 'border-white/10 shadow-2xl'}`}>
                    <table className="w-full text-left">
                        <thead className={isPrint ? 'bg-gray-50 border-b border-gray-200' : 'bg-white/5 border-b border-white/10'}>
                            <tr>
                                <th className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest ${isPrint ? 'text-gray-500' : 'text-white/40'} ${isAr ? 'text-right' : 'text-left'}`}>
                                {isAr ? 'الصنف والتفاصيل' : 'Item Description'}
                                </th>
                                <th className={`py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest ${isPrint ? 'text-gray-500' : 'text-white/40'}`}>Qty</th>
                                <th className={`py-3 px-4 ${isAr ? 'text-left' : 'text-right'} text-[10px] font-black uppercase tracking-widest ${isPrint ? 'text-gray-500' : 'text-white/40'}`}>
                                    {isAr ? 'القيمة' : 'Value'} ({wb.currency})
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isPrint ? 'divide-gray-100' : 'divide-white/5'}`}>
                            <tr>
                                <td className={`py-5 px-4 ${isAr ? 'text-right' : 'text-left'}`}>
                                    <div className={`font-black ${isPrint ? 'text-black' : 'text-white'}`}>{wb.partName}</div>
                                    <div className={`text-xs mt-1 font-medium ${isPrint ? 'text-gray-500' : 'text-white/30'}`}>{wb.partDescription || 'Auto part / قطع غيار'}</div>
                                </td>
                                <td className={`py-5 px-4 text-center font-mono font-black ${isPrint ? 'text-gray-700' : 'text-white/50'}`}>1</td>
                                <td className={`py-5 px-4 ${isAr ? 'text-left' : 'text-right'} font-mono font-black ${isPrint ? 'text-black' : `text-${themeColor}-500`}`}>
                                    {Number(wb.finalPrice).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 2026 Dedicated Logistics Band: Round-trip Shipping */}
                    {Number(wb.shippingRefund) > 0 && (
                        <div className={`p-4 border-t border-dashed ${isPrint ? 'border-gray-300 bg-gray-50/50' : 'border-white/10 bg-cyan-500/5'} flex justify-between items-center`}>
                            <div className="flex items-center gap-3">
                                <Truck size={16} className={isPrint ? 'text-gray-600' : 'text-cyan-400'} />
                                <div>
                                    <div className={`text-[11px] font-black uppercase tracking-widest ${isPrint ? 'text-black' : 'text-cyan-400'}`}>
                                        {isAr ? 'الشحن ذهاباً وإياباً' : 'Round-trip Shipping'}
                                    </div>
                                    <div className={`text-[9px] font-medium ${isPrint ? 'text-gray-500' : 'text-white/30'}`}>
                                        {isAr ? 'رسوم لوجستية إضافية متفق عليها' : 'Additional agreed logistics fees'}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-mono font-black text-sm ${isPrint ? 'text-black' : 'text-cyan-400'}`}>
                                {Number(wb.shippingRefund).toLocaleString()} {wb.currency}
                            </div>
                        </div>
                    )}

                    <div className={`p-4 flex justify-between items-center ${isPrint ? 'bg-gray-50 border-t border-gray-200' : 'bg-white/5 border-t border-white/5'}`}>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isPrint ? 'text-gray-400' : 'text-white/20'}`}>
                            {isAr ? 'تاريخ الإصدار' : 'Issue Date'}: {new Date(wb.issuedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const WaybillPrintStyles = () => (
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                html, body {
                    height: auto !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    background: white !important;
                    overflow: visible !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Hide everything naturally rendered by the app */
                body > *:not(#special-waybill-print-container) {
                    display: none !important;
                }

                #special-waybill-print-container {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 15mm !important;
                    background: white !important;
                    color: black !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }
                
                @page {
                    size: A4 portrait;
                    margin: 0 !important;
                }
            }
        `}} />
    );

    return (
        <>
            <WaybillPrintStyles />

            {/* Print Container: Only rendered/visible during printing */}
            {isPrinting && activeWaybill && (
                <div id="special-waybill-print-container" className="hidden print:block">
                    <WaybillVisualContent wb={activeWaybill} isPrint={true} />
                </div>
            )}

            {!isPrinting && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
                            <ShieldAlert size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {waybills.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                            <Truck size={48} className="mx-auto mb-4 text-white/20" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                {isAr ? 'لا توجد بوليصات شحن' : 'No Shipping Waybills Found'}
                            </h3>
                            <p className="text-white/50 mb-6 max-w-md mx-auto">
                                {isAr 
                                    ? 'لم يتم إصدار بوليصات الشحن القطع بعد. يتم إصدار البوليصة فقط بعد نجاح عملية التوثيق.' 
                                    : 'Order waybills have not been issued yet. Waybills are issued only after successful verification.'}
                            </p>
                            
                            {canIssue && (
                                <button 
                                    onClick={handleIssueWaybill}
                                    disabled={isIssuing}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold rounded-xl hover:from-amber-400 hover:to-yellow-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                    {isIssuing ? (
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    ) : <CheckCircle2 size={18} />}
                                    {isAr ? 'إصدار بوليصات الشحن (تلقائي)' : 'Issue Shipping Waybills (Auto)'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-widest text-cyan-500/80">
                                <Truck className="text-cyan-500" />
                                {isAr ? 'بوليصات الشحن الموثقة (2026)' : 'Verified Shipping Waybills'}
                            </h3>
                            
                            <div className="grid gap-6">
                                {Array.isArray(waybills) && waybills.map((wb, idx) => (
                                    <GlassCard key={wb.id} className="p-0 overflow-hidden relative border-white/10 group">
                                        {/* Action Header */}
                                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{isAr ? 'رقم التتبع' : 'Tracking ID'}</div>
                                                    <div className="font-mono font-black text-white tracking-tighter">{wb.waybillNumber}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handlePrint(wb)} 
                                                    className={`flex items-center gap-2 px-5 py-2.5 ${wb.waybillNumber?.startsWith('RTN') ? 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'} text-black font-black rounded-xl transition-all shadow-lg text-[10px] uppercase`}
                                                >
                                                    <Printer size={14} />
                                                    <span>{isAr ? 'طباعة / PDF' : 'Print'}</span>
                                                </button>
                                                <button 
                                                    onClick={() => toggleCollapse(wb.id)}
                                                    className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all border border-white/10 ml-1"
                                                >
                                                    {collapsedIds.has(wb.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Invoice Visual Content */}
                                        {!collapsedIds.has(wb.id) && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                                <WaybillVisualContent wb={wb} isPrint={false} />
                                            </div>
                                        )}
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dedicated print structure: Mounted outside the React tree via Portal */}
            {isPrinting && activeWaybill && typeof window !== 'undefined' && createPortal(
                <div id="special-waybill-print-container" dir={isRTL ? 'rtl' : 'ltr'}>
                    <WaybillPrintStyles />
                    <WaybillVisualContent wb={activeWaybill} isPrint={true} />
                </div>,
                document.body
            )}
        </>
    );
};

