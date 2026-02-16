import React, { useRef, useEffect, useState } from 'react';
import { Send, X, Video, Clock, CheckCircle2, Paperclip } from 'lucide-react';
import { useChatStore } from '../../../stores/useChatStore';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { MessageBubble } from './MessageBubble';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ChatWindowProps {
  onNavigateToCheckout: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onNavigateToCheckout }) => {
  const { chats, activeChatId, sendMessage, getChatStatus, acceptOffer } = useChatStore();
  const { settings: userSettings } = useProfileStore();
  const { settings: vendorSettings } = useVendorStore();
  const { t } = useLanguage();

  const [text, setText] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: 'image' | 'video'; file: File } | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, pendingAttachment]);

  // Determine Auto-Translate Setting based on Context (Simulated)
  const isMerchant = window.location.pathname.includes('/merchant');
  const autoTranslate = isMerchant ? vendorSettings.autoTranslateChat : userSettings.autoTranslateChat;

  if (!activeChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30 bg-[#1A1814]">
        <img src="/icons/chat_placeholder.svg" className="w-24 h-24 mb-4 opacity-20" alt="" />
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  // Smart Chat Logic Checks
  const chatStatus = getChatStatus(activeChat.id);

  const handleSend = () => {
    if ((!text.trim() && !pendingAttachment) || chatStatus !== 'active') return;

    let finalText = text;
    if (autoTranslate && text.trim()) {
      // Mock Translation
      finalText = `[Translated] ${text}`;
    }

    // Prepare Attachment
    const attachment = pendingAttachment ? {
      mediaUrl: pendingAttachment.url,
      mediaType: pendingAttachment.type
    } : undefined;

    sendMessage(activeChat.id, finalText, attachment);

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
      acceptOffer(activeChat.orderId, activeChat.id);
      onNavigateToCheckout();
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
            {activeChat.merchantName[0]}
          </div>
          <div>
            <h3 className="text-white font-bold">{activeChat.merchantName}</h3>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {activeChat.partName} #{activeChat.orderId}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeChat.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAcceptOffer={handleAcceptOffer}
            onViewMedia={(url, type) => setLightboxMedia({ url, type })}
          />
        ))}

        {/* Status Indicators in Chat Stream */}
        {chatStatus === 'expired' && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
              <Clock size={12} />
              Offer Expired (24h Limit Reached)
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
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.dashboard.chat.typeMessage || "Type your message..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none placeholder:text-white/20"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() && !pendingAttachment}
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
