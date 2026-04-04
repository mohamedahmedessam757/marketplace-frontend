
import { create } from 'zustand';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AdminChatMessage {
    id: string;
    chatId?: string;
    senderId: string | null;
    text: string;
    translatedText?: string;
    createdAt: string;
    isRead: boolean;
    isDeletedByAdmin: boolean;
    mediaUrl?: string;
    mediaType?: string;
    mediaName?: string;
}

export interface AdminChat {
    id: string;
    orderId?: string;
    orderNumber?: string;
    partName?: string;
    customerId: string;
    customerName: string;
    customerAvatar?: string;
    vendorId?: string;
    vendorName?: string;
    vendorLogo?: string;
    status: string;
    type: 'order' | 'support';
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isDeletedByAdmin: boolean;
    adminJoinedAt?: string;
    customerTranslationEnabledAt?: string;
    vendorTranslationEnabledAt?: string;
    adminTranslationEnabledAt?: string;
    messages?: AdminChatMessage[];
}

interface AdminChatState {
    orderChats: AdminChat[];
    supportChats: AdminChat[];
    activeChat: AdminChat | null;
    isLoading: boolean;
    currentType: 'order' | 'support' | null;
    error: string | null;
    // Track if initial load has happened per type (prevents flicker on polls)
    _hasLoadedOrder: boolean;
    _hasLoadedSupport: boolean;

    fetchChats: (type?: string) => Promise<void>;
    fetchChatById: (id: string) => Promise<void>;
    adminAction: (chatId: string, action: string, payload?: any) => Promise<any>;
    sendMessage: (chatId: string, text: string, mediaUrl?: string, mediaType?: string, mediaName?: string) => Promise<void>;
    toggleTranslation: (chatId: string, enabled: boolean) => Promise<void>;
    clearActiveChat: () => void;
    
    // WebSockets
    socket: Socket | null;
    initSocket: () => void;
    disconnectSocket: () => void;
}

export const useAdminChatStore = create<AdminChatState>((set, get) => ({
    orderChats: [],
    supportChats: [],
    activeChat: null,
    isLoading: false,
    currentType: null,
    error: null,
    _hasLoadedOrder: false,
    _hasLoadedSupport: false,

    socket: null,

    initSocket: () => {
        const { socket } = get();
        if (socket) return;

        const newSocket = io(`${API_URL}/chat`, {
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => console.log('Admin Chat Socket Connected'));

        newSocket.on('newMessage', (message: AdminChatMessage) => {
            const { activeChat } = get();
            // Instantly append if it belongs to the active chat and isn't our own optimistic message
            if (activeChat && activeChat.id === message?.chatId && message.senderId !== 'admin_optimistic') {
                // Prevent duplicate if we already refetched
                const exists = activeChat.messages?.some(m => m.id === message.id);
                if (!exists) {
                    set({
                        activeChat: {
                            ...activeChat,
                            messages: [...(activeChat.messages || []), message]
                        }
                    });
                }
            }
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    clearActiveChat: () => {
        const { socket, activeChat } = get();
        if (socket && activeChat) {
            socket.emit('leaveChat', { chatId: activeChat.id });
        }
        set({ activeChat: null });
    },

    fetchChats: async (type?: string) => {
        const effectiveType = (type as 'order' | 'support') || 'order';
        const stateKey = effectiveType === 'support' ? 'supportChats' : 'orderChats';
        const loadedKey = effectiveType === 'support' ? '_hasLoadedSupport' : '_hasLoadedOrder';
        const hasLoaded = get()[loadedKey];

        // CRITICAL FIX 1: When switching type, clear activeChat so old data doesn't leak
        if (get().currentType !== null && get().currentType !== effectiveType) {
            set({ activeChat: null });
        }

        // CRITICAL FIX 2: Only show loading on the very first fetch per type, never on polls
        if (!hasLoaded) {
            set({ isLoading: true });
        }

        set({ currentType: effectiveType });

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/chats`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { type: effectiveType }
            });
            set({
                [stateKey]: response.data,
                [loadedKey]: true,
                isLoading: false
            } as any);
        } catch (error: any) {
            set({ error: error.message, isLoading: false, [loadedKey]: true } as any);
        }
    },

    fetchChatById: async (id) => {
        // Only show loading when switching to a new chat
        const currentActive = get().activeChat;
        if (!currentActive || currentActive.id !== id) {
            set({ isLoading: true });
        }
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/chats/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ activeChat: response.data, isLoading: false });

            // Ensure socket joins this chat's room
            const { socket } = get();
            if (socket) {
                // If we were in another chat, leave it first
                if (currentActive && currentActive.id !== id) {
                    socket.emit('leaveChat', { chatId: currentActive.id });
                }
                socket.emit('joinChat', { chatId: id, role: 'admin' });
            }

        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    adminAction: async (chatId, action, payload) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/chats/${chatId}/admin-action`, 
                { action, payload },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Refresh the current list after a destructive action
            if (['deleteChat', 'deleteMessage', 'close', 'block'].includes(action)) {
                const currentType = get().currentType || 'order';
                await get().fetchChats(currentType);
                if (get().activeChat?.id === chatId) {
                    await get().fetchChatById(chatId);
                }
            }

            return response.data;
        } catch (error: any) {
            console.error('Admin action failed:', error);
            throw error;
        }
    },

    sendMessage: async (chatId, text, mediaUrl, mediaType, mediaName) => {
        try {
            const token = localStorage.getItem('access_token');
            const activeChat = get().activeChat;

            // 1) Optimistic UI update for instant feedback
            if (activeChat && activeChat.id === chatId) {
                const optimisticMsg: AdminChatMessage = {
                    id: `temp-${Date.now()}`,
                    chatId,
                    senderId: 'admin_optimistic', 
                    text,
                    createdAt: new Date().toISOString(),
                    isRead: true,
                    isDeletedByAdmin: false,
                    mediaUrl,
                    mediaType,
                    mediaName
                };
                
                set({
                    activeChat: {
                        ...activeChat,
                        messages: [...(activeChat.messages || []), optimisticMsg]
                    }
                });
            }

            // 2) Send actual request to server
            await axios.post(`${API_URL}/chats/${chatId}/messages`, 
                { text, mediaUrl, mediaType, mediaName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // 3) Refetch to get actual DB IDs and proper format
            await get().fetchChatById(chatId);
        } catch (error: any) {
            console.error('Send message failed:', error);
            // On failure, refetch to revert the optimistic update
            await get().fetchChatById(chatId);
        }
    },

    toggleTranslation: async (chatId: string, enabled: boolean) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_URL}/chats/${chatId}/translation`,
                { enabled },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update local state optimisticly
            const activeChat = get().activeChat;
            if (activeChat && activeChat.id === chatId) {
                set({
                    activeChat: {
                        ...activeChat,
                        adminTranslationEnabledAt: enabled ? new Date().toISOString() : undefined
                    }
                });
            }
        } catch (error) {
            console.error('Failed to toggle translation:', error);
        }
    }
}));
