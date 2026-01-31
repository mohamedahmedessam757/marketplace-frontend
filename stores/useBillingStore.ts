
import { create } from 'zustand';
import { useOrderStore } from './useOrderStore';
import { useAuditStore } from './useAuditStore';

export type InvoiceType = 'CUSTOMER_INVOICE' | 'COMMISSION_INVOICE' | 'PAYOUT_INVOICE' | 'SHIPPING_INVOICE';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED' | 'FROZEN';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string; // INV-XXXX
  orderId?: number; // Linked order
  merchantName?: string;
  customerName?: string;
  type: InvoiceType;
  status: InvoiceStatus;
  date: string;
  supplyDate: string;
  
  // Financial Breakdown
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  
  // Breakdown for Commission Logic
  basePrice?: number;
  commissionAmount?: number;
  
  items: InvoiceItem[];
}

interface BillingState {
  invoices: Invoice[];
  generateInvoicesFromOrders: () => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  freezeInvoice: (orderId: number) => void;
  releaseInvoice: (orderId: number, isRefund: boolean) => void;
  markInvoicePaid: (invoiceId: string) => void; // New Action
}

export const useBillingStore = create<BillingState>((set, get) => ({
  invoices: [],

  generateInvoicesFromOrders: () => {
    const orders = useOrderStore.getState().orders;
    const generatedInvoices: Invoice[] = [];

    // Helper to generate Invoice ID
    const genId = (prefix: string, seed: number) => `${prefix}-${10000 + seed}`;

    orders.forEach((order) => {
        if (!order.price) return;
        
        // Parse Price (Structure: Total Paid by Customer)
        const priceStr = order.price.replace(/[^0-9.]/g, '');
        const totalOrderPrice = parseFloat(priceStr);
        if (isNaN(totalOrderPrice)) return;

        // Base Calculations
        const vatRate = 0.15;
        const shippingCost = 50; // Mock standard shipping
        
        // 1. CUSTOMER INVOICE (Sales Invoice)
        if (['PREPARATION', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'RETURNED', 'DISPUTED'].includes(order.status)) {
            const itemBasePrice = (totalOrderPrice / (1 + vatRate));
            const itemTax = totalOrderPrice - itemBasePrice;
            
            let status: InvoiceStatus = 'PAID';
            if (order.status === 'RETURNED') status = 'REFUNDED';
            if (order.status === 'DISPUTED') status = 'FROZEN';

            generatedInvoices.push({
                id: genId('INV', order.id),
                orderId: order.id,
                type: 'CUSTOMER_INVOICE',
                status: status,
                date: order.offerAcceptedAt || order.date,
                supplyDate: order.date,
                merchantName: order.merchantName || 'E-Tashleh Vendor',
                customerName: `Customer ${Math.floor(order.id / 10)}`,
                subtotal: itemBasePrice,
                taxAmount: itemTax,
                shippingAmount: shippingCost,
                totalAmount: totalOrderPrice + shippingCost,
                basePrice: totalOrderPrice, // Store Base for calculations
                items: [
                    {
                        description: `${order.part} for ${order.car}`,
                        quantity: 1,
                        unitPrice: itemBasePrice,
                        taxableAmount: itemBasePrice,
                        taxAmount: itemTax,
                        totalAmount: totalOrderPrice
                    }
                ]
            });
        }

        // 2. COMMISSION INVOICE (To Merchant)
        if (['COMPLETED', 'DELIVERED'].includes(order.status)) {
            const commissionRate = 0.20;
            const commissionTotal = totalOrderPrice * commissionRate;
            const commissionBase = commissionTotal / (1 + vatRate);
            const commissionTax = commissionTotal - commissionBase;

            generatedInvoices.push({
                id: genId('COM', order.id),
                orderId: order.id,
                type: 'COMMISSION_INVOICE',
                status: 'PAID', // Deducted from wallet
                date: order.deliveredAt || new Date().toISOString(),
                supplyDate: order.deliveredAt || new Date().toISOString(),
                merchantName: 'E-Tashleh Platform', // Issuer
                customerName: order.merchantName, // Recipient
                subtotal: commissionBase,
                taxAmount: commissionTax,
                shippingAmount: 0,
                totalAmount: commissionTotal,
                items: [
                    {
                        description: `Platform Commission (20%) - Order #${order.id}`,
                        quantity: 1,
                        unitPrice: commissionBase,
                        taxableAmount: commissionBase,
                        taxAmount: commissionTax,
                        totalAmount: commissionTotal
                    }
                ]
            });
        }
    });
    
    // Add some mock Payout Invoices
    generatedInvoices.push({
        id: 'PAY-8821',
        type: 'PAYOUT_INVOICE',
        status: 'PENDING',
        date: new Date().toISOString(),
        supplyDate: new Date().toISOString(),
        merchantName: 'Al-Jazira Parts',
        customerName: 'E-Tashleh Finance',
        subtotal: 1500,
        taxAmount: 0,
        shippingAmount: 0,
        totalAmount: 1500,
        items: [{ description: 'Weekly Payout', quantity: 1, unitPrice: 1500, taxableAmount: 0, taxAmount: 0, totalAmount: 1500 }]
    });

    set({ invoices: generatedInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
  },

  getInvoiceById: (id) => get().invoices.find(inv => inv.id === id),

  freezeInvoice: (orderId) => set((state) => ({
      invoices: state.invoices.map(inv => inv.orderId === orderId ? { ...inv, status: 'FROZEN' } : inv)
  })),

  releaseInvoice: (orderId, isRefund) => set((state) => ({
      invoices: state.invoices.map(inv => inv.orderId === orderId ? { ...inv, status: isRefund ? 'REFUNDED' : 'PAID' } : inv)
  })),

  markInvoicePaid: (invoiceId) => {
      set((state) => ({
          invoices: state.invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv)
      }));
      useAuditStore.getState().logAction({
          action: 'FINANCIAL',
          entity: 'Invoice',
          actorType: 'Admin',
          actorId: 'ADM-001',
          actorName: 'Admin',
          reason: 'Manual Payout Execution',
          metadata: { invoiceId }
      });
  }
}));
