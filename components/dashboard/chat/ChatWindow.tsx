import React, { useRef, useEffect, useState } from 'react';
import { Send, X, Video, Clock, CheckCircle2, Paperclip, Globe, MessageSquareDashed } from 'lucide-react';
import { useChatStore } from '../../../stores/useChatStore';
import { useOrderChatStore } from '../../../stores/useOrderChatStore'; // NEW
import { useProfileStore } from '../../../stores/useProfileStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { MessageBubble } from './MessageBubble';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ChatWindowProps {
  onNavigateToCheckout: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onNavigateToCheckout }) => {
  const { chats, activeChatId, sendMessage: sendLegacyMessage, getChatStatus, acceptOffer } = useChatStore();
  const { activeChat: orderChat, sendMessage: sendOrderMessage, toggleTranslation, fetchChat } = useOrderChatStore(); // NEW

  const { settings: userSettings, user } = useProfileStore(); // Get user object
  const { settings: vendorSettings } = useVendorStore();
  const { t } = useLanguage();

  const [text, setText] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Derived typing state to avoid calling hooks conditionally below
  const isTyping = useOrderChatStore((state) => state.isTyping);
  const typingUserId = useOrderChatStore((state) => state.typingUserId);
  const showTypingIndicator = isTyping && typingUserId !== user?.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const legacyChat = chats.find(c => c.id === activeChatId);
  const isOrderChat = !!orderChat && !activeChatId;

  // Use the correct chat object (OrderChatStore if available, else Legacy)
  const displayChat = isOrderChat && orderChat ? {
    id: orderChat.id,
    merchantName: user?.role === 'CUSTOMER' ? (orderChat.vendorName || t.dashboard.menu?.merchant || 'Merchant') : (orderChat.customerName || t.dashboard.menu?.customer || 'Customer'),
    partName: orderChat.partName || t.dashboard.menu?.order || 'Order Inquiry',
    orderId: orderChat.orderNumber || orderChat.orderId,
    messages: orderChat.messages.map(m => ({
      id: m.id,
      text: m.translatedText || m.text,
      sender: m.senderId === user?.id ? 'me' : 'other',
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: m.isRead,
      originalText: m.text,
      translatedText: m.translatedText
    })),
    status: orderChat.status === 'OPEN' ? 'active' : orderChat.status.toLowerCase(), // active, closed, expired
    isTranslationEnabled: orderChat.isTranslationEnabled
  } : legacyChat ? {
    ...legacyChat,
    status: getChatStatus(legacyChat.id)
  } : null;


  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayChat?.messages, pendingAttachment, orderChat?.messages]);

  // Determine Auto-Translate Setting based on Context (Simulated)
  const isMerchant = window.location.pathname.includes('/merchant');

  if (!displayChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 bg-[#1A1814] p-8 text-center border-l border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gold-500/10 blur-2xl rounded-full scale-150" />

          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative z-10 shadow-2xl backdrop-blur-md">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageSquareDashed size={40} className="text-gold-500/80" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-bold text-white mb-2"
        >
          {t.dashboard?.chat?.title || 'Messages'}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm text-white/50 max-w-[280px]"
        >
          Select a chat to start messaging
        </motion.p>
      </div>
    );
  }

  // Smart Chat Logic Checks
  const chatStatus = displayChat.status;

  const handleSend = async () => {
    if ((!text.trim() && !pendingAttachment) || chatStatus !== 'active') return;

    if (isOrderChat) {
      await sendOrderMessage(text); // Attachments logic to be added to OrderChatStore if needed
    } else {
      // Legacy/Support
      let finalText = text;
      // ... translation logic mock ...
      const attachment = pendingAttachment ? {
        mediaUrl: pendingAttachment.url,
        mediaType: pendingAttachment.type
      } : undefined;
      sendLegacyMessage(displayChat.id, finalText, attachment);
    }

    // Reset
    setText('');
    setPendingAttachment(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large (Max 5MB)');
        return;
      }
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      setPendingAttachment({ url, type, file });
    }
  };

  const clearAttachment = () => {
    if (pendingAttachment) {
      URL.revokeObjectURL(pendingAttachment.url);
      setPendingAttachment(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAcceptOffer = () => {
    if (window.confirm('Are you sure you want to accept this offer? Choosing this offer will close other inquiries for this order.')) {
      acceptOffer(activeChatId!, activeChatId!); // Fix args
      onNavigateToCheckout();
    }
  };

  const handleToggleTranslation = () => {
    if (isOrderChat && orderChat?.id) {
      toggleTranslation(orderChat.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1814] relative">
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>

            {lightboxMedia.type === 'video' ? (
              <video src={lightboxMedia.url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            ) : (
              <img src={lightboxMedia.url} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#151310] flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
            {displayChat.merchantName[0]}
          </div>
          <div>
            <h3 className="text-white font-bold">{displayChat.merchantName}</h3>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className={`w-2 h-2 rounded-full ${chatStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {displayChat.partName} #{displayChat.orderId}
            </div>
          </div>
        </div>

        {/* Translation Toggle */}
        {isOrderChat && (
          <button
            onClick={handleToggleTranslation}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${orderChat?.isTranslationEnabled ? 'bg-gold-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            title="Toggle Auto-Translation"
          >
            <Globe size={18} />
            <span className="text-xs font-medium hidden md:inline">
              {orderChat?.isTranslationEnabled ? 'Translation ON' : 'Translate'}
            </span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {displayChat.messages?.map((msg: any) => (
          <MessageBubble
            key={msg.id}
            message={{
              ...msg,
              text: (orderChat?.isTranslationEnabled && msg.translatedText) ? msg.translatedText : msg.text,
              isTranslated: !!(orderChat?.isTranslationEnabled && msg.translatedText)
            }}
            onAcceptOffer={handleAcceptOffer}
            onViewMedia={(url, type) => setLightboxMedia({ url, type })}
          />
        ))}

        {/* Global Typing Indicator */}
        {showTypingIndicator && (
          <div className="flex items-center gap-2 text-white/50 text-xs italic animate-pulse">
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animation-delay-150"></span>
            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animation-delay-300"></span>
            Someone is typing...
          </div>
        )}

        {/* Status Indicators in Chat Stream */}
        {chatStatus === 'expired' && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
              <Clock size={12} />
              Offer Expired (24h Limit Reached)
            </span>
          </div>
        )}

        {chatStatus === 'closed' && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-gray-400 bg-gray-500/10 px-3 py-1 rounded-full border border-gray-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Chat Closed (Offer Accepted Elsewhere)
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Status Banner */}
      <div className="p-4 bg-[#151310] border-t border-white/10">

        {chatStatus === 'active' ? (
          <>
            {/* Pending Attachment Preview */}
            {pendingAttachment && (
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                    {pendingAttachment.type === 'video' ? <Video size={20} className="text-white/50" /> : <img src={pendingAttachment.url} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium max-w-[200px] truncate">{pendingAttachment.file.name}</p>
                    <p className="text-xs text-white/40">Ready to send</p>
                  </div>
                </div>
                <button onClick={clearAttachment} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-red-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl transition-colors ${pendingAttachment ? 'bg-gold-500/20 text-gold-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                title="Attach Media"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (isOrderChat && orderChat) {
                    useOrderChatStore.getState().setTypingStatus(orderChat.id, e.target.value.length > 0, user?.id || '');
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isOrderChat && orderChat?.isTranslationEnabled ? "Type... (Auto-translating to Arabic/English)" : "Type your message..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none placeholder:text-white/20"
                disabled={chatStatus !== 'active'}
              />
              <button
                onClick={handleSend}
                disabled={(!text.trim() && !pendingAttachment) || chatStatus !== 'active'}
                className="p-3 bg-gold-500 hover:bg-gold-600 disabled:bg-white/10 disabled:text-white/20 text-white rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          /* Locked State UI */
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-center">
            {chatStatus === 'expired' ? (
              <>
                <Clock className="text-red-400" size={24} />
                <div>
                  <h4 className="text-white font-bold text-sm">Offer Expired</h4>
                  <p className="text-xs text-white/40">This chat is closed because the 24h offer window has passed.</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="text-gold-500" size={24} />
                <div>
                  <h4 className="text-white font-bold text-sm">Order in Progress</h4>
                  <p className="text-xs text-white/40">This chat is closed because you accepted another offer for this order.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
