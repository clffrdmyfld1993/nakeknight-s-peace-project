import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// price_id -> downloadable file path inside the `digital-products` bucket
const DOWNLOADS: Record<string, { file: string; label: string }> = {
  price_1TePGgQaKvygaDfu3DJTEJm4: {
    file: "case-files.zip",
    label: "The Complete NakeKnight Case Files & AI Prompts",
  },
};

// price_id that grants lifetime premium chronicles access
const PREMIUM_CHRONICLES_PRICE = "price_1TelQGQaKvygaDfuazPCyTBv";

const Body = z.object({
  session_id: z.string().min(8).max(200),
  episode_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const { session_id, episode_id } = parsed.data;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return json({ paid: false, error: "Payment not completed" }, 402);
    }

    const priceIds = (session.line_items?.data || [])
      .map((li) => li.price?.id)
      .filter((p): p is string => !!p);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Build downloads (5-min signed URLs)
    const downloads: Array<{ label: string; url: string; file: string }> = [];
    for (const pid of priceIds) {
      const d = DOWNLOADS[pid];
      if (!d) continue;
      const { data, error } = await supabase.storage
        .from("digital-products")
        .createSignedUrl(d.file, 60 * 15);
      if (!error && data?.signedUrl) {
        downloads.push({ label: d.label, url: data.signedUrl, file: d.file });
      } else {
        downloads.push({ label: d.label, url: "", file: d.file });
      }
    }

    const hasPremiumChronicles = priceIds.includes(PREMIUM_CHRONICLES_PRICE);

    // If asked for a specific premium chronicles episode audio URL
    let episode_audio_url: string | null = null;
    if (hasPremiumChronicles && episode_id) {
      const { data: ep } = await supabase
        .from("weekly_serials")
        .select("audio_url, is_premium, is_published")
        .eq("id", episode_id)
        .maybeSingle();
      if (ep?.is_published && ep.audio_url) {
        if (ep.audio_url.startsWith("http")) {
          episode_audio_url = ep.audio_url;
        } else {
          const { data: signed } = await supabase.storage
            .from("chronicles")
            .createSignedUrl(ep.audio_url, 60 * 60 * 6);
          episode_audio_url = signed?.signedUrl ?? null;
        }
      }
    }

    return json({
      paid: true,
      downloads,
      premium_chronicles: hasPremiumChronicles,
      episode_audio_url,
      customer_email: session.customer_details?.email ?? null,
      referral_code: (session.metadata?.referral_code as string) ?? null,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
