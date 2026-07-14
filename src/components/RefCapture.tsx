import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Captures ?ref= from the URL on any page load and persists it to localStorage
// so downstream flows (lead capture, Stripe checkout, share buttons) can attach it.
export default function RefCapture() {
  const location = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get("ref");
      if (ref && ref.length > 0 && ref.length <= 60) {
        localStorage.setItem("nk_ref", ref);
      }
    } catch {
      // ignore
    }
  }, [location.search]);
  return null;
}

export function getStoredRef(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl && fromUrl.length <= 60) return fromUrl;
    return localStorage.getItem("nk_ref");
  } catch {
    return null;
  }
}
