
import React, { useEffect } from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { GlassCard } from '../../ui/GlassCard';
import { useChatStore } from '../../../stores/useChatStore';
import { useOrderChatStore } from '../../../stores/useOrderChatStore';

interface ChatLayoutProps {
  onNavigateToCheckout: () => void;
  viewId?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ onNavigateToCheckout, viewId }) => {
  const { setActiveChat: setSupportChat, chats: supportChats, activeChatId } = useChatStore();
  const { setActiveChat: setOrderChat, chats: orderChats, activeChat } = useOrderChatStore();

  const hasActiveChat = !!activeChatId || !!activeChat;

  useEffect(() => {
    if (viewId) {
      // Check if it's an Order Chat
      const isOrderChat = orderChats.some(c => c.id === viewId);
      if (isOrderChat) {
        setOrderChat(viewId);
        return;
      }

      // Check if it's a Support/Legacy Chat
      const isSupportChat = supportChats.some(c => c.id === viewId);
      if (isSupportChat) {
        setSupportChat(viewId);
      }
    }
  }, [viewId, orderChats, supportChats, setOrderChat, setSupportChat]);

  return (
    <div className="h-[calc(100vh-140px)]">
      <GlassCard className="h-full p-0 flex overflow-hidden border-gold-500/10">
        <div className={`w-full md:w-1/3 md:min-w-[300px] h-full ${hasActiveChat ? 'hidden md:block' : 'block'}`}>
          <ChatList />
        </div>
        <div className={`flex-1 h-full ${!hasActiveChat ? 'hidden md:block' : 'block'}`}>
          <ChatWindow onNavigateToCheckout={onNavigateToCheckout} />
        </div>
      </GlassCard>
    </div>
  );
};
