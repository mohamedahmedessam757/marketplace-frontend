import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Plus, X, ArrowUpRight, ArrowDownLeft, ShieldCheck, Repeat, Clock, HelpCircle, FileText, Gift, Users } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useBillingStore } from '../../../stores/useBillingStore';
import { useCustomerWalletStore, subscribeToWalletUpdates } from '../../../stores/useCustomerWalletStore';

interface WalletViewProps {
    onNavigate?: (path: string, id?: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onNavigate }) => {
    const { language } = useLanguage();
    const { cards, addCard } = useBillingStore();
    const { stats, transactions, isLoading, fetchWalletData } = useCustomerWalletStore();
    
    useEffect(() => {
        fetchWalletData();
        const sub = subscribeToWalletUpdates();
        return () => {
            sub?.unsubscribe();
        };
    }, [fetchWalletData]);

    const isAr = language === 'ar';

    const getStatusAr = (status: string) => {
        const arMap: Record<string, string> = {
            'SUCCESS': 'ناجح',
            'REFUNDED': 'مسترجع',
            'PENDING': 'قيد الانتظار',
            'FAILED': 'فاشل',
            'SHIPPED': 'تم الشحن',
            'CANCELLED': 'ملغي',
            'DELIVERED': 'تم التوصيل',
            'COMPLETED': 'مكتمل',
            'PREPARATION': 'جاري التجهيز',
            'AWAITING_PAYMENT': 'في انتظار الدفع',
            'VERIFICATION': 'قيد التحقق',
            'READY_FOR_SHIPPING': 'جاهز للشحن'
        };
        return isAr ? (arMap[status] || status) : status;
    };

    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', cvv: '' });

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCard.number && newCard.expiry && newCard.holder) {
            addCard({
                last4: newCard.number.slice(-4),
                brand: newCard.number.startsWith('4') ? 'visa' : 'mastercard',
                expiryMonth: parseInt(newCard.expiry.split('/')[0] || '0'),
                expiryYear: parseInt(newCard.expiry.split('/')[1] || '0'),
                cardHolderName: newCard.holder.toUpperCase()
            });
            setNewCard({ number: '', expiry: '', holder: '', cvv: '' });
            setShowAddCard(false);
        }
    };

    const refundedTransactions = transactions.filter(t => t.status === 'REFUNDED');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Wallet className="text-gold-500" size={32} />
                        {isAr ? 'المحفظة الذكية' : 'Smart Wallet'}
                    </h1>
                    <p className="text-white/50 text-sm">
                        {isAr ? 'إدارة أرصدتك، نقاط الولاء، البطاقات والمدفوعات الشاملة بكل أمان.' : 'Securely manage your balances, loyalty points, cards, and payments.'}
                    </p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <GlassCard className="p-5 flex flex-col justify-center border-white/10 hover:border-gold-500/30 transition-colors">
                    <span className={`text-white/40 text-[10px] sm:text-xs uppercase font-bold mb-2 flex items-center ${isAr ? 'gap-2 justify-start' : 'gap-2 justify-start'}`}>
                        <Wallet size={14}/> {isAr ? 'الرصيد المتاح' : 'Available Balance'}
                    </span>
                    <span className="text-2xl font-bold text-white">{stats?.customerBalance || 0} <span className="text-xs text-white/50">AED</span></span>
                </GlassCard>
                
                <GlassCard className="p-5 flex flex-col justify-center border-white/10 hover:border-gold-500/30 transition-colors">
                    <span className="text-white/40 text-[10px] sm:text-xs uppercase font-bold mb-2 flex items-center gap-2">
                        <CreditCard size={14}/> {isAr ? 'إجمالي المشتريات' : 'Total Spent'}
                    </span>
                    <span className="text-2xl font-bold text-white">{stats?.totalSpent || 0} <span className="text-xs text-white/50">AED</span></span>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col justify-center border-white/10 hover:border-gold-500/30 transition-colors">
                    <span className="text-white/40 text-[10px] sm:text-xs uppercase font-bold mb-2 flex items-center gap-2">
                        <ShieldCheck size={14}/> {isAr ? 'الطلبات المكتملة' : 'Completed Paid Orders'}
                    </span>
                    <span className="text-2xl font-bold text-white">{stats?.completedOrders || 0} <span className="text-xs text-white/50">{isAr ? 'طلب' : 'Orders'}</span></span>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col justify-center border-red-500/20 bg-red-500/5 hover:border-red-500/50 transition-colors">
                    <span className="text-red-400/80 text-[10px] sm:text-xs uppercase font-bold mb-2 flex items-center gap-2">
                        <Repeat size={14}/> {isAr ? 'المبالغ المستردة' : 'Total Refunded'}
                    </span>
                    <span className="text-2xl font-bold text-red-500">{stats?.refundedAmount || 0} <span className="text-xs text-red-500/50">AED</span></span>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col justify-center bg-gradient-to-br from-gold-500/10 gap-1 border-gold-500/30 hover:border-gold-500/60 transition-colors">
                    <span className="text-gold-500/80 text-[10px] sm:text-xs uppercase font-bold flex items-center gap-2">
                        <Gift size={14}/> {isAr ? 'نقاط الولاء' : 'Loyalty Points'}
                    </span>
                    <span className="text-2xl font-bold text-gold-500">{stats?.loyaltyPoints || 0}</span>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col justify-center border-purple-500/20 hover:border-purple-500/50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                    <span className="text-purple-400/80 text-[10px] sm:text-xs uppercase font-bold mb-2 flex items-center gap-2 relative z-10">
                        <Users size={14}/> {isAr ? 'المستوى والإحالات' : 'Tier & Referrals'}
                    </span>
                    <div className="flex items-end justify-between relative z-10">
                        <span className="text-lg md:text-xl font-bold text-purple-400 uppercase tracking-widest">{stats?.loyaltyTier || 'BRONZE'}</span>
                        <span className="text-xs font-bold text-white/70 bg-white/5 px-2 py-1 rounded-md">{stats?.referralCount || 0} {isAr ? 'إحالات' : 'Refs'}</span>
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Payment History Table & Refunds (Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    <GlassCard className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Clock className="text-gold-500" />
                                {isAr ? 'سجل الطلبات والدفع' : 'Payment History'}
                            </h3>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F0E0C]/50">
                            <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-xs text-white/50 uppercase tracking-wider">
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التاريخ' : 'Date'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المبلغ' : 'Amount'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'حالة الدفع' : 'Payment Status'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'حالة الطلب' : 'Order Status'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'نوع العملية' : 'Type'}</th>
                                        <th className="p-4 font-semibold text-center">{isAr ? 'الإجراء' : 'Action'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-white/30">{isAr ? 'لا توجد معاملات بعد' : 'No transactions yet'}</td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className={`p-4 font-bold text-white/90 ${isAr ? 'text-right' : 'text-left'}`}>#{tx.order?.orderNumber || '0000'}</td>
                                                <td className={`p-4 text-white/60 ${isAr ? 'text-right' : 'text-left'}`}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                <td className={`p-4 font-mono text-white ${isAr ? 'text-right' : 'text-left'}`}>{tx.totalAmount} {tx.currency}</td>
                                                <td className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                        tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        tx.status === 'REFUNDED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                        'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    }`}>
                                                        {getStatusAr(tx.status)}
                                                    </span>
                                                </td>
                                                <td className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                                                    <span className="text-white/70 text-xs px-2 py-1 bg-white/5 rounded-md border border-white/10 uppercase">
                                                        {getStatusAr(tx.order?.status || '---')}
                                                    </span>
                                                </td>
                                                <td className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {tx.status === 'REFUNDED' ? (
                                                            <><ArrowDownLeft size={14} className="text-red-400"/> {isAr ? 'استرجاع' : 'Refund'}</>
                                                        ) : (
                                                            <><ArrowUpRight size={14} className="text-green-400"/> {isAr ? 'دفع' : 'Payment'}</>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => onNavigate?.('order-details', tx.orderId)}
                                                        title={isAr ? 'عرض الفاتورة' : 'View Invoice'} 
                                                        className="p-2 bg-white/5 hover:bg-gold-500 hover:text-[#0F0E0C] rounded-lg transition-all text-white/50 m-auto flex"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Active Refunds Section */}
                    <GlassCard className="p-6 md:p-8 border-red-500/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Repeat className="text-red-400" />
                                {isAr ? 'قسم المسترجعات النشطة' : 'Active Refunds'}
                            </h3>
                            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                                {refundedTransactions.length} {isAr ? 'عمليات' : 'Transactions'}
                            </span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {refundedTransactions.length === 0 ? (
                                <p className="text-white/40 text-sm">{isAr ? 'لا توجد طلبات استرجاع.' : 'No refund requests.'}</p>
                            ) : (
                                refundedTransactions.map(rtx => (
                                    <div key={rtx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#110f0d] border border-red-500/10 rounded-xl hover:border-red-500/30 transition-colors">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                                <Repeat size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{isAr ? 'طلب مسترد #' : 'Refunded Order #'}{rtx.order?.orderNumber}</p>
                                                <p className="text-xs text-white/40">{new Date(rtx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-red-400">{rtx.totalAmount} {rtx.currency}</span>
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold tracking-wider uppercase border border-red-500/20">
                                                {isAr ? 'مكتمل' : 'COMPLETED'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                </div>

                {/* Cards Sidebar (Span 1) */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6 h-full bg-[#151310] border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CreditCard className="text-gold-500" size={20} />
                                {isAr ? 'بطاقاتي' : 'My Cards'}
                            </h3>
                            <button
                                onClick={() => setShowAddCard(!showAddCard)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 text-white/50 hover:text-black flex items-center justify-center transition-all"
                            >
                                {showAddCard ? <X size={16} /> : <Plus size={16} />}
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Add Card Form */}
                            <AnimatePresence>
                                {showAddCard && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleAddCard}
                                        className="bg-[#1A1814] border border-gold-500/20 rounded-2xl p-5 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                                    >
                                        <div className="space-y-3">
                                            <input type="text" placeholder={isAr ? 'رقم البطاقة' : 'Card Number'} value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} className="w-full bg-[#110F0D] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gold-500 transition-colors" maxLength={19} />
                                            <div className="flex gap-3">
                                                <input type="text" placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} className="w-1/2 bg-[#110F0D] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gold-500 transition-colors" maxLength={5} />
                                                <input type="text" placeholder="CVV" value={newCard.cvv} onChange={e => setNewCard({ ...newCard, cvv: e.target.value })} className="w-1/2 bg-[#110F0D] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gold-500 transition-colors" maxLength={3} />
                                            </div>
                                            <input type="text" placeholder={isAr ? 'اسم حامل البطاقة' : 'Card Holder Name'} value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} className="w-full bg-[#110F0D] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-gold-500 uppercase transition-colors" />
                                            <button type="submit" className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-gold-500/20 mt-2 text-sm">
                                                {isAr ? 'حفظ البطاقة' : 'Save Card'}
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {cards.map((card) => (
                                <div key={card.id} className="relative h-44 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#111] border border-white/10 p-5 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] hover:border-gold-500/30 transition-all shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="text-white/50 text-xs font-mono">{card.brand.toUpperCase()}</div>
                                        {card.brand === 'visa' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 brightness-200 opacity-80" alt="Visa" />}
                                        {card.brand === 'mastercard' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 opacity-80" alt="Mastercard" />}
                                    </div>
                                    <div className="text-lg font-mono text-white tracking-widest my-3 relative z-10" dir="ltr">**** **** **** {card.last4}</div>
                                    <div className="flex justify-between items-end relative z-10">
                                        <div className="text-[10px] text-white/50">
                                            <div className="mb-0.5 uppercase tracking-wider">{isAr ? 'تاريخ الانتهاء' : 'EXPIRY'}</div>
                                            <div className="text-white font-mono text-xs" dir="ltr">{String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}</div>
                                        </div>
                                        <div className="text-xs font-bold text-white/80 uppercase truncate max-w-[120px]">{card.cardHolderName}</div>
                                    </div>
                                </div>
                            ))}

                            {cards.length === 0 && !showAddCard && (
                                <div className="text-center py-10 border border-dashed border-white/10 hover:border-gold-500/30 rounded-2xl bg-white/5 transition-all">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-white/30">
                                        <CreditCard size={24} />
                                    </div>
                                    <p className="text-white/40 text-sm mb-4">{isAr ? 'لا توجد بطاقات محفوظة' : 'No saved cards'}</p>
                                    <button 
                                        onClick={() => setShowAddCard(true)}
                                        className="text-gold-500 text-sm font-bold hover:text-gold-400 transition-colors"
                                    >
                                        + {isAr ? 'إضافة بطاقة جديدة' : 'Add New Card'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
