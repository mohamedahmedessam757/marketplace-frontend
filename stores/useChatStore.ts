
import { create } from 'zustand';
import { useSupportStore } from './useSupportStore';

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
  mediaUrl?: string; // NEW: For images/videos
  mediaType?: 'image' | 'video'; // NEW
}

export interface Chat {
  id: number;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  orderId: number;
  partName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  type: 'merchant' | 'support';
  createdAt: string; // ISO String
}

export type ChatStatus = 'active' | 'expired' | 'closed_others';

interface ChatState {
  chats: Chat[];
  activeChatId: number | null;
  acceptedChats: Record<number, number>; // orderId -> chatId
  setActiveChat: (id: number) => void;
  sendMessage: (chatId: number, text: string, attachment?: { mediaUrl: string; mediaType: 'image' | 'video' }) => void;
  openChatForOrder: (orderId: number, merchantName: string, partName?: string) => void;
  syncSupportTickets: () => void;
  acceptOffer: (orderId: number, chatId: number) => void; // NEW
  getChatStatus: (chatId: number) => ChatStatus; // NEW
}

// Helper to generate past dates
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

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
    type: 'merchant',
    createdAt: hoursAgo(25), // 25 Hours ago -> Should be EXPIRED if not accepted
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
    type: 'merchant',
    createdAt: hoursAgo(2), // 2 Hours ago -> ACTIVE
    messages: [
      { id: '1', sender: 'user', text: 'Is this original?', timestamp: 'Yesterday' },
      { id: '2', sender: 'merchant', text: 'Yes, genuine parts from Korea.', timestamp: 'Yesterday' },
    ]
  }
];

export const useChatStore = create<ChatState>((set, get) => ({
  chats: MOCK_CHATS,
  activeChatId: null,
  acceptedChats: {}, // Initial state: No offers accepted

  setActiveChat: (id) => set({ activeChatId: id }),

  sendMessage: (chatId, text, attachment) => {
    const state = get();

    // Guard: Don't allow sending if chat is not active
    if (state.getChatStatus(chatId) !== 'active') {
      console.warn('Cannot send message to closed/expired chat');
      return;
    }

    const chat = state.chats.find(c => c.id === chatId);

    if (chat?.type === 'support') {
      useSupportStore.getState().addMessage(chatId, {
        senderId: 'user',
        senderRole: 'user',
        text,
        mediaUrl: attachment?.mediaUrl,
        mediaType: attachment?.mediaType
      });
      get().syncSupportTickets();
      return;
    }

    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
            ...c,
            lastMessage: attachment ? (attachment.mediaType === 'image' ? 'Sent an image' : 'Sent a video') : text,
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: [
              ...c.messages,
              {
                id: Date.now().toString(),
                sender: 'user',
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ...(attachment || {})
              },
            ],
          }
          : c
      ),
    }));
  },

  openChatForOrder: (orderId, merchantName, partName = 'Car Part') => {
    const state = get();
    const existingChat = state.chats.find(c => c.orderId === orderId && c.merchantName === merchantName);

    if (existingChat) {
      set({ activeChatId: existingChat.id });
    } else {
      const newChat: Chat = {
        id: Date.now(),
        merchantName,
        customerName: 'Customer',
        customerPhone: '05XXXXXXXX',
        orderId,
        partName,
        lastMessage: 'Chat started',
        lastMessageTime: 'Now',
        unreadCount: 0,
        type: 'merchant',
        createdAt: new Date().toISOString(),
        messages: [
          { id: 'init', sender: 'merchant', text: `Offer submitted for ${partName}. Chat is now open.`, timestamp: 'Now' }
        ]
      };
      set(state => ({ chats: [newChat, ...state.chats], activeChatId: newChat.id }));
    }
  },

  syncSupportTickets: () => {
    const tickets = useSupportStore.getState().tickets;
    const supportChats: Chat[] = tickets.map(t => ({
      id: t.id,
      merchantName: 'Customer Support',
      customerName: t.userName || 'User',
      customerPhone: '',
      orderId: 0,
      partName: t.subject,
      lastMessage: t.messages[t.messages.length - 1]?.text || (t.messages[t.messages.length - 1]?.mediaUrl ? '[Attachment]' : t.message),
      lastMessageTime: new Date(t.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: t.status === 'RESOLVED' ? 0 : 1,
      type: 'support',
      createdAt: t.created_at || new Date().toISOString(),
      messages: t.messages.map(m => ({
        id: m.id,
        sender: m.senderRole === 'user' ? 'user' : 'merchant',
        text: m.text,
        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType
      }))
    }));

    set(state => {
      const merchantChats = state.chats.filter(c => c.type !== 'support');
      return {
        chats: [...supportChats, ...merchantChats]
      };
    });
  },

  acceptOffer: (orderId, chatId) => {
    set(state => ({
      acceptedChats: {
        ...state.acceptedChats,
        [orderId]: chatId
      }
    }));
  },

  getChatStatus: (chatId) => {
    const state = get();
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return 'active'; // Default safety

    if (chat.type === 'support') return 'active'; // Support always active

    const acceptedChatId = state.acceptedChats[chat.orderId];

    // Rule 2: If ANY offer for this order is accepted
    if (acceptedChatId) {
      // If THIS is the accepted one -> ACTIVE
      if (acceptedChatId === chatId) return 'active';
      // If another one -> CLOSED_OTHERS
      return 'closed_others';
    }

    // Rule 1: Expiry Time (24 Hours)
    // In real app, offerCreatedAt should be from the Offer object
    // For now we use chat.createdAt as proxy
    const createdTime = new Date(chat.createdAt).getTime();
    const now = Date.now();
    const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      return 'expired';
    }

    return 'active';
  }
}));

// Initial sync of support tickets when the store is created
useChatStore.getState().syncSupportTickets();

// Subscribe to support store changes to keep chat store updated
useSupportStore.subscribe(() => {
  // console.log('Support Store changed, syncing chats...');
  useChatStore.getState().syncSupportTickets();
});
