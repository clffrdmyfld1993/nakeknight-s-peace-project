// True profitability feed for /command.
// Everything here is read live: Stripe charges (real fees from balance
// transactions), Stripe balance, and Google Search Console impressions/clicks.
// Nothing is simulated. Zero means zero.
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://herodossier.lovable.app/";
const GATEWAY =
  "https://connector-gateway.lovable.dev/google_search_console/webmasters/v3";

const PRICE_TO_SKU: Record<string, string> = {
  price_1U5eoLQaKvygaDfu89rdjnui: "NK-DIGI-BLD-001",
  price_1U5eoiQaKvygaDfuws5sOcem: "NK-BUNDLE-CREATOR-002",
  price_1U5ep8QaKvygaDfuZmol7l9w: "NK-DIGI-LORE-002",
  price_1U5eo6QaKvygaDfuCBN6PlqJ: "NK-DIGI-LORE-001",
  price_1U5eoYQaKvygaDfuPca90sP8: "NK-DIGI-DOSSIER-001",
  price_1U5eowQaKvygaDfuPNTkVJPw: "NK-BUNDLE-COMPLETE-003",
};

const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};

async function gsc(): Promise<
  { impressions: number; clicks: number; ctr: number; position: number } | null
> {
  const key = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  const lov = Deno.env.get("LOVABLE_API_KEY");
  if (!key || !lov) return null;
  try {
    const res = await fetch(
      `${GATEWAY}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lov}`,
          "X-Connection-Api-Key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: isoDaysAgo(30),
          endDate: isoDaysAgo(1),
          rowLimit: 1,
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const row = data.rows?.[0];
    if (!row) return { impressions: 0, clicks: 0, ctr: 0, position: 0 };
    return {
      impressions: row.impressions ?? 0,
      clicks: row.clicks ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    const [charges, sessions, balance, products, search] = await Promise.all([
      stripe.charges.list({
        created: { gte: since },
        limit: 100,
        expand: ["data.balance_transaction"],
      }),
      stripe.checkout.sessions.list({
        created: { gte: since },
        limit: 100,
        expand: ["data.line_items"],
      }),
      stripe.balance.retrieve(),
      stripe.products.list({ active: true, limit: 100 }),
      gsc(),
    ]);

    // payment_intent -> sku, from checkout line items.
    const piToSku = new Map<string, string>();
    for (const s of sessions.data) {
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      const priceId = (s as any).line_items?.data?.[0]?.price?.id as string | undefined;
      if (pi && priceId) piToSku.set(pi, PRICE_TO_SKU[priceId] ?? priceId);
    }

    const succeeded = charges.data.filter((c) => c.paid && c.status === "succeeded");

    let grossCents = 0;
    let feeCents = 0;
    let refundedCents = 0;
    const bySku = new Map<
      string,
      { sku: string; units: number; grossCents: number; feeCents: number }
    >();
    const daily = new Map<string, number>();

    for (const c of succeeded) {
      const bt = c.balance_transaction;
      const fee =
        bt && typeof bt !== "string" && typeof bt.fee === "number"
          ? bt.fee
          : Math.round(c.amount * 0.029) + 30;
      grossCents += c.amount;
      feeCents += fee;
      refundedCents += c.amount_refunded ?? 0;

      const piId = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
      const sku = (piId && piToSku.get(piId)) || (c.metadata?.sku as string) || "Unattributed";
      const row = bySku.get(sku) ?? { sku, units: 0, grossCents: 0, feeCents: 0 };
      row.units += 1;
      row.grossCents += c.amount;
      row.feeCents += fee;
      bySku.set(sku, row);

      const day = new Date(c.created * 1000).toISOString().slice(0, 10);
      daily.set(day, (daily.get(day) ?? 0) + (c.amount - fee));
    }

    // Cumulative net series across the whole 30-day window (zero-filled).
    const series: { date: string; net: number; cumulative: number }[] = [];
    let cum = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const net = (daily.get(key) ?? 0) / 100;
      cum += net;
      series.push({ date: key, net: Number(net.toFixed(2)), cumulative: Number(cum.toFixed(2)) });
    }

    const orders = succeeded.length;
    const netCents = grossCents - feeCents;
    const available = balance.available.reduce((s, b) => s + b.amount, 0);
    const pending = balance.pending.reduce((s, b) => s + b.amount, 0);

    return new Response(
      JSON.stringify({
        window: "30d",
        checkedAt: new Date().toISOString(),
        currency: "usd",
        orders,
        grossCents,
        feeCents,
        netCents,
        refundedCents,
        feePct: grossCents > 0 ? feeCents / grossCents : null,
        aovCents: orders > 0 ? Math.round(grossCents / orders) : 0,
        balance: { availableCents: available, pendingCents: pending },
        activeProducts: products.data.length,
        bySku: Array.from(bySku.values())
          .map((r) => ({ ...r, netCents: r.grossCents - r.feeCents }))
          .sort((a, b) => b.netCents - a.netCents),
        series,
        search,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
