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
  "price_1TXeo8QaKvygaDfuLrhyzP8Q", // Wallpaper Pack
  "price_1TXeqHQaKvygaDfuwx5nOZ87", // Ashen Accord comic
  "price_1TXevvQaKvygaDfuxBJrXkCG", // Soundtrack
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

    const lineItems = items
      .filter((i) => i && typeof i.price === "string" && PRICE_IDS.has(i.price))
      .map((i) => ({
        price: i.price,
        quantity: Math.max(1, Math.min(10, Number(i.quantity) || 1)),
      }));

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ error: "No valid items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://herodossier.lovable.app";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/store?status=success`,
      cancel_url: `${origin}/store?status=canceled`,
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
