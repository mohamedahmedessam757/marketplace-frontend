
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { client as api } from '../services/api/client';
import { io, Socket } from 'socket.io-client';

export interface OrderChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    translatedText?: string;
    isRead: boolean;
    createdAt: string;
}

export interface OrderChat {
    id: string;
    orderId: string;
    vendorId: string;
    customerId: string;
    status: 'OPEN' | 'CLOSED' | 'EXPIRED';
    expiryAt: string;
    isTranslationEnabled: boolean;
    messages: OrderChatMessage[];

    // Mapped DTO Fields
    vendorName?: string;
    vendorLogo?: string;
    customerName?: string;
    customerAvatar?: string;
    orderNumber?: string;
    partName?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

interface OrderChatState {
    chats: OrderChat[];
    activeChat: OrderChat | null;
    isLoading: boolean;
    error: string | null;
    socket: Socket | null;
    isTyping: boolean;
    typingUserId: string | null;

    // Actions
    fetchChat: (orderId: string, vendorId: string) => Promise<void>;
    fetchChats: () => Promise<void>;
    setActiveChat: (chatId: string) => void;
    sendMessage: (text: string) => Promise<void>;
    toggleTranslation: (chatId: string) => Promise<void>;
    subscribeToChat: (chatId: string) => void;
    unsubscribeFromChat: () => void;
    clearChat: () => void;
    setTypingStatus: (chatId: string, isTyping: boolean, userId: string) => void;
}

export const useOrderChatStore = create<OrderChatState>((set, get) => ({
    chats: [],
    activeChat: null,
    isLoading: false,
    error: null,
    socket: null,
    isTyping: false,
    typingUserId: null,

    fetchChat: async (orderId: string, vendorId: string) => {
        set({ isLoading: true, error: null });
        try {
            // Initiate via Backend to ensure it exists and runs guards
            const response = await api.post('/chats/init', { orderId, vendorId });
            const chat = response.data;

            // Load messages from Supabase directly for speed? 
            // Better to load via API first to get consistent state, then sub.
            // But for now, let's assume the API returns the chat WITH messages.
            // If not, we fetch messages from Supabase.
            // Let's fetch messages from Supabase to be consistent with "Realtime Read".

            const { data: messages, error: msgError } = await supabase
                .from('order_chat_messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;

            set({ activeChat: { ...chat, messages: messages || [] }, isLoading: false });

            // Auto subscribe
            get().subscribeToChat(chat.id);

        } catch (error: any) {
            console.error('Failed to fetch chat:', error);
            set({ error: error.message || 'Failed to load chat', isLoading: false });
        }
    },

    sendMessage: async (text: string) => {
        const { activeChat } = get();
        if (!activeChat) return;

        // Optimistic Update can happen here if we want super speed, 
        // but since we want to validate 24h/expiry backend side, we go through API.
        try {
            await api.post(`/chats/${activeChat.id}/messages`, { text });
            // No need to manually update state, the Supabase Subscription will catch the new message
        } catch (error: any) {
            console.error('Failed to send message:', error);
            set({ error: error.message });
        }
    },

    fetchChats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/chats'); // GET /chats endpoint
            set({ chats: response.data, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch chats:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    setActiveChat: (chatId: string) => {
        const { chats } = get();
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            // Optimistically set active
            set({ activeChat: chat, error: null });
            // Fetch full details and subscribe
            get().fetchChat(chat.orderId, chat.vendorId);
        }
    },

    toggleTranslation: async (chatId: string) => {
        const { activeChat } = get();
        if (!activeChat || activeChat.id !== chatId) return; // Ensure we're toggling the active chat

        const originalStatus = activeChat.isTranslationEnabled;
        const newStatus = !originalStatus;

        try {
            // Optimistic update
            set(state => ({
                activeChat: state.activeChat ? { ...state.activeChat, isTranslationEnabled: newStatus } : null
            }));
            await api.post(`/chats/${chatId}/translation`, { enabled: newStatus });
        } catch (error: any) {
            console.error('Translation toggle failed:', error);
            // Revert on error
            set(state => ({
                activeChat: state.activeChat ? { ...state.activeChat, isTranslationEnabled: originalStatus } : null,
                error: error.message || 'Failed to toggle translation'
            }));
        }
    },

    subscribeToChat: (chatId: string) => {
        // 1. Socket.IO Connection (0ms Latency)
        let socket = get().socket;
        if (!socket) {
            // Initialize Socket Connection to NestJS WebSocket Gateway
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
            socket = io(`${baseUrl}/chat`, {
                path: '/socket.io',
                transports: ['websocket']
            });
            set({ socket });

            socket.on('connect', () => {
                console.log('Connected to Chat WebSockets');
                socket?.emit('joinChat', { chatId });
            });

            socket.on('newMessage', (message: OrderChatMessage) => {
                set((state) => {
                    if (!state.activeChat || state.activeChat.id !== chatId) return state;
                    if (state.activeChat.messages.some(m => m.id === message.id)) return state;
                    return {
                        activeChat: {
                            ...state.activeChat,
                            messages: [...state.activeChat.messages, message]
                        }
                    };
                });
            });

            socket.on('userTyping', ({ userId, isTyping }) => {
                set({ isTyping, typingUserId: userId });
            });
        } else {
            socket.emit('joinChat', { chatId });
        }

        // 2. Supabase Realtime (Failsafe & DB Updates)
        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'order_chat_messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    const newMessage = payload.new as OrderChatMessage;
                    set((state) => {
                        if (!state.activeChat || state.activeChat.id !== chatId) return state;
                        // Avoid duplicates if Socket already added it
                        if (state.activeChat.messages.some(m => m.id === newMessage.id)) return state;

                        return {
                            activeChat: {
                                ...state.activeChat,
                                messages: [...state.activeChat.messages, newMessage]
                            }
                        };
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE', // Catch status changes (EXPIRED/CLOSED)
                    schema: 'public',
                    table: 'order_chats',
                    filter: `id=eq.${chatId}`,
                },
                (payload) => {
                    const updatedChat = payload.new as Partial<OrderChat>;
                    set((state) => {
                        if (!state.activeChat || state.activeChat.id !== chatId) return state;
                        return {
                            activeChat: { ...state.activeChat, ...updatedChat }
                        };
                    });
                }
            )
            .subscribe();
    },

    setTypingStatus: (chatId: string, isTyping: boolean, userId: string) => {
        const socket = get().socket;
        if (socket) {
            socket.emit('typing', { chatId, isTyping, userId });
        }
    },

    unsubscribeFromChat: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
        supabase.removeAllChannels();
    },

    clearChat: () => {
        get().unsubscribeFromChat();
        set({ activeChat: null, error: null, isTyping: false });
    }
}));
