import { useCallback, useEffect, useRef } from "react";
import {
  gaAddToCart,
  gaBeginCheckout,
  gaPurchase,
  gaViewItem,
  type GaItem,
} from "@/lib/ga4";
import { SINGLES, TIERS, ORDER_BUMP, PRICE_NAMES } from "@/lib/catalog";

/** SKU -> GA4 item, sourced from the live catalog so price/name never drift. */
const CATALOG: Record<string, GaItem> = Object.fromEntries(
  [
    ...Object.values(SINGLES),
    ...TIERS,
    ORDER_BUMP,
    ...Object.values(PRICE_NAMES),
  ].map((e: any) => [
    e.sku,
    { item_id: e.sku, item_name: e.name, price: e.price, quantity: 1 },
  ]),
);

export function itemsFromSkus(skus: string[]): GaItem[] {
  return skus
    .map((s) => CATALOG[s] ?? { item_id: s, item_name: s, price: 0, quantity: 1 })
    .map((i) => ({ ...i }));
}

const PURCHASE_KEY = "nk_ga4_purchases";

function alreadyLogged(transactionId: string): boolean {
  try {
    const raw = localStorage.getItem(PURCHASE_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (seen.includes(transactionId)) return true;
    localStorage.setItem(
      PURCHASE_KEY,
      JSON.stringify([...seen, transactionId].slice(-50)),
    );
    return false;
  } catch {
    return false;
  }
}

/**
 * GA4 ecommerce for G-28DS4V8XRT. Every call maps to a real user action:
 * view_item on product view, add_to_cart on Buy click, begin_checkout on the
 * Stripe redirect, purchase exactly once per transaction id.
 */
export function useAnalytics() {
  const viewed = useRef<string>("");

  const viewItem = useCallback((skus: string[]) => {
    const key = skus.join("|");
    if (viewed.current === key) return;
    viewed.current = key;
    gaViewItem(itemsFromSkus(skus));
  }, []);

  const addToCart = useCallback((skus: string[]) => {
    gaAddToCart(itemsFromSkus(skus));
  }, []);

  const beginCheckout = useCallback((skus: string[]) => {
    gaBeginCheckout(itemsFromSkus(skus));
  }, []);

  const purchase = useCallback(
    (transactionId: string, skus: string[], amount?: number) => {
      if (!transactionId || alreadyLogged(transactionId)) return;
      gaPurchase(transactionId, itemsFromSkus(skus), amount);
    },
    [],
  );

  return { viewItem, addToCart, beginCheckout, purchase };
}

/** Fires view_item once on mount for the given SKUs. */
export function useViewItem(skus: string[]) {
  const { viewItem } = useAnalytics();
  const key = skus.join("|");
  useEffect(() => {
    viewItem(key.split("|").filter(Boolean));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
