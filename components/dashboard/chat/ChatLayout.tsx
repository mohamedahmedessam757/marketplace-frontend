
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
  const { setActiveChat: setSupportChat, chats: supportChats } = useChatStore();
  const { setActiveChat: setOrderChat, chats: orderChats } = useOrderChatStore();

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
        <div className="w-1/3 min-w-[300px] hidden md:block h-full">
          <ChatList />
        </div>
        <div className="flex-1 h-full">
          <ChatWindow onNavigateToCheckout={onNavigateToCheckout} />
        </div>
      </GlassCard>
    </div>
  );
};
