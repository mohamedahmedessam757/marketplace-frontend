import { create } from 'zustand';
import { getCurrentUserId } from '../utils/auth';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface SupportTicket {
  id: number; // Changed to number to match Chat ID type if possible, or keep string and cast
  ticket_number: string;
  subject: string;
  message: string; // Initial message
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  user_id: string;
  userName?: string;
  email?: string;
  userType: 'customer' | 'merchant';
  lastUpdate: string;
  messages: SupportMessage[];
}

interface SupportState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  createTicket: (subject: string, message: string, priority: string) => Promise<boolean>;
  addMessage: (ticketId: number, message: Omit<SupportMessage, 'id' | 'timestamp'>) => void;
  updateStatus: (ticketId: number, status: 'OPEN' | 'CLOSED' | 'RESOLVED') => void;
}

// MOCK DATA FOR DEMO
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 9001,
    ticket_number: 'TKT-2024-001',
    subject: 'Payment Issue',
    message: 'I cannot process my payment.',
    status: 'OPEN',
    priority: 'HIGH',
    created_at: new Date().toISOString(),
    user_id: 'user-1',
    userName: 'Mohammed A.',
    email: 'mohammed@example.com',
    userType: 'customer',
    lastUpdate: new Date().toISOString(),
    messages: [
      { id: 'm1', senderId: 'user-1', senderRole: 'user', text: 'I tried to pay with Visa but it failed.', timestamp: new Date(Date.now() - 100000).toISOString() },
      { id: 'm2', senderId: 'admin-1', senderRole: 'admin', text: 'Hello, we are checking your transaction now.', timestamp: new Date(Date.now() - 50000).toISOString() }
    ]
  }
];

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: MOCK_TICKETS,
  loading: false,
  error: null,

  fetchTickets: async () => {
    // In a real app, fetch from Supabase. For demo, we use MOCK_TICKETS already in state.
    // just simulate delay
    set({ loading: true });
    setTimeout(() => set({ loading: false }), 500);
  },

  createTicket: async (subject: string, message: string, priority: string) => {
    const newTicket: SupportTicket = {
      id: Date.now(),
      ticket_number: `TKT-${Date.now()}`,
      subject,
      message,
      priority: priority as any,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      user_id: getCurrentUserId() || 'guest',
      userName: 'Current User', // Mock
      email: 'user@example.com',
      userType: 'customer',
      lastUpdate: new Date().toISOString(),
      messages: [
        { id: Date.now().toString(), senderId: 'user', senderRole: 'user', text: message, timestamp: new Date().toISOString() }
      ]
    };
    set(state => ({ tickets: [newTicket, ...state.tickets] }));
    return true;
  },

  addMessage: (ticketId, message) => {
    set(state => ({
      tickets: state.tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            lastUpdate: new Date().toISOString(),
            status: message.senderRole === 'user' ? 'OPEN' : t.status, // Re-open if user replies
            messages: [...t.messages, {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              ...message
            }]
          };
        }
        return t;
      })
    }));
  },

  updateStatus: (ticketId, status) => {
    set(state => ({
      tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status } : t)
    }));
  }
}));
