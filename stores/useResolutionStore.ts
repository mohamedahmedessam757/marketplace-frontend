
import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';
import { returnsApi } from '../services/api/returns';
import { supabase } from '../services/supabase';

export type CaseType = 'return' | 'dispute';
export type CaseStatus = 'OPEN' | 'AWAITING_MERCHANT' | 'AWAITING_ADMIN' | 'APPROVED' | 'RESOLVED' | 'CLOSED' | 'REFUNDED' | 'ESCALATED' | 'UNDER_REVIEW' | 'PENDING' | 'MERCHANT_REJECTED';

// New Detailed Return Lifecycle Phases (The 7 Steps)
export type ReturnPhase =
    | 'REQUESTED'
    | 'NEGOTIATION'
    | 'APPROVED_BY_STORE'
    | 'WAYBILL_ISSUED'
    | 'CUSTOMER_HANDOVER'
    | 'STORE_RECEIVED'
    | 'REFUND_PROCESSED';

export interface CaseMessage {
    id: string;
    caseId: string;
    caseType: CaseType;
    senderId: string;
    senderRole: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
    text: string;
    attachments: string[];
    createdAt: string;
    sender?: {
        name: string;
        avatar: string;
    };
}

export interface ResolutionCase {
    id: string;
    orderId: number;
    type: CaseType;
    status: CaseStatus;
    returnPhase?: ReturnPhase;
    reason: string;
    description: string;
    customerId: string;
    customerName: string;
    customerEvidence?: string[]; // URLs
    createdAt: string;
    deadline: string; // ISO String (For 72h Merchant Response)
    merchantName: string;
    merchantStoreId?: string; // Phase 4
    partName: string;
    updatedAt: string;
    handoverDeadline?: string; // Phase 4

    // Phase 4 Governance
    usageCondition?: string;
    faultParty?: string;
    refundAmount?: number;
    shippingRefund?: number;
    verdictNotes?: string;
    verdictIssuedAt?: string;
    verdictLocked?: boolean;
    invoiceId?: string; // Phase 4 Traceability
    shipmentId?: string; // Phase 4 Traceability
    stripeFee?: number; // Phase 4 Governance
    customerRisk?: {
        totalReturns: number;
        totalDisputes: number;
        riskScore: number;
        riskLevel: 'NORMAL' | 'HIGH' | 'CRITICAL';
    };

    // Merchant Response Data
    merchantResponse?: {
        text: string;
        acceptedReturn: boolean;
        evidence: string[];
        submittedAt: string;
    };
}

interface ResolutionState {
    cases: ResolutionCase[];
    caseMessages: CaseMessage[];
    merchantRisk: any | null;
    isLoading: boolean;
    error: string | null;

    fetchMerchantCases: () => Promise<void>;
    fetchAdminCases: () => Promise<void>;
    fetchUserRequests: () => Promise<void>;
    
    respondToCase: (caseId: string, type: 'return' | 'dispute', response: { text: string, acceptedReturn: boolean, evidence: File[] }) => Promise<void>;
    adminVerdict: (caseId: string, type: 'return' | 'dispute', verdict: 'REFUND' | 'RELEASE_FUNDS' | 'DENY', notes: string, extra?: any) => Promise<void>;
    updateAdminVerdict: (caseId: string, type: 'return' | 'dispute', verdict: 'REFUND' | 'RELEASE_FUNDS' | 'DENY', notes: string, extra?: any) => Promise<void>;
    
    // Phase 4 Actions
    fetchCaseMessages: (caseId: string) => Promise<void>;
    sendCaseMessage: (caseId: string, type: CaseType, text: string, attachments?: string[]) => Promise<void>;
    fetchMerchantRisk: (storeId: string) => Promise<void>;
    fetchCustomerRisk: (customerId: string) => Promise<void>;

    updateReturnPhase: (caseId: string, phase: ReturnPhase) => void;
    checkEscalations: () => void;

    subscribeToCases: (role: 'merchant' | 'admin' | 'customer') => void;
    unsubscribeFromCases: () => void;

    getCaseById: (id: string) => ResolutionCase | undefined;
}

export const useResolutionStore = create<ResolutionState>((set, get) => ({
    cases: [],
    caseMessages: [],
    merchantRisk: null,
    isLoading: false,
    error: null,

    fetchMerchantCases: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnsApi.getMerchantCases();
            const { returns, disputes } = response.data;

            const mappedReturns: ResolutionCase[] = returns.map(r => ({
                id: r.id,
                orderId: parseInt(r.orderId) || 0,
                type: 'return',
                status: r.status === 'PENDING' ? 'AWAITING_MERCHANT' : r.status,
                reason: r.reason,
                description: r.description || '',
                customerId: r.customerId,
                customerName: r.customer?.name || 'Customer',
                customerEvidence: Array.isArray(r.evidenceFiles) ? r.evidenceFiles : [],
                createdAt: r.createdAt,
                deadline: new Date(new Date(r.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: 'Your Store',
                partName: r.order?.parts?.[0]?.name || 'Parts',
                updatedAt: r.updatedAt,
                handoverDeadline: r.handoverDeadline
            }));

            const mappedDisputes: ResolutionCase[] = disputes.map(d => ({
                id: d.id,
                orderId: parseInt(d.orderId) || 0,
                type: 'dispute',
                status: d.status === 'OPEN' ? 'AWAITING_MERCHANT' : d.status,
                reason: d.reason,
                description: d.description || '',
                customerId: d.customerId,
                customerName: d.customer?.name || 'Customer',
                customerEvidence: Array.isArray(d.evidenceFiles) ? d.evidenceFiles : [],
                createdAt: d.createdAt,
                deadline: new Date(new Date(d.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: 'Your Store',
                partName: d.order?.parts?.[0]?.name || 'Parts',
                updatedAt: d.updatedAt,
                handoverDeadline: d.handoverDeadline
            }));

            set({ cases: [...mappedReturns, ...mappedDisputes], isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAdminCases: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnsApi.getAdminCases();
            const { returns, disputes } = response.data;

            const mappedReturns: ResolutionCase[] = returns.map(r => ({
                id: r.id,
                orderId: parseInt(r.orderId) || 0,
                type: 'return',
                status: r.status === 'PENDING' ? 'AWAITING_MERCHANT' : r.status,
                reason: r.reason,
                description: r.description || '',
                customerId: r.customerId,
                customerName: r.customer?.name || 'Customer',
                customerEvidence: Array.isArray(r.evidenceFiles) ? r.evidenceFiles : [],
                createdAt: r.createdAt,
                deadline: new Date(new Date(r.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: r.order?.acceptedOffer?.store?.name || 'Store',
                merchantStoreId: r.order?.acceptedOffer?.storeId,
                partName: r.order?.parts?.[0]?.name || 'Parts',
                updatedAt: r.updatedAt,
                usageCondition: r.usageCondition,
                handoverDeadline: r.handoverDeadline,
                invoiceId: r.invoiceId,
                shipmentId: r.shipmentId
            }));

            const mappedDisputes: ResolutionCase[] = disputes.map(d => ({
                id: d.id,
                orderId: parseInt(d.orderId) || 0,
                type: 'dispute',
                status: d.status === 'OPEN' ? 'AWAITING_MERCHANT' : d.status,
                reason: d.reason,
                description: d.description || '',
                customerId: d.customerId,
                customerName: d.customer?.name || 'Customer',
                customerEvidence: Array.isArray(d.evidenceFiles) ? d.evidenceFiles : [],
                createdAt: d.createdAt,
                deadline: new Date(new Date(d.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: d.order?.acceptedOffer?.store?.name || 'Store',
                merchantStoreId: d.order?.acceptedOffer?.storeId,
                partName: d.order?.parts?.[0]?.name || 'Parts',
                updatedAt: d.updatedAt,
                handoverDeadline: d.handoverDeadline,
                // Governance data
                faultParty: d.faultParty,
                refundAmount: d.refundAmount,
                shippingRefund: d.shippingRefund,
                verdictNotes: d.verdictNotes,
                verdictIssuedAt: d.verdictIssuedAt,
                verdictLocked: d.verdictLocked,
                invoiceId: d.invoiceId,
                shipmentId: d.shipmentId,
                stripeFee: d.stripeFee ? Number(d.stripeFee) : undefined
            }));

            set({ cases: [...mappedReturns, ...mappedDisputes], isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchUserRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnsApi.getUserReturns();
            const { returns, disputes } = response.data;

            const mappedReturns: ResolutionCase[] = returns.map(r => ({
                id: r.id,
                orderId: parseInt(r.orderId) || 0,
                type: 'return',
                status: r.status === 'PENDING' ? 'AWAITING_MERCHANT' : r.status,
                reason: r.reason,
                description: r.description || '',
                customerId: r.customerId,
                customerName: 'You',
                customerEvidence: Array.isArray(r.evidenceFiles) ? r.evidenceFiles : [],
                createdAt: r.createdAt,
                deadline: new Date(new Date(r.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: r.order?.acceptedOffer?.store?.name || 'Store',
                partName: r.order?.parts?.[0]?.name || 'Parts',
                updatedAt: r.updatedAt,
                handoverDeadline: r.handoverDeadline
            }));

            const mappedDisputes: ResolutionCase[] = disputes.map(d => ({
                id: d.id,
                orderId: parseInt(d.orderId) || 0,
                type: 'dispute',
                status: d.status === 'OPEN' ? 'AWAITING_MERCHANT' : d.status,
                reason: d.reason,
                description: d.description || '',
                customerId: d.customerId,
                customerName: 'You',
                customerEvidence: Array.isArray(d.evidenceFiles) ? d.evidenceFiles : [],
                createdAt: d.createdAt,
                deadline: new Date(new Date(d.createdAt).getTime() + (48 * 60 * 60 * 1000)).toISOString(),
                merchantName: d.order?.acceptedOffer?.store?.name || 'Store',
                partName: d.order?.parts?.[0]?.name || 'Parts',
                updatedAt: d.updatedAt,
                handoverDeadline: d.handoverDeadline
            }));

            set({ cases: [...mappedReturns, ...mappedDisputes], isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    respondToCase: async (caseId, type, response) => {
        set({ isLoading: true });
        try {
            if (type === 'return') {
                await returnsApi.respondToReturn(
                    caseId, 
                    response.acceptedReturn ? 'APPROVE' : 'REJECT', 
                    response.text, 
                    response.evidence
                );
            } else {
                await returnsApi.respondToDispute(caseId, response.text, response.evidence);
            }
            
            // Reload local state based on current view
            const role = (window as any).currentViewRole || 'merchant';
            if (role === 'admin') await get().fetchAdminCases();
            else if (role === 'customer') await get().fetchUserRequests();
            else await get().fetchMerchantCases();

        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    adminVerdict: async (caseId, type, verdict, notes, extra) => {
        set({ isLoading: true });
        try {
            await returnsApi.issueVerdict(caseId, type, verdict, notes, extra);
            await get().fetchAdminCases();
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateAdminVerdict: async (caseId, type, verdict, notes, extra) => {
        set({ isLoading: true });
        try {
            await returnsApi.updateAdminVerdict(caseId, type, verdict, notes, extra);
            await get().fetchAdminCases();
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchCaseMessages: async (caseId) => {
        try {
            const response = await returnsApi.getCaseMessages(caseId);
            set({ caseMessages: response.data });
        } catch (error: any) {
            console.error('Failed to fetch case messages', error);
        }
    },

    sendCaseMessage: async (caseId, type, text, attachments) => {
        try {
            // Optimistic update
            const tempMsg: CaseMessage = {
                id: Math.random().toString(),
                caseId,
                caseType: type,
                senderId: 'me',
                senderRole: 'ADMIN', // Will be corrected by server
                text,
                attachments: attachments || [],
                createdAt: new Date().toISOString()
            };
            set(state => ({ caseMessages: [...state.caseMessages, tempMsg] }));

            await returnsApi.sendCaseMessage(caseId, type, text, attachments);
            // We don't need to re-fetch if RT subscription is active
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchMerchantRisk: async (storeId) => {
        try {
            const response = await returnsApi.getMerchantRiskStats(storeId);
            set({ merchantRisk: response.data });
        } catch (error: any) {
            console.error('Failed to fetch merchant risk', error);
        }
    },

    fetchCustomerRisk: async (customerId) => {
        try {
            const response = await returnsApi.getCustomerRiskStats(customerId);
            set(state => ({
                cases: state.cases.map(c => 
                    c.customerId === customerId ? { ...c, customerRisk: response.data } : c
                )
            }));
        } catch (error: any) {
            console.error('Failed to fetch customer risk', error);
        }
    },

    updateReturnPhase: (caseId, phase) => {
        set(state => ({
            cases: state.cases.map(c => 
                c.id === caseId ? { ...c, returnPhase: phase, updatedAt: new Date().toISOString() } : c
            )
        }));
    },

    checkEscalations: () => {
        const now = new Date();
        set(state => ({
            cases: state.cases.map(c => {
                if (c.status === 'AWAITING_MERCHANT' && new Date(c.deadline) < now) {
                    return { ...c, status: 'ESCALATED' as CaseStatus };
                }
                return c;
            })
        }));
    },

    subscribeToCases: (role: 'merchant' | 'admin' | 'customer') => {
        const sub = supabase.channel('resolution-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, (payload) => {
                if (role === 'admin') get().fetchAdminCases();
                else if (role === 'customer') get().fetchUserRequests();
                else get().fetchMerchantCases();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes' }, (payload) => {
                if (role === 'admin') get().fetchAdminCases();
                else if (role === 'customer') get().fetchUserRequests();
                else get().fetchMerchantCases();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'case_messages' }, (payload) => {
                const newMsg = payload.new as CaseMessage;
                // Only add if it's not already there (avoid double from optimistic)
                set(state => {
                    const exists = state.caseMessages.some(m => m.id === newMsg.id || (m.senderId === 'me' && m.text === newMsg.text));
                    if (exists) {
                        return { caseMessages: state.caseMessages.map(m => (m.senderId === 'me' && m.text === newMsg.text) ? newMsg : m) };
                    }
                    return { caseMessages: [...state.caseMessages, newMsg] };
                });
            })
            .subscribe();

        (window as any).resolutionSub = sub;
    },

    unsubscribeFromCases: () => {
        const sub = (window as any).resolutionSub;
        if (sub) {
            supabase.removeChannel(sub);
        }
    },

    getCaseById: (id) => {
        return get().cases.find(c => c.id === id);
    }
}));
