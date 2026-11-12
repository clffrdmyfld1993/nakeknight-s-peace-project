import { gaEvent } from "@/lib/ga4";

// Existence in Stripe or storage alone is not a verified deliverable.
export const CASE_FILES_REVIEW = {
  name: "NakeKnight Case Files",
  file: "case-files.zip",
  stripePriceId: "price_1TePGgQaKvygaDfu3DJTEJm4",
  priceCents: 1500,
  contentsVerified: false,
  paidDownloadTested: false,
} as const;

export function canStartMilestoneCheckout(): boolean {
  return CASE_FILES_REVIEW.contentsVerified && CASE_FILES_REVIEW.paidDownloadTested;
}

export interface VerifiedFulfillment {
  paid?: boolean;
  downloads?: Array<{ file: string; label: string; url: string }>;
  premium_chronicles?: boolean;
}

export function isVerifiedPayment(result: VerifiedFulfillment | null | undefined): boolean {
  return result?.paid === true;
}

export function recordVerifiedPurchase(transactionId: string, result: VerifiedFulfillment) {
  if (!transactionId || !isVerifiedPayment(result)) return;
  // Value is intentionally omitted: fulfillment does not return a server-verified amount.
  try {
    const key = `nk_verified_purchase_${transactionId}`;
    if (localStorage.getItem(key)) return;
    const tracker = (window as Window & { gtag?: unknown }).gtag;
    if (typeof tracker !== "function") return;
    gaEvent("purchase", {
      transaction_id: transactionId,
      items: (result.downloads ?? []).map((d) => ({ item_id: d.file, item_name: d.label })),
    });
    localStorage.setItem(key, "1");
  } catch { /* Analytics must not block fulfillment. */ }
}