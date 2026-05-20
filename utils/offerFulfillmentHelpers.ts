export type OfferFulfillmentStatus =
    | 'AWAITING_PAYMENT'
    | 'IN_PREPARATION'
    | 'PREPARED'
    | 'VERIFICATION'
    | 'VERIFICATION_SUCCESS'
    | 'READY_FOR_SHIPPING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

const FULFILLMENT_RANK: Record<OfferFulfillmentStatus, number> = {
    AWAITING_PAYMENT: 0,
    IN_PREPARATION: 10,
    PREPARED: 20,
    VERIFICATION: 30,
    VERIFICATION_SUCCESS: 40,
    READY_FOR_SHIPPING: 50,
    SHIPPED: 60,
    DELIVERED: 70,
    CANCELLED: -1,
};

export function getFulfillmentLabel(
    status: string | undefined,
    isAr: boolean,
): string {
    const labels: Record<string, { ar: string; en: string }> = {
        AWAITING_PAYMENT: { ar: 'بانتظار الدفع', en: 'Awaiting payment' },
        IN_PREPARATION: { ar: 'قيد التجهيز', en: 'In preparation' },
        PREPARED: { ar: 'تم التجهيز', en: 'Prepared' },
        VERIFICATION: { ar: 'التوثيق قيد المراجعة', en: 'Verification in review' },
        VERIFICATION_SUCCESS: { ar: 'تم التوثيق', en: 'Verified' },
        READY_FOR_SHIPPING: { ar: 'جاهز للشحن', en: 'Ready for shipping' },
        SHIPPED: { ar: 'تم الشحن', en: 'Shipped' },
        DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
        CANCELLED: { ar: 'ملغى', en: 'Cancelled' },
    };
    const entry = labels[String(status || '').toUpperCase()];
    if (!entry) return status || (isAr ? 'غير معروف' : 'Unknown');
    return isAr ? entry.ar : entry.en;
}

export function canSelectOfferForShipping(
    fulfillmentStatus?: string,
    shippedFromCart?: boolean,
): boolean {
    return (
        String(fulfillmentStatus || '').toUpperCase() === 'READY_FOR_SHIPPING' &&
        !shippedFromCart
    );
}

export function merchantCanMarkPrepared(fulfillmentStatus?: string): boolean {
    const s = String(fulfillmentStatus || '').toUpperCase();
    return !s || s === 'IN_PREPARATION' || s === 'AWAITING_PAYMENT';
}

export function merchantCanSubmitVerification(fulfillmentStatus?: string): boolean {
    return String(fulfillmentStatus || '').toUpperCase() === 'PREPARED';
}

export function merchantCanRequestReadyForShipping(fulfillmentStatus?: string): boolean {
    return String(fulfillmentStatus || '').toUpperCase() === 'VERIFICATION_SUCCESS';
}

export function buildFulfillmentStepHint(
    summary: {
        total: number;
        stepCounts: {
            preparation: number;
            prepared: number;
            verification: number;
            verificationSuccess: number;
            readyForShipping: number;
        };
    } | null | undefined,
    stepIndex: number,
    isAr: boolean,
): string | undefined {
    if (!summary || summary.total <= 1) return undefined;
    const { total, stepCounts } = summary;
    const of = isAr ? 'من' : 'of';
    switch (stepIndex) {
        case 3:
            return `${stepCounts.preparation}/${total} ${isAr ? 'في التجهيز' : 'in prep'}`;
        case 4:
            return `${stepCounts.verificationSuccess}/${total} ${isAr ? 'موثّق' : 'verified'}`;
        case 5:
            return `${stepCounts.readyForShipping}/${total} ${isAr ? 'جاهز للشحن' : 'ready'}`;
        default:
            return undefined;
    }
}

export { FULFILLMENT_RANK };
