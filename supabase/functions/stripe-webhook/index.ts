// Stripe webhook -> payments ledger with real fee / net payout.
// Idempotent via webhook_events.stripe_event_id UNIQUE.
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

/** Stripe standard US card pricing fallback when the balance transaction is not settled yet. */
const estimateFee = (amount: number) => Math.round(amount * 0.029) + 30;

async function realFee(paymentIntentId: string, amount: number): Promise<number> {
  try {
    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
      expand: ["data.balance_transaction"],
    });
    const bt = charges.data[0]?.balance_transaction;
    if (bt && typeof bt !== "string" && typeof bt.fee === "number") return bt.fee;
  } catch {
    /* fall through to estimate */
  }
  return estimateFee(amount);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();

  if (!secret || !signature) {
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Invalid signature: ${message}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency: first writer wins, everyone else exits 200.
  const { error: dupeErr } = await admin
    .from("webhook_events")
    .insert({ stripe_event_id: event.id, type: event.type, processed: false });
  if (dupeErr) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const amount = pi.amount_received || pi.amount || 0;
      const fee = await realFee(pi.id, amount);
      await admin.from("payments").upsert(
        {
          stripe_payment_intent_id: pi.id,
          amount_cents: amount,
          fee_cents: fee,
          net_cents: amount - fee,
          currency: pi.currency ?? "usd",
          sku: (pi.metadata?.sku as string) ?? null,
          status: "succeeded",
        },
        { onConflict: "stripe_payment_intent_id" },
      );
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin.from("payments").upsert(
        {
          stripe_payment_intent_id: pi.id,
          amount_cents: pi.amount || 0,
          fee_cents: 0,
          net_cents: 0,
          currency: pi.currency ?? "usd",
          sku: (pi.metadata?.sku as string) ?? null,
          status: "failed",
        },
        { onConflict: "stripe_payment_intent_id" },
      );
    } else if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const piId = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      const amount = s.amount_total || 0;
      if (piId && amount > 0) {
        const fee = await realFee(piId, amount);
        let sku: string | null = null;
        try {
          const li = await stripe.checkout.sessions.listLineItems(s.id, { limit: 1 });
          sku = (li.data[0]?.price?.id as string) ?? null;
        } catch { /* optional */ }
        await admin.from("payments").upsert(
          {
            stripe_payment_intent_id: piId,
            stripe_session_id: s.id,
            amount_cents: amount,
            fee_cents: fee,
            net_cents: amount - fee,
            currency: s.currency ?? "usd",
            sku,
            status: "succeeded",
          },
          { onConflict: "stripe_payment_intent_id" },
        );
      }
    }

    await admin
      .from("webhook_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
