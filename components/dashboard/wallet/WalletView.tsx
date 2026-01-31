
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Plus, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProfileStore } from '../../../stores/useProfileStore';

export const WalletView: React.FC = () => {
  const { t, language } = useLanguage();
  const { cards, addCard, transactions } = useProfileStore();
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', cvv: '' });

  const handleAddCard = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCard.number && newCard.expiry && newCard.holder) {
          addCard({
              last4: newCard.number.slice(-4),
              expiry: newCard.expiry,
              holder: newCard.holder.toUpperCase()
          });
          setNewCard({ number: '', expiry: '', holder: '', cvv: '' });
          setShowAddCard(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Wallet className="text-gold-500" size={32} />
                    {t.dashboard.profile.tabs.wallet}
                </h1>
                <p className="text-white/50 text-sm">Manage your payment methods and balance</p>
            </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <GlassCard className="p-6 md:p-10">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">{t.dashboard.profile.wallet.myCards}</h3>
                                <button 
                                    onClick={() => setShowAddCard(!showAddCard)}
                                    className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                                >
                                    {showAddCard ? <X size={14} /> : <Plus size={14} />}
                                    {showAddCard ? 'Cancel' : t.dashboard.profile.wallet.addNew}
                                </button>
                            </div>

                            {/* Add Card Form */}
                            <AnimatePresence>
                                {showAddCard && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleAddCard}
                                        className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <input type="text" placeholder="Card Number" value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} className="w-full bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500" maxLength={19} />
                                            </div>
                                            <div className="flex gap-4">
                                                <input type="text" placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({...newCard, expiry: e.target.value})} className="w-1/2 bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500" maxLength={5} />
                                                <input type="text" placeholder="CVV" value={newCard.cvv} onChange={e => setNewCard({...newCard, cvv: e.target.value})} className="w-1/2 bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500" maxLength={3} />
                                            </div>
                                            <div>
                                                <input type="text" placeholder="Card Holder Name" value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value})} className="w-full bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500 uppercase" />
                                            </div>
                                            <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-colors">Save Card</button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="grid md:grid-cols-2 gap-6">
                                {cards.map((card) => (
                                    <div key={card.id} className="relative h-48 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-black border border-white/10 p-6 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <div className="flex justify-between items-start">
                                            <div className="text-white/50 text-xs font-mono">{card.brand.toUpperCase()}</div>
                                            {card.brand === 'visa' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 brightness-200 opacity-80" alt="Visa" />}
                                            {card.brand === 'mastercard' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 opacity-80" alt="Mastercard" />}
                                        </div>
                                        <div className="text-xl font-mono text-white tracking-widest my-4">**** **** **** {card.last4}</div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xs text-white/50">
                                                <div>EXPIRY</div>
                                                <div className="text-white font-mono text-sm">{card.expiry}</div>
                                            </div>
                                            <div className="text-sm font-bold text-white/80">{card.holder}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Placeholder */}
                                <button 
                                    onClick={() => setShowAddCard(true)}
                                    className="h-48 rounded-2xl border-2 border-dashed border-white/10 hover:border-gold-500/50 hover:bg-white/5 flex flex-col items-center justify-center gap-3 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white transition-colors text-white/30">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-white/50 group-hover:text-white transition-colors">{t.dashboard.profile.wallet.addNew}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </GlassCard>
            </div>

            {/* Transactions Sidebar */}
            <div className="lg:col-span-1">
                <GlassCard className="h-full bg-[#151310] border-white/5">
                    <h3 className="font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-white/30 text-sm text-center py-4">No transactions yet</div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-red-500/10 text-red-400">
                                            <ArrowUpRight size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">{tx.merchant}</div>
                                            <div className="text-white/30 text-[10px]">{tx.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-mono text-sm">-{tx.amount} {tx.currency}</div>
                                        <div className="text-[10px] text-green-400 uppercase">{tx.status}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    </div>
  );
};
