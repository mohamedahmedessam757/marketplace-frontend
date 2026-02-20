import React, { useEffect } from 'react';
import { useSupportStore } from '../../../stores/useSupportStore';
import { MessageSquare, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const TicketList: React.FC<{ onNewClick: () => void; onNavigate?: (ticketId: string) => void }> = ({ onNewClick, onNavigate }) => {
    const { t } = useLanguage();
    const { tickets, loading, fetchTickets } = useSupportStore();

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'CLOSED': return 'text-white/40 bg-white/5 border-white/10';
            default: return 'text-white/60 bg-white/5 border-white/10';
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-white/50">{t.dashboard.common?.loading || 'Loading tickets...'}</div>;
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center py-20">
                <MessageSquare className="mx-auto text-white/20 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">{t.dashboard.support?.noTickets || 'No tickets found'}</h3>
                <p className="text-white/50 mb-6">{t.dashboard.support?.noTicketsDesc || 'You haven\'t submitted any support tickets yet.'}</p>
                <button
                    onClick={onNewClick}
                    className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl transition-colors"
                >
                    {t.dashboard.support?.createTicket || 'Create New Ticket'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <div
                    key={ticket.id}
                    onClick={() => onNavigate && onNavigate(ticket.id)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/50 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                                {ticket.status === 'CLOSED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-gold-500 transition-colors">
                                    {ticket.subject}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                    <span>#{ticket.ticket_number || ticket.id.toString().slice(0, 8)}</span>
                                    <span>•</span>
                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                            <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
