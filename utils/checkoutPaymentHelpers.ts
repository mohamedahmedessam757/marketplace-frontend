import type { OrderOffer } from '../stores/useOrderStore';
import { isAcceptedOfferStatus } from './offerStatusHelpers';

export function offerIdsMatch(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

export function isOfferPaid(
  offerId: unknown,
  paidOfferIds: Array<string | number>,
): boolean {
  return paidOfferIds.some((id) => offerIdsMatch(id, offerId));
}

export function getAcceptedOffersFromList(
  offers: OrderOffer[] | undefined,
): OrderOffer[] {
  return offers?.filter((o) => isAcceptedOfferStatus(o.status)) ?? [];
}

/** Every accepted offer must have a confirmed SUCCESS payment. */
export function areAllAcceptedOffersPaid(
  acceptedOffers: OrderOffer[],
  paidOfferIds: Array<string | number>,
): boolean {
  if (acceptedOffers.length === 0) return false;
  return acceptedOffers.every((o) => isOfferPaid(o.id, paidOfferIds));
}
