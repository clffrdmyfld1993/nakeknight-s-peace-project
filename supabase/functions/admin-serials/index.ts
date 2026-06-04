import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const SerialSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.number().int().min(0).max(10_000),
  description: z.string().max(2000).optional().nullable(),
  transcript_text: z.string().max(200_000).optional().nullable(),
  audio_url: z.string().max(1000).optional().nullable(),
  cover_url: z.string().max(1000).optional().nullable(),
  duration_seconds: z.number().int().min(0).max(86_400).optional().nullable(),
  release_date: z.string().optional(),
  is_published: z.boolean().optional(),
  is_premium: z.boolean().optional(),
});

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("create"), data: SerialSchema }),
  z.object({ action: z.literal("update"), id: z.string().uuid(), data: SerialSchema.partial() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
  z.object({
    action: z.literal("signed_upload"),
    path: z.string().min(1).max(500).regex(/^[A-Za-z0-9._\-\/]+$/),
  }),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_TOKEN");
  if (!adminToken) {
    return json({ error: "ADMIN_TOKEN not configured on server" }, 500);
  }
  const provided = req.headers.get("x-admin-token");
  if (!provided || provided !== adminToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = parsed.data;
    if (body.action === "list") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .select("*")
        .order("episode_number", { ascending: true });
      if (error) throw error;
      return json({ rows: data });
    }
    if (body.action === "create") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .insert(body.data)
        .select()
        .single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "update") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .update(body.data)
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "delete") {
      const { error } = await supabase.from("weekly_serials").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (body.action === "signed_upload") {
      const { data, error } = await supabase.storage
        .from("chronicles")
        .createSignedUploadUrl(body.path);
      if (error) throw error;
      return json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
    }
    return json({ error: "Unknown action" }, 400);
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
