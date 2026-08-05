import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/components/RefCapture";

const PLAY_TTL_MS = 24 * 60 * 60 * 1000;

function playKey(episodeId: string) {
  return `nk_play_${episodeId}`;
}

/**
 * Records an episode play. Debounced to one play per episode per browser per 24h.
 * Fire-and-forget: never throws into the UI.
 */
export async function trackPlay(episodeId: string, durationSeconds?: number) {
  try {
    const key = playKey(episodeId);
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < PLAY_TTL_MS) return;
    localStorage.setItem(key, String(Date.now()));
    await supabase.from("episode_plays").insert({
      episode_id: episodeId,
      ref: getStoredRef(),
      duration_seconds: durationSeconds ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "episode_play", { episode_id: episodeId });
    }
  } catch {
    // analytics must never break playback
  }
}

/** Logs an outbound share click for referral attribution. */
export async function trackShare(network: string, path?: string) {
  try {
    await supabase.from("referral_shares").insert({
      network: network.slice(0, 40),
      referral_code: getStoredRef(),
      path: path ?? (typeof window !== "undefined" ? window.location.pathname : null),
    });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "share", { method: network });
    }
  } catch {
    // ignore
  }
}
