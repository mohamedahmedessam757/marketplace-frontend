
import React from 'react';
import { Message } from '../../../stores/useChatStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onAcceptOffer?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAcceptOffer }) => {
  const isMe = message.sender === 'user';
  const { t, language } = useLanguage();

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        <div 
          className={`
            p-4 rounded-2xl relative
            ${isMe 
              ? 'bg-gradient-to-br from-gold-600 to-gold-500 text-white rounded-tr-none' 
              : 'bg-white/10 text-white rounded-tl-none border border-white/10'}
          `}
        >
          {message.isOffer && message.offerDetails ? (
            <div className="mb-2 pb-2 border-b border-white/20">
              <div className="text-xs opacity-70 mb-1">{t.dashboard.chat.offerReceived}</div>
              <div className="text-lg font-bold">{message.offerDetails.price}</div>
              <div className="text-xs opacity-80">{message.offerDetails.description}</div>
            </div>
          ) : null}
          
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {message.isOffer && onAcceptOffer && !isMe && (
            <button 
              onClick={onAcceptOffer}
              className="mt-3 w-full py-2 bg-white text-gold-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <CheckCircle2 size={14} />
              {t.dashboard.chat.acceptOffer}
            </button>
          )}
        </div>
        <span className="text-[10px] text-white/30 mt-1 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
};
