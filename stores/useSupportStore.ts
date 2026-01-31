
import { create } from 'zustand';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: 'admin' | 'user' | 'merchant';
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string; // Generic User ID (could be Merchant ID or Customer ID)
  userType: 'customer' | 'merchant';
  userName: string;
  email: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastUpdate: string;
  messages: TicketMessage[];
}

interface SupportState {
  tickets: SupportTicket[];
  createTicket: (data: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'lastUpdate' | 'messages'>) => void;
  addMessage: (ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>) => void;
  updateStatus: (ticketId: string, status: TicketStatus) => void;
  getTicketsByUser: (userId: string) => SupportTicket[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-1001',
    userId: 'MERCHANT-1',
    userType: 'merchant',
    userName: 'Al-Jazira Parts',
    email: 'mohammed@store.com',
    subject: 'Issue with Payout',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastUpdate: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      { id: 'm1', senderId: 'MERCHANT-1', senderRole: 'merchant', text: 'I did not receive my payout this Thursday.', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]
  },
  {
    id: 'TKT-1002',
    userId: 'CUST-10',
    userType: 'customer',
    userName: 'Khalid Omar',
    email: 'khalid@gmail.com',
    subject: 'App Crashing',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lastUpdate: new Date(Date.now() - 100000).toISOString(),
    messages: [
      { id: 'm1', senderId: 'CUST-10', senderRole: 'user', text: 'App crashes when I open map.', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'm2', senderId: 'ADM-01', senderRole: 'admin', text: 'Fixed in latest update. Please update.', timestamp: new Date(Date.now() - 100000).toISOString() }
    ]
  }
];

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: INITIAL_TICKETS,

  createTicket: (data) => set((state) => ({
    tickets: [{
      ...data,
      id: `TKT-${Date.now().toString().slice(-4)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      messages: []
    }, ...state.tickets]
  })),

  addMessage: (ticketId, message) => set((state) => ({
    tickets: state.tickets.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        lastUpdate: new Date().toISOString(),
        // If admin replies, change status to In Progress automatically
        status: message.senderRole === 'admin' && t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
        messages: [...t.messages, {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        }]
      };
    })
  })),

  updateStatus: (ticketId, status) => set((state) => ({
    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status, lastUpdate: new Date().toISOString() } : t)
  })),

  getTicketsByUser: (userId) => get().tickets.filter(t => t.userId === userId)
}));
