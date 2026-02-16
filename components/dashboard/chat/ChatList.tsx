import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../../stores/useChatStore';
import { useSupportStore } from '../../../stores/useSupportStore'; // Import Support Store
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Store, Headphones } from 'lucide-react';

export const ChatList: React.FC = () => {
  const { chats, activeChatId, setActiveChat, syncSupportTickets } = useChatStore();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-Sync Support Tickets to Chat System
  const supportTickets = useSupportStore((state) => state.tickets);
  useEffect(() => {
    syncSupportTickets();
  }, [supportTickets, syncSupportTickets]);

  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase();
    return (
      chat.merchantName.toLowerCase().includes(query) ||
      chat.partName.toLowerCase().includes(query) ||
      chat.orderId.toString().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col border-r border-white/5 bg-[#151310]/50 backdrop-blur-sm">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-white font-bold mb-4">{t.dashboard.chat.title}</h2>
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
          <input
            type="text"
            placeholder={t.dashboard.menu.orders} // Or better "Search Chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">
            {t.dashboard.chat.noChats}
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${activeChatId === chat.id ? 'bg-gold-500/10 border-l-4 border-l-gold-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  {/* Icon based on Type */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeChatId === chat.id ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>
                    {chat.type === 'support' ? <Headphones size={14} /> : <Store size={14} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-bold text-sm truncate ${activeChatId === chat.id ? 'text-white' : 'text-white/80'}`}>{chat.merchantName}</span>
                    {/* Masked Phone removed here too as per "no external contact" policy, or kept? User said "Remove phone number... external contact". I will hide it to be safe or just show Part Name here. */}
                  </div>
                </div>
                <span className="text-[10px] text-white/40 shrink-0 ml-2">{chat.lastMessageTime}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pl-10">
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {chat.orderId > 0 && <div className="text-[10px] text-gold-400 font-mono">#{chat.orderId} - {chat.partName}</div>}
                  <p className="text-xs text-white/50 truncate max-w-[180px]">{chat.lastMessage}</p>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0 ml-2">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
