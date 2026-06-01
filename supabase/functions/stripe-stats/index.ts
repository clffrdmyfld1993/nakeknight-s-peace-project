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
        }
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
      if (!starting_after) break;
    }

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
