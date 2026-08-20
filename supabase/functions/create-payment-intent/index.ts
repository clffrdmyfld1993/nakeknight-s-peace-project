// Creates a PaymentIntent for a server-priced SKU (digital only, no shipping).
// Returns client_secret plus the fee / net payout math for that sale.
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side price table — the client never sends an amount.
const SKUS: Record<string, { name: string; amount: number; priceId: string }> = {
  "NK-DIGI-BLD-001": {
    name: "Brick Build PDF",
    amount: 599,
    priceId: "price_1U5eoLQaKvygaDfu89rdjnui",
  },
  "NK-BUNDLE-CREATOR-002": {
    name: "Creator Pack",
    amount: 1599,
    priceId: "price_1U5eoiQaKvygaDfuws5sOcem",
  },
};

const estimateFee = (amount: number) => Math.round(amount * 0.029) + 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const sku = typeof body?.sku === "string" ? body.sku : "";
    const item = SKUS[sku];
    if (!item) {
      return new Response(JSON.stringify({ error: "Unknown SKU" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const fee = estimateFee(item.amount);
    const intent = await stripe.paymentIntents.create({
      amount: item.amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      description: `${item.name} — instant digital download`,
      metadata: { sku, price_id: item.priceId },
    });

    // Mirror the ledger row immediately as pending; the webhook flips it to succeeded.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    await admin.from("payments").upsert(
      {
        stripe_payment_intent_id: intent.id,
        amount_cents: item.amount,
        fee_cents: 0,
        net_cents: 0,
        currency: "usd",
        sku,
        status: "pending",
      },
      { onConflict: "stripe_payment_intent_id" },
    );

    return new Response(
      JSON.stringify({
        client_secret: intent.client_secret,
        sku,
        amount_cents: item.amount,
        fee_cents: fee,
        net_cents: item.amount - fee,
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
