// GA4 ecommerce events — real events only, fired from real user actions.
import { PRICE_NAMES } from "@/lib/catalog";

const MEASUREMENT_ID = "G-28DS4V8XRT";

function gtag(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fn = (window as any).gtag;
  if (typeof fn !== "function") return;
  fn("event", event, { send_to: MEASUREMENT_ID, ...params });
}

export interface GaItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}

export function itemsFromPrices(priceIds: string[]): GaItem[] {
  return priceIds.map((p) => {
    const meta = PRICE_NAMES[p];
    return {
      item_id: meta?.sku ?? p,
      item_name: meta?.name ?? p,
      price: meta?.price ?? 0,
      quantity: 1,
    };
  });
}

const value = (items: GaItem[]) =>
  Number(items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0).toFixed(2));

export const gaViewItem = (items: GaItem[]) =>
  gtag("view_item", { currency: "USD", value: value(items), items });

export const gaAddToCart = (items: GaItem[]) =>
  gtag("add_to_cart", { currency: "USD", value: value(items), items });

export const gaBeginCheckout = (items: GaItem[]) =>
  gtag("begin_checkout", { currency: "USD", value: value(items), items });

export const gaPurchase = (
  transactionId: string,
  items: GaItem[],
  amount?: number,
) =>
  gtag("purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: amount ?? value(items),
    items,
  });

export const gaUpsellView = (items: GaItem[]) =>
  gtag("post_purchase_upsell_view", { currency: "USD", value: value(items), items });

export const gaUpsellAccepted = (items: GaItem[]) =>
  gtag("post_purchase_upsell_accepted", { currency: "USD", value: value(items), items });

export const gaEvent = gtag;
