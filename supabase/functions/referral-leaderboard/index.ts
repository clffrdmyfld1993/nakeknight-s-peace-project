import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Public, read-only aggregate leaderboard. Returns only masked codes + counts.
const mask = (code: string) =>
  code.length <= 4 ? code[0] + "***" : code.slice(0, 2) + "***" + code.slice(-2);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase.rpc("get_referral_counts");
    if (error) throw error;

    const rows = (data ?? []).map((r: { referral_code: string; referrals: number }) => ({
      referral_code: mask(String(r.referral_code)),
      referrals: Number(r.referrals),
    }));

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ rows: [], error: "Unable to load leaderboard" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
