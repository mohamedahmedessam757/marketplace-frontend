import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, LifeBuoy, Plus, History, HelpCircle } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { TicketList } from './TicketList';
import { TicketForm } from './TicketForm';
import { AccordionItem } from '../../ui/Accordion';

interface SupportPageProps {
    onNavigate?: (path: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<'list' | 'new'>('list');

    const faqs = [
        { q: t.dashboard.support?.faq?.q1 || 'How can I track my order?', a: t.dashboard.support?.faq?.a1 || 'You can track your order status in real-time from the Orders page.' },
        { q: t.dashboard.support?.faq?.q2 || 'How do I request a refund?', a: t.dashboard.support?.faq?.a2 || 'Go to Resolution Center and click on "New Return Request".' },
        { q: t.dashboard.support?.faq?.q3 || 'How to contact the seller?', a: t.dashboard.support?.faq?.a3 || 'Use the Live Chat feature to communicate directly with merchants.' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <LifeBuoy className="text-gold-500" size={32} />
                        {t.dashboard.menu.support || 'Support Center'}
                    </h1>
                    <p className="text-white/50 mt-2">
                        {t.dashboard.support?.subtitle || 'Get help with your orders and account'}
                    </p>
                </div>

                {view === 'list' && (
                    <button
                        onClick={() => setView('new')}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {t.dashboard.support?.newTicket || 'New Ticket'}
                    </button>
                )}

                {view === 'new' && (
                    <button
                        onClick={() => setView('list')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <History size={20} />
                        {t.dashboard.support?.myTickets || 'My Tickets'}
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col: Tickets & Actions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <GlassCard
                            className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
                            onClick={() => onNavigate && onNavigate('chats')}
                        >
                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-colors">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{t.dashboard.support?.liveChat || 'Live Chat'}</h3>
                                <p className="text-white/40 text-sm">Talk to a representative now</p>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Main Content */}
                    <GlassCard className="p-6 md:p-8 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {view === 'list' ? (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <TicketList onNewClick={() => setView('new')} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="new"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <TicketForm onSuccess={() => setView('list')} onCancel={() => setView('list')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>

                {/* Right Col: FAQ */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6 text-gold-500">
                            <HelpCircle size={24} />
                            <h2 className="text-xl font-bold text-white">FAQ</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <AccordionItem key={idx} title={faq.q}>
                                    {faq.a}
                                </AccordionItem>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
