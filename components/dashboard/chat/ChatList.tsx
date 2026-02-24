import React, { useState, useEffect } from 'react';
import { useOrderChatStore } from '../../../stores/useOrderChatStore';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Store, User, ShoppingBag, LifeBuoy } from 'lucide-react';

export const ChatList: React.FC = () => {
    // Unified Chats List 
    const { chats, activeChat, setActiveChat, fetchChats } = useOrderChatStore();

    const { user } = useProfileStore();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const handleChatClick = (chatId: string) => {
        setActiveChat(chatId);
    };

    const globalActiveId = activeChat?.id;

    const allChats = chats.map(c => {
        const isSupport = c.type === 'support';
        return {
            ...c,
            displayTitle: isSupport ? (t.dashboard.menu?.support || 'Support Team') : (user?.role === 'CUSTOMER' ? c.vendorName : c.customerName),
            displaySubtitle: isSupport ? c.partName : (c.orderNumber ? `#${c.orderNumber}` : ''),
            sortTime: c.lastMessageTime ? new Date(c.lastMessageTime).getTime() : 0,
            icon: isSupport ? <LifeBuoy size={14} /> : (user?.role === 'CUSTOMER' ? <Store size={14} /> : <User size={14} />)
        };
    }).sort((a, b) => b.sortTime - a.sortTime);

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
                                onClick={() => handleChatClick(chat.id)}
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
                                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-2 pl-10">
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        {chat.displaySubtitle && (
                                            <div className="text-[10px] text-gold-400 font-mono flex items-center gap-1">
                                                {chat.type === 'support' ? <LifeBuoy size={10} /> : <ShoppingBag size={10} />}
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
