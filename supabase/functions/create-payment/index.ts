import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Allow-listed Stripe price IDs (server-controlled, no client-supplied amounts).
const PRICE_IDS = new Set<string>([
  "price_1TXekBQaKvygaDfuD0wRtBXy", // Iron Pact comic
  "price_1TXekpQaKvygaDfuVAcK9WYr", // Hero Dossier Art Pack
  "price_1TXelCQaKvygaDfuIU1E618w", // Complete Lore Collection
  "price_1TXeo8QaKvygaDfuLrhyzP8Q", // Wallpaper Pack (order bump)
  "price_1TXeqHQaKvygaDfuwx5nOZ87", // Ashen Accord comic
  "price_1TXevvQaKvygaDfuxBJrXkCG", // Soundtrack
  "price_1TePGgQaKvygaDfu3DJTEJm4", // Complete Case Files & AI Prompts ($15)
  "price_1TelQGQaKvygaDfuazPCyTBv", // Premium Chronicles — Lifetime ($29)
  "price_1U3A0KQaKvygaDfu5P6Asi4z", // Founder's Archive ($99)
]);

// Recurring prices must check out in subscription mode.
const RECURRING_PRICE_IDS = new Set<string>([
  "price_1U3A0ZQaKvygaDfuvR8SnhrO", // Chronicles Membership ($7/mo)
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const items: Array<{ price: string; quantity?: number }> = Array.isArray(
      body?.items,
    )
      ? body.items
      : [];
    const referral =
      typeof body?.referral === "string" && body.referral.length <= 120
        ? body.referral
        : null;
    const source =
      typeof body?.source === "string" && body.source.length <= 120
        ? body.source
        : "store";

    const clean = items.filter(
      (i) =>
        i &&
        typeof i.price === "string" &&
        (PRICE_IDS.has(i.price) || RECURRING_PRICE_IDS.has(i.price)),
    );

    const hasRecurring = clean.some((i) => RECURRING_PRICE_IDS.has(i.price));
    const hasOneTime = clean.some((i) => PRICE_IDS.has(i.price));

    if (clean.length === 0) {
      return new Response(JSON.stringify({ error: "No valid items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (hasRecurring && hasOneTime) {
      return new Response(
        JSON.stringify({
          error: "Membership must be purchased on its own checkout.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const lineItems = clean.map((i) => ({
      price: i.price,
      quantity: hasRecurring
        ? 1
        : Math.max(1, Math.min(10, Number(i.quantity) || 1)),
    }));

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://herodossier.lovable.app";
    const metadata = {
      ...(referral ? { referral_code: referral } : {}),
      source,
      ...(hasRecurring ? { plan: "chronicles_membership" } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode: hasRecurring ? "subscription" : "payment",
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?status=canceled`,
      metadata,
      ...(hasRecurring ? { subscription_data: { metadata } } : {}),
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
