import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Returns ONLY real Stripe data. No simulations.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });

    // Active products
    const products = await stripe.products.list({ active: true, limit: 100 });
    const activeProducts = products.data.length;

    // Successful payments — last 30 days
    const since = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;
    let pmtCount = 0;
    let pmtGrossCents = 0;
    let currency = "usd";
    let starting_after: string | undefined = undefined;
    const charges: Stripe.Charge[] = [];
    // Pagination — cap at 5 pages (500 charges) to stay polite.
    for (let i = 0; i < 5; i++) {
      const page: Stripe.ApiList<Stripe.Charge> = await stripe.charges.list({
        limit: 100,
        created: { gte: since },
        ...(starting_after ? { starting_after } : {}),
      });
      for (const c of page.data) {
        if (c.status === "succeeded" && !c.refunded) {
          pmtCount += 1;
          pmtGrossCents += c.amount;
          currency = c.currency || currency;
          charges.push(c);
        }
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
      if (!starting_after) break;
    }

    // --- 14-day cashflow series (real charges only) ---
    const dayKey = (unix: number) =>
      new Date(unix * 1000).toISOString().slice(0, 10);
    const cutoff14 = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 14;
    const buckets = new Map<string, { grossCents: number; orders: number }>();
    for (let d = 13; d >= 0; d--) {
      const k = dayKey(Math.floor(Date.now() / 1000) - d * 86400);
      buckets.set(k, { grossCents: 0, orders: 0 });
    }
    for (const c of charges) {
      if (c.created < cutoff14) continue;
      const k = dayKey(c.created);
      const b = buckets.get(k);
      if (!b) continue;
      b.grossCents += c.amount;
      b.orders += 1;
    }
    const series = Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      grossCents: v.grossCents,
      orders: v.orders,
    }));
    const last14GrossCents = series.reduce((s, d) => s + d.grossCents, 0);
    const last14Orders = series.reduce((s, d) => s + d.orders, 0);
    const aovCents = last14Orders > 0 ? Math.round(last14GrossCents / last14Orders) : 0;

    // --- Recurring revenue (real subscriptions only) ---
    const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    let mrrCents = 0;
    for (const s of subs.data) {
      for (const item of s.items.data) {
        const p = item.price;
        if (!p.unit_amount || !p.recurring) continue;
        const qty = item.quantity || 1;
        const perMonth =
          p.recurring.interval === "year"
            ? p.unit_amount / 12
            : p.recurring.interval === "week"
              ? (p.unit_amount * 52) / 12
              : p.recurring.interval === "day"
                ? p.unit_amount * 30
                : p.unit_amount;
        mrrCents += Math.round((perMonth * qty) / (p.recurring.interval_count || 1));
      }
    }

    // Checkout sessions started vs completed (last 14 days) — conversion truth.
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: cutoff14 },
    });
    const checkoutStarts = sessions.data.length;
    const checkoutCompleted = sessions.data.filter(
      (s) => s.status === "complete",
    ).length;

    return new Response(
      JSON.stringify({
        source: "stripe-live",
        checkedAt: new Date().toISOString(),
        activeProducts,
        last30d: {
          successfulPayments: pmtCount,
          grossCents: pmtGrossCents,
          currency: currency.toUpperCase(),
        },
        last14d: {
          grossCents: last14GrossCents,
          orders: last14Orders,
          aovCents,
          checkoutStarts,
          checkoutCompleted,
          series,
        },
        recurring: {
          activeSubscriptions: subs.data.length,
          mrrCents,
          arpaCents:
            subs.data.length > 0 ? Math.round(mrrCents / subs.data.length) : 0,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
