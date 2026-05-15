/** Parse order.partImages / verification doc images from API (Json | string[]). */
export function asImageUrls(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === 'string' && x.length > 0);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return asImageUrls(parsed);
    } catch {
      return value.startsWith('http') || value.startsWith('data:') ? [value] : [];
    }
  }
  return [];
}

export function formatActionLabel(action: string, isAr: boolean): string {
  const map: Record<string, { ar: string; en: string }> = {
    TASK_CREATED: { ar: 'إنشاء المهمة', en: 'Task created' },
    TASK_ASSIGNED: { ar: 'إسناد الموظف', en: 'Officer assigned' },
    LINK_GENERATED: { ar: 'إنشاء رابط', en: 'Link generated' },
    LINK_OPENED: { ar: 'فتح الرابط', en: 'Link opened' },
    LINK_ACTIVATED: { ar: 'تفعيل الرابط + OTP', en: 'Link activated' },
    VERIFICATION_STARTED: { ar: 'بدء المطابقة', en: 'Inspection started' },
    PHOTO_UPLOADED: { ar: 'رفع صور', en: 'Photos uploaded' },
    DECISION_MATCHING: { ar: 'قرار: مطابق', en: 'Decision: matching' },
    DECISION_NON_MATCHING: { ar: 'قرار: غير مطابق', en: 'Decision: non-matching' },
    REPORT_GENERATED: { ar: 'توليد التقرير', en: 'Report generated' },
  };
  const entry = map[action];
  return entry ? (isAr ? entry.ar : entry.en) : action;
}

/** طلب متعدد القطع (مجمّع) — وليس مجرد وجود سجل واحد في parts. */
export function isMultiPartOrder(order: {
  requestType?: string | null;
  parts?: unknown[] | null;
}): boolean {
  if (order.requestType === 'multiple') return true;
  return (order.parts?.length ?? 0) > 1;
}

export function resolveMerchantStore(
  order: { store?: { id?: string; name?: string; storeCode?: string; logo?: string | null } | null },
  doc?: { store?: { id?: string; name?: string; storeCode?: string; logo?: string | null } | null } | null,
) {
  if (order.store?.name || order.store?.storeCode) return order.store;
  if (doc?.store?.name || doc?.store?.storeCode) return doc.store;
  return order.store ?? doc?.store ?? null;
}

/** صور العميل للمقارنة — بدون تكرار في الطلب الفردي. */
export function getCustomerReferenceImages(order: {
  partImages?: unknown;
  parts?: { images?: unknown }[] | null;
  requestType?: string | null;
}): string[] {
  if (isMultiPartOrder(order)) {
    const fromParts = (order.parts ?? []).flatMap((p) => asImageUrls(p.images));
    const fromOrder = asImageUrls(order.partImages);
    return [...new Set([...fromOrder, ...fromParts])];
  }
  const fromOrder = asImageUrls(order.partImages);
  if (fromOrder.length > 0) return fromOrder;
  const firstPart = order.parts?.[0];
  return firstPart ? asImageUrls(firstPart.images) : [];
}

export const CUSTOMER_ORDER_STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  VERIFICATION: { ar: 'قيد التوثيق / المطابقة', en: 'Under verification' },
  CORRECTION_PERIOD: { ar: 'فترة تصحيح (48 ساعة)', en: 'Correction period (48h)' },
  CORRECTION_SUBMITTED: { ar: 'تم إرسال التصحيح', en: 'Correction submitted' },
  VERIFICATION_SUCCESS: { ar: 'تم اعتماد التوثيق', en: 'Verification approved' },
};

export const VERIFICATION_TASK_STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: 'قيد الانتظار', en: 'Pending' },
  IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In progress' },
  AWAITING_ADMIN_APPROVAL: { ar: 'بانتظار اعتماد الإدارة', en: 'Awaiting admin approval' },
  COMPLETED_MATCH: { ar: 'تمت المطابقة بنجاح', en: 'Matching completed' },
  COMPLETED_NON_MATCH: { ar: 'تم إنهاء المهمة (غير مطابق)', en: 'Non-match completed' },
  AWAITING_CORRECTION: { ar: 'بانتظار التصحيح من المتجر', en: 'Awaiting merchant correction' },
  EXPIRED: { ar: 'منتهي الصلاحية', en: 'Expired' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
};

export const VERIFICATION_TASK_DECISION_LABEL: Record<string, { ar: string; en: string }> = {
  MATCHING: { ar: 'مطابق', en: 'Matching' },
  NON_MATCHING: { ar: 'غير مطابق', en: 'Non-matching' },
  PARTIAL_MATCH: { ar: 'مطابق جزئياً', en: 'Partial match' },
};
