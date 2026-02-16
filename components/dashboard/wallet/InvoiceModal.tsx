
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, FileText } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Order } from '../../../types';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !order) return null;

    // Helper to get accepted offer
    const acceptedOffer = order.offers?.find(o => o.status === 'accepted');
    const invoiceNumber = `INV-${order.order_number}`; // Use real order number
    const dealerName = acceptedOffer?.store?.name || order.store?.name || (language === 'ar' ? 'غير محدد' : 'Unknown');
    const invoiceDate = new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

    // Calculations
    const price = acceptedOffer?.unit_price || 0;
    const shipping = acceptedOffer?.shipping_cost || 0;
    const vat = (price + shipping) * 0.15; // Assuming 15% VAT, logic might need adjustment based on business rules
    const total = acceptedOffer?.final_price || (price + shipping + vat); // Use final_price if available, else calc

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-4xl bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    {/* Header Actions - Hidden in Print */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 print:hidden bg-gray-50 dark:bg-[#252525]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gold-500" />
                            {t.dashboard.billing?.invoice?.details || 'Invoice Details'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                                title={t.dashboard.billing?.invoice?.print}
                            >
                                <Printer className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-8 md:p-12 print:p-8" ref={printRef}>
                        {/* 1. Header with Logo */}
                        <div className="flex justify-between items-start mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">E-Tashleh.net</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Automotive Marketplace</p>
                                <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    <p>{t.dashboard.billing?.invoice?.id}: <span className="font-mono font-bold text-gray-900 dark:text-white">{invoiceNumber}</span></p>
                                    <p>{t.dashboard.billing?.invoice?.date}: <span className="font-medium">{invoiceDate}</span></p>
                                    <p>{t.dashboard.billing?.invoice?.status}: <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === 'AWAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {order.status === 'AWAITING_PAYMENT' ? (t.status?.pending || 'Pending') : (t.status?.completed || 'Paid')}
                                    </span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center mb-2 mx-auto md:mx-0">
                                    {/* QR Code Placeholder - In real app use qrcode.react */}
                                    <div className="border-4 border-gray-900 dark:border-white w-16 h-16" />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center md:text-right">Scan to verify</p>
                            </div>
                        </div>

                        {/* 2. Bill To / Ship To */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div>
                                <h3 className="text-gold-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                    {t.dashboard.billing?.invoice?.sender}
                                </h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">{dealerName}</p>
                                    <p>{t.dashboard.billing?.invoice?.billTo}: Marketplace Vendor</p>
                                    <p>Support: support@e-tashleh.net</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gold-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                    {t.dashboard.billing?.invoice?.receiver}
                                </h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">{order.customer?.name || 'Guest Customer'}</p>
                                    <p>{order.vehicle_make} {order.vehicle_model} {order.vehicle_year}</p>
                                    <p>{order.city || 'City not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Items Table */}
                        <div className="mb-12">
                            <table className="w-full text-sm text-left rtl:text-right">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-s-lg">{t.dashboard.billing?.invoice?.item}</th>
                                        <th scope="col" className="px-6 py-3">{t.dashboard.billing?.invoice?.qty}</th>
                                        <th scope="col" className="px-6 py-3 text-right rounded-e-lg">{t.dashboard.billing?.invoice?.price}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 dark:text-gray-200">
                                    <tr className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-white/5">
                                        <td className="px-6 py-4 font-medium">
                                            {order.part_name}
                                            <p className="text-xs text-gray-500 mt-1">{order.part_description}</p>
                                        </td>
                                        <td className="px-6 py-4">1</td>
                                        <td className="px-6 py-4 text-right font-mono">{price.toFixed(2)}</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-white/5">
                                        <td className="px-6 py-4 font-medium">{t.dashboard.billing?.invoice?.shipping}</td>
                                        <td className="px-6 py-4">1</td>
                                        <td className="px-6 py-4 text-right font-mono">{shipping.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t.dashboard.billing?.invoice?.subtotal}</span>
                                    <span className="font-mono">{(price + shipping).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t.dashboard.billing?.invoice?.vat}</span>
                                    <span className="font-mono">{vat.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-white/10">
                                    <span>{t.dashboard.billing?.invoice?.grandTotal}</span>
                                    <span className="text-gold-500 font-mono">{total.toFixed(2)} <span className="text-xs">SAR</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-500 print:mt-24">
                            <p>Thank you for using E-Tashleh.net</p>
                            <p className="mt-1">This is a sophisticated electronic invoice generated by the system.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
