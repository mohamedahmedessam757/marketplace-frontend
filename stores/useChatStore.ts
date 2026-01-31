
import { create } from 'zustand';

export interface Message {
  id: string;
  sender: 'user' | 'merchant';
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerDetails?: {
    price: string;
    description: string;
  };
}

export interface Chat {
  id: number;
  merchantName: string;
  customerName: string;
  customerPhone: string; // Will be masked in UI
  orderId: number;
  partName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  activeChatId: number | null;
  setActiveChat: (id: number) => void;
  sendMessage: (chatId: number, text: string) => void;
  openChatForOrder: (orderId: number, merchantName: string, partName?: string) => void;
}

const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    merchantName: 'Al-Jazira Parts',
    customerName: 'Mohammed A.',
    customerPhone: '0551234567',
    orderId: 1002,
    partName: 'Front Bumper Kit',
    lastMessage: 'Here are the photos of the bumper.',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    messages: [
      { id: '1', sender: 'merchant', text: 'Hello, I have the bumper you requested.', timestamp: '10:28 AM' },
      { id: '2', sender: 'merchant', text: 'It is clean, no scratches.', timestamp: '10:29 AM' },
      { id: '3', sender: 'merchant', text: 'Here are the photos of the bumper.', timestamp: '10:30 AM', isOffer: true, offerDetails: { price: '450 SAR', description: 'Original Used - Like New' } },
    ]
  },
  {
    id: 2,
    merchantName: 'Seoul Auto',
    customerName: 'Khalid O.',
    customerPhone: '0569876543',
    orderId: 1003,
    partName: 'Headlights (Pair)',
    lastMessage: 'Can you ship to Riyadh?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: '1', sender: 'user', text: 'Is this original?', timestamp: 'Yesterday' },
      { id: '2', sender: 'merchant', text: 'Yes, genuine parts from Korea.', timestamp: 'Yesterday' },
    ]
  }
];

export const useChatStore = create<ChatState>((set, get) => ({
  chats: MOCK_CHATS,
  activeChatId: null,
  setActiveChat: (id) => set({ activeChatId: id }),
  sendMessage: (chatId, text) => {
    set((state) => ({
      chats: state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, {
              id: Date.now().toString(),
              sender: 'user', // In a real app, this depends on who is logged in
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }],
            lastMessage: text,
            lastMessageTime: 'Now'
          };
        }
        return chat;
      })
    }));
  },
  openChatForOrder: (orderId, merchantName, partName = 'Car Part') => {
    const state = get();
    const existingChat = state.chats.find(c => c.orderId === orderId);
    if (existingChat) {
      set({ activeChatId: existingChat.id });
    } else {
      // Create new chat
      const newChat: Chat = {
        id: Date.now(),
        merchantName,
        customerName: 'Customer', // Placeholder
        customerPhone: '05XXXXXXXX',
        orderId,
        partName,
        lastMessage: 'Chat started',
        lastMessageTime: 'Now',
        unreadCount: 0,
        messages: [
            { id: 'init', sender: 'merchant', text: `Offer submitted for ${partName}. Chat is now open.`, timestamp: 'Now' }
        ]
      };
      set(state => ({ chats: [newChat, ...state.chats], activeChatId: newChat.id }));
    }
  }
}));
