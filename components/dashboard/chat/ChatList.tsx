import React, { useState, useEffect } from 'react';
import { useOrderChatStore } from '../../../stores/useOrderChatStore';
import { useChatStore } from '../../../stores/useChatStore';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Store, User, ShoppingBag, LifeBuoy } from 'lucide-react';

export const ChatList: React.FC = () => {
    // Order Chats
    const { chats: orderChats, activeChat: activeOrderChat, setActiveChat: setOrderChat, fetchChats: fetchOrderChats } = useOrderChatStore();
    // Support/Legacy Chats
    const { chats: supportChats, activeChatId: activeSupportChatId, setActiveChat: setSupportChat, syncSupportTickets } = useChatStore();

    const { user } = useProfileStore();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrderChats();
        syncSupportTickets();
    }, [fetchOrderChats, syncSupportTickets]);

    // Unified click handler to ensure only one active chat across both stores
    const handleChatClick = (chatId: string, isOrder: boolean) => {
        if (isOrder) {
            setOrderChat(chatId);
            setSupportChat(null as any); // Clear support selection
        } else {
            setSupportChat(chatId);
            setOrderChat(null as any); // Clear order selection
        }
    };

    // Determine currently active globally to highlight UI
    const globalActiveId = activeOrderChat?.id || activeSupportChatId;

    // Combine and normalize chats for unified rendering
    const allChats = [
        ...orderChats.map(c => ({
            ...c,
            isOrderChat: true,
            displayTitle: user?.role === 'CUSTOMER' ? c.vendorName : c.customerName,
            displaySubtitle: c.orderNumber ? `#${c.orderNumber}` : '',
            sortTime: c.lastMessageTime ? new Date(c.lastMessageTime).getTime() : 0,
            icon: user?.role === 'CUSTOMER' ? <Store size={14} /> : <User size={14} />
        })),
        ...supportChats.map(c => ({
            ...c,
            isOrderChat: false,
            // Use localized Support text if it's a support chat
            displayTitle: c.type === 'support' ? (t.dashboard.menu?.support || 'Support Team') : (user?.role === 'CUSTOMER' ? c.merchantName : c.customerName),
            displaySubtitle: c.type === 'support' ? c.partName : (c.orderId && c.orderId !== '0' ? `#${c.orderId}` : ''),
            sortTime: c.lastMessageTime ? new Date("1970/01/01 " + c.lastMessageTime).getTime() : 0, // Mock structure mapping hack
            icon: c.type === 'support' ? <LifeBuoy size={14} /> : (user?.role === 'CUSTOMER' ? <Store size={14} /> : <User size={14} />)
        }))
    ].sort((a, b) => b.sortTime - a.sortTime);

    const filteredChats = allChats.filter(chat => {
        const query = searchQuery.toLowerCase();
        return (
            (chat.displayTitle || '').toLowerCase().includes(query) ||
            chat.displaySubtitle.toLowerCase().includes(query)
        );
    });

    return (
        <div className="h-full flex flex-col border-r border-white/5 bg-[#151310]/50 backdrop-blur-sm">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-white font-bold mb-4">{t.dashboard.chat.title || 'Messages'}</h2>
                <div className="relative">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
                    <input
                        type="text"
                        placeholder={t.dashboard.menu?.search || 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-gold-500 outline-none placeholder:text-white/20"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredChats.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-sm">
                        {t.dashboard.chat.noChats || 'No conversations yet'}
                    </div>
                ) : (
                    filteredChats.map(chat => {
                        const isActive = globalActiveId === chat.id;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => handleChatClick(chat.id, chat.isOrderChat)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${isActive ? 'bg-gold-500/10 border-l-4 border-l-gold-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>
                                            {chat.icon}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                                                {chat.displayTitle || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Time */}
                                    <span className="text-[10px] text-white/40 shrink-0 ml-2">
                                        {chat.lastMessageTime ? (
                                            chat.isOrderChat
                                                ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : chat.lastMessageTime // legacy already has time string
                                        ) : ''}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-2 pl-10">
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        {chat.displaySubtitle && (
                                            <div className="text-[10px] text-gold-400 font-mono flex items-center gap-1">
                                                {!chat.isOrderChat && (chat as any).type === 'support' ? <LifeBuoy size={10} /> : <ShoppingBag size={10} />}
                                                {chat.displaySubtitle}
                                            </div>
                                        )}
                                        <p className="text-xs text-white/50 truncate max-w-[180px]">
                                            {chat.lastMessage || '...'}
                                        </p>
                                    </div>

                                    {chat.unreadCount > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0 ml-2">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
