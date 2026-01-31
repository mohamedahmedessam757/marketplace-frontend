
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useSupportStore, SupportTicket } from '../../../stores/useSupportStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAdminStore } from '../../../stores/useAdminStore';
import { Search, MessageSquare, User, CheckCircle2, Clock, Send, ChevronRight, ChevronLeft, Filter, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminSupport: React.FC = () => {
  const { t, language } = useLanguage();
  const { tickets, addMessage, updateStatus } = useSupportStore();
  const { currentAdmin } = useAdminStore();
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  const filteredTickets = tickets.filter(t => filter === 'ALL' || (filter === 'OPEN' ? t.status !== 'RESOLVED' && t.status !== 'CLOSED' : t.status === 'RESOLVED'));

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    
    addMessage(selectedTicket.id, {
      senderId: currentAdmin?.id || 'ADMIN',
      senderRole: 'admin',
      text: replyText,
    });
    setReplyText('');
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-400 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* LEFT: Ticket List */}
      <GlassCard className="w-1/3 min-w-[350px] flex flex-col p-0 overflow-hidden bg-[#151310] border-white/5">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="text-gold-500" />
            {t.admin.support.title}
          </h2>
          <div className="flex gap-2 mb-4">
             <button onClick={() => setFilter('ALL')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${filter === 'ALL' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40'}`}>All</button>
             <button onClick={() => setFilter('OPEN')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${filter === 'OPEN' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'border-transparent text-white/40'}`}>Open</button>
             <button onClick={() => setFilter('RESOLVED')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${filter === 'RESOLVED' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'border-transparent text-white/40'}`}>Resolved</button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="w-full bg-[#1A1814] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-gold-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-gold-500/10 border-l-4 border-l-gold-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                <span className="text-[10px] text-white/30">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1 truncate">{ticket.subject}</h4>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <User size={12} />
                {ticket.userName}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* RIGHT: Chat Detail */}
      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden bg-[#1A1814] border-white/5 relative">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-[#151310] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                  <span className="text-xs text-gold-400 font-mono">#{selectedTicket.id}</span>
                </div>
                <div className="text-xs text-white/40 flex gap-2">
                   <span>{selectedTicket.userType.toUpperCase()}</span> • <span>{selectedTicket.email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 {selectedTicket.status !== 'RESOLVED' ? (
                   <button 
                      onClick={() => updateStatus(selectedTicket.id, 'RESOLVED')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors"
                   >
                      <CheckCircle2 size={14} />
                      Mark Resolved
                   </button>
                 ) : (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs font-bold border border-white/10">
                      <CheckCircle2 size={14} />
                      Resolved
                   </div>
                 )}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {selectedTicket.messages.map((msg) => {
                 const isAdmin = msg.senderRole === 'admin';
                 return (
                   <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-xl ${isAdmin ? 'bg-gold-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <div className={`text-[10px] mt-2 opacity-50 ${isAdmin ? 'text-black' : 'text-white'}`}>
                             {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Reply Input */}
            <div className="p-4 bg-[#151310] border-t border-white/10">
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                  />
                  <button 
                    onClick={handleSendReply}
                    className="p-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl transition-colors"
                  >
                    <Send size={18} />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
             <MessageSquare size={48} className="mb-4 opacity-20" />
             <p>Select a ticket to view details</p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
