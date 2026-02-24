
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
    mediaUrl?: string;
    mediaType?: string;
    mediaName?: string;
    isRead: boolean;
    createdAt: string;
}

export interface OrderChat {
    id: string;
    orderId: string;
    vendorId?: string;
    customerId: string;
    status: 'OPEN' | 'CLOSED' | 'EXPIRED';
    type: 'order' | 'support';
    expiryAt?: string;
    createdAt?: string;
    updatedAt?: string;
    customerTranslationEnabledAt?: string;
    vendorTranslationEnabledAt?: string;
    adminTranslationEnabledAt?: string;
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
    loadChat: (chatId: string) => Promise<void>;
    fetchChats: () => Promise<void>;
    createSupportChat: (subject: string, message: string, orderId?: string, mediaUrl?: string, mediaType?: string, mediaName?: string) => Promise<void>;
    setActiveChat: (chatId: string) => void;
    sendMessage: (payload: { text?: string; mediaUrl?: string; mediaType?: string; mediaName?: string }) => Promise<void>;
    toggleTranslation: (chatId: string, enabled: boolean) => Promise<void>;
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
    loadChat: async (chatId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/chats/${chatId}`);
            const chat = response.data;

            const { data: messages, error: msgError } = await supabase
                .from('order_chat_messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;

            set({ activeChat: { ...chat, messages: messages || [] }, isLoading: false });
            get().subscribeToChat(chat.id);
        } catch (error: any) {
            console.error('Failed to load chat by ID:', error);
            set({ error: error.message || 'Failed to load chat', isLoading: false });
        }
    },
    createSupportChat: async (subject: string, message: string, orderId?: string, mediaUrl?: string, mediaType?: string, mediaName?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/chats/support', { orderId, subject, message, mediaUrl, mediaType, mediaName });
            // Successfully created, fetch chats to refresh the list
            await get().fetchChats();
            get().setActiveChat(response.data.id); // Auto open
        } catch (error: any) {
            console.error('Failed to create support chat:', error);
            set({ error: error.message || 'Failed to create support chat', isLoading: false });
        }
    },

    sendMessage: async ({ text, mediaUrl, mediaType, mediaName }) => {
        const { activeChat } = get();
        if (!activeChat) return;

        // Extremely fast 0ms Optimistic UI Update Fake Message
        const tempId = `temp-${Date.now()}`;
        const tempMessage: OrderChatMessage = {
            id: tempId,
            chatId: activeChat.id,
            senderId: 'temp_user', // This will be ignored functionally but gives it shape
            text: text || '',
            isRead: false,
            createdAt: new Date().toISOString(),
            mediaUrl,
            mediaType,
            mediaName
        };

        set((state) => ({
            activeChat: state.activeChat ? {
                ...state.activeChat,
                messages: [...state.activeChat.messages, tempMessage]
            } : null
        }));

        try {
            const response = await api.post(`/chats/${activeChat.id}/messages`, {
                text: text || '',
                mediaUrl,
                mediaType,
                mediaName
            });

            // Replace the optimistic temp message with the real one returned by backend
            set((state) => ({
                activeChat: state.activeChat ? {
                    ...state.activeChat,
                    messages: state.activeChat.messages.map(m => m.id === tempId ? response.data : m)
                } : null
            }));

        } catch (error: any) {
            console.error('Failed to send message:', error);
            // Revert optimistic message
            set((state) => ({
                error: error.message,
                activeChat: state.activeChat ? {
                    ...state.activeChat,
                    messages: state.activeChat.messages.filter(m => m.id !== tempId)
                } : null
            }));
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
            set({ activeChat: Object.assign({}, chat, { messages: [] }), error: null });
            // Fetch full details natively
            get().loadChat(chat.id);
        }
    },

    toggleTranslation: async (chatId: string, enabled: boolean) => {
        const { activeChat } = get();
        if (!activeChat || activeChat.id !== chatId) return;

        // Try getting role from local storage if profile store isn't safely accessible
        let userRole = 'CUSTOMER';
        try {
            const profileData = localStorage.getItem('profile-storage');
            if (profileData) userRole = JSON.parse(profileData)?.state?.user?.role || 'CUSTOMER';
        } catch (e) { }

        const timestamp = enabled ? new Date().toISOString() : null;

        // Optimistic UI Update for zero latency toggling
        set((state) => {
            if (!state.activeChat) return state;
            const updated = { ...state.activeChat };
            if (userRole === 'CUSTOMER') updated.customerTranslationEnabledAt = timestamp;
            else if (userRole === 'VENDOR') updated.vendorTranslationEnabledAt = timestamp;
            else if (userRole === 'ADMIN') updated.adminTranslationEnabledAt = timestamp;

            return { activeChat: updated };
        });

        try {
            await api.post(`/chats/${chatId}/translation`, { enabled });
        } catch (error: any) {
            console.error('Translation toggle failed:', error);
            // Revert changes on fail
            set((state) => ({ error: error.message || 'Failed to toggle translation', activeChat }));
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
                    const dbChat: any = payload.new;
                    set((state) => {
                        if (!state.activeChat || state.activeChat.id !== chatId) return state;
                        return {
                            activeChat: {
                                ...state.activeChat,
                                status: dbChat.status || state.activeChat.status,
                                customerTranslationEnabledAt: dbChat.customer_translation_enabled_at !== undefined ? dbChat.customer_translation_enabled_at : state.activeChat.customerTranslationEnabledAt,
                                vendorTranslationEnabledAt: dbChat.vendor_translation_enabled_at !== undefined ? dbChat.vendor_translation_enabled_at : state.activeChat.vendorTranslationEnabledAt,
                                adminTranslationEnabledAt: dbChat.admin_translation_enabled_at !== undefined ? dbChat.admin_translation_enabled_at : state.activeChat.adminTranslationEnabledAt,
                            }
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
