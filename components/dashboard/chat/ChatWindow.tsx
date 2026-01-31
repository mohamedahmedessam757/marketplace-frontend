
import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../../stores/useChatStore';
import { useCheckoutStore } from '../../../stores/useCheckoutStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Send, Paperclip, MoreVertical, Phone, Box, Car } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  onNavigateToCheckout: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onNavigateToCheckout }) => {
  const { chats, activeChatId, sendMessage } = useChatStore();
  const { setSelectedOffer } = useCheckoutStore();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30">
        <p>{t.dashboard.chat.noChats}</p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(activeChat.id, text);
    setText('');
  };

  const handleAcceptOffer = (priceStr: string) => {
    // Parse price and set offer in checkout store
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
    setSelectedOffer({
      id: 999, // active offer id
      merchantName: activeChat.merchantName,
      partName: activeChat.partName,
      price: price
    });
    onNavigateToCheckout();
  };

  // Mask Phone for privacy
  const maskPhone = (phone: string) => phone.replace(/(\d{3})\d+(\d{2})/, '$1*****$2');

  return (
    <div className="h-full flex flex-col bg-[#1A1814]/50">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-[#151310] flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">{activeChat.merchantName}</h3>
          <p className="text-xs text-white/40 flex items-center gap-1">
             <Phone size={10} />
             {maskPhone(activeChat.customerPhone)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Order Context Card */}
      <div className="px-4 pt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center text-gold-400">
                  <Box size={20} />
              </div>
              <div className="flex-1">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{t.dashboard.chat.orderContext} #{activeChat.orderId}</div>
                  <div className="text-sm font-bold text-white">{activeChat.partName}</div>
              </div>
              <Car size={16} className="text-white/20" />
          </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
        {activeChat.messages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onAcceptOffer={() => msg.offerDetails && handleAcceptOffer(msg.offerDetails.price)}
          />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#151310] flex gap-3 items-center">
        <button type="button" className="text-white/40 hover:text-white transition-colors">
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.dashboard.chat.typeMessage}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
        />
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="p-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
