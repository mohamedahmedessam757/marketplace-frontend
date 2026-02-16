
import React from 'react';
import { Message } from '../../../stores/useChatStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onAcceptOffer?: () => void;
  onViewMedia?: (url: string, type: 'image' | 'video') => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAcceptOffer, onViewMedia }) => {
  const isMe = message.sender === 'user';
  const { t } = useLanguage();

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            p-3 rounded-2xl relative shadow-md min-w-[120px]
            ${isMe
              ? 'bg-gradient-to-br from-gold-600 to-gold-500 text-white rounded-tr-none ml-12'
              : 'bg-[#2A2824] text-white rounded-tl-none border border-white/10 mr-12'}
          `}
        >
          {/* Offer Header */}
          {message.isOffer && message.offerDetails && (
            <div className="mb-2 pb-2 border-b border-white/20">
              <div className="text-xs opacity-70 mb-1">{t.dashboard.chat.offerReceived}</div>
              <div className="text-lg font-bold">{message.offerDetails.price}</div>
              <div className="text-xs opacity-80">{message.offerDetails.description}</div>
            </div>
          )}

          {/* Media Attachment */}
          {message.mediaUrl && (
            <div
              className="mb-2 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity bg-black/20"
              onClick={() => message.mediaUrl && onViewMedia?.(message.mediaUrl, message.mediaType || 'image')}
            >
              {message.mediaType === 'video' ? (
                <div className="relative">
                  <video src={message.mediaUrl} className="w-full max-h-60 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 ml-1 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <img src={message.mediaUrl} alt="attachment" className="w-full max-h-60 object-cover" />
              )}
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}

          {/* Offer Action */}
          {message.isOffer && onAcceptOffer && !isMe && (
            <button
              onClick={onAcceptOffer}
              className="mt-3 w-full py-2 bg-white text-gold-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <CheckCircle2 size={14} />
              {t.dashboard.chat.acceptOffer}
            </button>
          )}

          {/* Timestamp - Inside Bubble */}
          <div className={`mt-1 flex ${isMe ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[10px] text-white/50">{message.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
