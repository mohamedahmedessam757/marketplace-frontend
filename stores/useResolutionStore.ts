
import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';

export type CaseType = 'return' | 'dispute';
export type CaseStatus = 'OPEN' | 'AWAITING_MERCHANT' | 'AWAITING_ADMIN' | 'RESOLVED' | 'CLOSED' | 'REFUNDED' | 'ESCALATED';

// New Detailed Return Lifecycle Phases (The 7 Steps)
export type ReturnPhase = 
  | 'REQUESTED' 
  | 'NEGOTIATION' 
  | 'APPROVED_BY_STORE' 
  | 'WAYBILL_ISSUED' 
  | 'CUSTOMER_HANDOVER' 
  | 'STORE_RECEIVED' 
  | 'REFUND_PROCESSED';

export interface ResolutionCase {
  id: string;
  orderId: number;
  type: CaseType;
  status: CaseStatus;
  returnPhase?: ReturnPhase; 
  reason: string;
  description: string;
  customerName: string; 
  customerEvidence?: string[]; // URLs
  createdAt: string;
  deadline: string; // ISO String (For 72h Merchant Response)
  merchantName: string;
  partName: string;
  updatedAt: string;
  
  // Merchant Response Data
  merchantResponse?: {
    text: string;
    acceptedReturn: boolean;
    evidence: File[];
    submittedAt: string;
  };
  
  // Admin Decision
  adminDecision?: {
    verdict: 'refund' | 'deny' | 'partial';
    amount?: number;
    notes?: string;
    decidedAt?: string;
  };
}

interface ResolutionState {
  cases: ResolutionCase[];
  createCase: (data: Omit<ResolutionCase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'deadline' | 'customerName'>) => void;
  getCaseByOrderId: (orderId: number) => ResolutionCase | undefined;
  getCaseById: (id: string) => ResolutionCase | undefined;
  respondToCase: (caseId: string, response: { text: string, acceptedReturn: boolean, evidence: File[] }) => void;
  adminVerdict: (caseId: string, verdict: 'refund' | 'deny' | 'partial', amount?: number, notes?: string) => void;
  updateReturnPhase: (caseId: string, phase: ReturnPhase) => void;
  checkEscalations: () => void; // Auto-escalate if deadline missed
}

export const useResolutionStore = create<ResolutionState>((set, get) => ({
  cases: [
    {
        id: 'DSP-2024-001',
        orderId: 1005,
        type: 'dispute',
        status: 'AWAITING_MERCHANT',
        reason: 'defective',
        description: 'The engine mount has a visible crack. See attached photos.',
        customerName: 'Khalid O.',
        customerEvidence: ['img1.jpg', 'img2.jpg'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours left
        updatedAt: new Date().toISOString(),
        merchantName: 'My Store',
        partName: 'Engine Mounts'
    }
  ],
  
  createCase: (data) => set((state) => {
    const now = new Date();
    const deadline = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72h Merchant Deadline
    
    const newCase: ResolutionCase = {
        ...data,
        id: `${data.type === 'return' ? 'RET' : 'DSP'}-${Date.now().toString().slice(-4)}`,
        status: 'AWAITING_MERCHANT', // Start here
        returnPhase: data.type === 'return' ? 'REQUESTED' : undefined,
        customerName: 'Current User', 
        createdAt: now.toISOString(),
        deadline: deadline.toISOString(),
        updatedAt: now.toISOString()
    };

    useAuditStore.getState().logAction({
        action: 'CREATE',
        entity: 'ResolutionCase',
        orderId: data.orderId,
        actorType: 'Customer',
        actorId: 'CURRENT_USER',
        actorName: 'Customer',
        newState: newCase,
        reason: data.reason
    });

    return { cases: [newCase, ...state.cases] };
  }),

  getCaseByOrderId: (orderId) => get().cases.find(c => c.orderId === orderId),
  
  getCaseById: (id) => get().cases.find(c => c.id === id),

  respondToCase: (caseId, response) => set((state) => {
      const targetCase = state.cases.find(c => c.id === caseId);
      if (!targetCase) return state;

      // Logic: If merchant accepts return -> Move to Approved Phase. If they deny -> Move to Admin Review.
      let nextStatus: CaseStatus = 'AWAITING_ADMIN';
      let nextPhase = targetCase.returnPhase;

      if (response.acceptedReturn) {
          nextStatus = 'OPEN'; // Still open but progressed
          nextPhase = 'APPROVED_BY_STORE';
      }

      useAuditStore.getState().logAction({
          action: 'UPDATE',
          entity: 'ResolutionCase',
          orderId: targetCase.orderId,
          actorType: 'Vendor',
          actorId: 'MERCHANT',
          actorName: targetCase.merchantName,
          previousState: targetCase.status,
          newState: nextStatus,
          reason: 'Merchant Response'
      });

      return {
          cases: state.cases.map(c => {
              if (c.id !== caseId) return c;
              return {
                  ...c,
                  status: nextStatus,
                  returnPhase: nextPhase,
                  updatedAt: new Date().toISOString(),
                  merchantResponse: {
                      ...response,
                      submittedAt: new Date().toISOString()
                  }
              };
          })
      };
  }),

  updateReturnPhase: (caseId, phase) => set((state) => {
      const targetCase = state.cases.find(c => c.id === caseId);
      if (!targetCase) return state;

      useAuditStore.getState().logAction({
          action: 'STATUS_CHANGE',
          entity: 'ReturnProcess',
          orderId: targetCase.orderId,
          actorType: 'System', 
          actorId: 'SYS',
          actorName: 'System',
          previousState: targetCase.returnPhase,
          newState: phase,
          reason: 'Phase Update'
      });

      return {
          cases: state.cases.map(c => 
              c.id === caseId ? { ...c, returnPhase: phase, updatedAt: new Date().toISOString() } : c
          )
      };
  }),

  adminVerdict: (caseId, verdict, amount, notes) => set((state) => {
      const targetCase = state.cases.find(c => c.id === caseId);
      if (!targetCase) return state;

      const nextStatus = verdict === 'refund' ? 'REFUNDED' : 'RESOLVED';
      
      useAuditStore.getState().logAction({
          action: 'FINANCIAL',
          entity: 'ResolutionCase',
          orderId: targetCase.orderId,
          actorType: 'Admin',
          actorId: 'ADM-001',
          actorName: 'Admin',
          reason: `Verdict: ${verdict}`,
          metadata: { amount, notes }
      });

      return {
          cases: state.cases.map(c => {
              if (c.id !== caseId) return c;
              return {
                  ...c,
                  status: nextStatus,
                  returnPhase: verdict === 'refund' ? 'REFUND_PROCESSED' : c.returnPhase,
                  updatedAt: new Date().toISOString(),
                  adminDecision: {
                      verdict,
                      amount,
                      notes,
                      decidedAt: new Date().toISOString()
                  }
              };
          })
      };
  }),

  checkEscalations: () => set((state) => {
      const now = new Date();
      let updated = false;
      const newCases = state.cases.map(c => {
          if (c.status === 'AWAITING_MERCHANT' && new Date(c.deadline) < now) {
              updated = true;
              return { ...c, status: 'ESCALATED' as CaseStatus };
          }
          return c;
      });
      return updated ? { cases: newCases } : state;
  })
}));
