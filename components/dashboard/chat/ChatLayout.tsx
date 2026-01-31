
import React from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { GlassCard } from '../../ui/GlassCard';

interface ChatLayoutProps {
  onNavigateToCheckout: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ onNavigateToCheckout }) => {
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
