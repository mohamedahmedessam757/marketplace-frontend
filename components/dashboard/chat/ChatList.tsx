
import React from 'react';
import { useChatStore } from '../../../stores/useChatStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, User } from 'lucide-react';

export const ChatList: React.FC = () => {
  const { chats, activeChatId, setActiveChat } = useChatStore();
  const { t } = useLanguage();

  const maskPhone = (phone: string) => {
      return phone.replace(/(\d{3})\d+(\d{2})/, '$1*****$2');
  };

  return (
    <div className="h-full flex flex-col border-r border-white/5 bg-[#151310]/50 backdrop-blur-sm">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-white font-bold mb-4">{t.dashboard.chat.title}</h2>
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
          <input 
            type="text" 
            placeholder={t.dashboard.menu.orders} 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">
            {t.dashboard.chat.noChats}
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${activeChatId === chat.id ? 'bg-gold-500/10 border-l-4 border-l-gold-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                {/* For merchant view, show customer details masked */}
                <div className="flex flex-col">
                    <span className={`font-bold text-sm ${activeChatId === chat.id ? 'text-white' : 'text-white/80'}`}>{chat.merchantName}</span>
                    <span className="text-[10px] text-white/40">{maskPhone(chat.customerPhone)}</span>
                </div>
                <span className="text-[10px] text-white/40">{chat.lastMessageTime}</span>
              </div>
              <div className="text-xs text-gold-400 mb-1">Order #{chat.orderId} - {chat.partName}</div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/50 truncate max-w-[150px]">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] flex items-center justify-center font-bold">
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
