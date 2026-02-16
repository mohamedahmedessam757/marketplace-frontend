
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Clock, CheckCircle2, AlertTriangle, ArrowRight, Download, Eye } from 'lucide-react';
import { useOrdersStore } from '../../../stores/useOrdersStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { GlassCard } from '../../ui/GlassCard';
import { InvoiceModal } from './InvoiceModal';
import { Order } from '../../../types';

interface BillingPageProps {
    onNavigate?: (path: string, id?: any) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { orders, fetchOrders, loading } = useOrdersStore();
    const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter Logic
    const unpaidInvoices = orders.filter(o => o.status === 'AWAITING_PAYMENT');
    const historyInvoices = orders.filter(o =>
        ['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURNED', 'DISPUTED'].includes(o.status)
    );

    const currentList = activeTab === 'unpaid' ? unpaidInvoices : historyInvoices;

    const handleViewInvoice = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            {/* 1. Header Area with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-6 flex items-center gap-4 bg-gradient-to-br from-purple-900/40 to-black/40 border-purple-500/30">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Clock className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">{t.dashboard.billing.tabs.unpaid}</p>
                        <h3 className="text-2xl font-bold text-white">{unpaidInvoices.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center gap-4 bg-gradient-to-br from-green-900/40 to-black/40 border-green-500/30">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">{t.dashboard.billing.tabs.history}</p>
                        <h3 className="text-2xl font-bold text-white">{historyInvoices.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 flex items-center gap-4 bg-gradient-to-br from-gold-900/40 to-black/40 border-gold-500/30">
                    <div className="p-3 bg-gold-500/20 rounded-xl">
                        <Receipt className="w-8 h-8 text-gold-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">{t.dashboard.billing.title}</p>
                        <h3 className="text-lg font-bold text-white max-w-[200px] leading-tight">{t.dashboard.billing.subtitle}</h3>
                    </div>
                </GlassCard>
            </div>

            {/* 2. Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'unpaid' ? 'text-gold-500' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    {t.dashboard.billing.tabs.unpaid} ({unpaidInvoices.length})
                    {activeTab === 'unpaid' && (
                        <motion.div layoutId="activeTabBill" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-gold-500' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    {t.dashboard.billing.tabs.history}
                    {activeTab === 'history' && (
                        <motion.div layoutId="activeTabBill" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
                    )}
                </button>
            </div>

            {/* 3. List */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                key={activeTab} // Resets animation on tab change
                className="space-y-4 min-h-[400px]"
            >
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : currentList.length === 0 ? (
                    <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {activeTab === 'unpaid' ? t.dashboard.billing.empty.unpaid : t.dashboard.billing.empty.history}
                        </h3>
                        <p className="text-gray-400 max-w-sm">
                            {activeTab === 'unpaid' ? 'Great! You have no pending payments at the moment.' : 'Your payment history will appear here once you complete orders.'}
                        </p>
                    </GlassCard>
                ) : (
                    currentList.map((order) => {
                        const acceptedOffer = order.offers?.find(o => o.status === 'accepted');
                        const price = acceptedOffer?.final_price || order.total_amount || 0;
                        const date = new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

                        return (
                            <motion.div variants={item} key={order.id}>
                                <GlassCard className="group p-0 overflow-hidden hover:border-gold-500/50 transition-colors">
                                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                        {/* Left: Info */}
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === 'unpaid' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                                }`}>
                                                {activeTab === 'unpaid' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white">INV-{order.order_number}</h4>
                                                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                                    <span>{date}</span>
                                                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                    <span>{order.part_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle: Amount */}
                                        <div className="text-center md:text-right w-full md:w-auto">
                                            <p className="text-sm text-gray-400 mb-1">{t.dashboard.billing.invoice.amount}</p>
                                            <p className="text-2xl font-bold text-gold-500 font-mono">
                                                {price > 0 ? price.toFixed(2) : '--'}
                                            </p>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            {activeTab === 'unpaid' ? (
                                                <button
                                                    className="flex-1 md:flex-none px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                                    onClick={() => onNavigate?.('checkout', order.id)}
                                                >
                                                    {t.dashboard.billing.invoice.pay}
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleViewInvoice(order)}
                                                    className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-white/10"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    {t.dashboard.billing.invoice.view}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Strip */}
                                    <div className="bg-white/5 px-6 py-3 flex justify-between items-center text-xs text-gray-500">
                                        <span>Order Ref: {order.order_number}</span>
                                        <button
                                            onClick={() => handleViewInvoice(order)}
                                            className="hover:text-gold-500 flex items-center gap-1 transition-colors"
                                        >
                                            <Download className="w-3 h-3" />
                                            {t.dashboard.billing.invoice.download}
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Modal */}
            <InvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};
