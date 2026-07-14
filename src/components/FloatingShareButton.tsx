import { useState } from "react";
import { Share2, X, Copy, Twitter } from "lucide-react";
import { toast } from "sonner";
import { getStoredRef } from "./RefCapture";

const SITE = "https://herodossier.lovable.app";

export default function FloatingShareButton() {
  const [open, setOpen] = useState(false);

  const buildUrl = (path = "/chronicles") => {
    const ref = getStoredRef();
    const url = `${SITE}${path}`;
    return ref ? `${url}?ref=${encodeURIComponent(ref)}` : url;
  };

  const shareText =
    "🎙️ NAKEKNIGHT — The Peacemaker. A serialized audio drama from the shadow war. Free episodes weekly.";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(buildUrl());
      toast.success("Referral link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(buildUrl())}`;
    window.open(url, "_blank", "noopener");
  };

  const shareReddit = () => {
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent(
      buildUrl(),
    )}&title=${encodeURIComponent("NakeKnight — a serialized AI-built audio drama")}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 p-3 bg-card/95 border border-primary/40 rounded-lg shadow-[0_0_60px_-20px_hsl(var(--primary))] backdrop-blur-sm">
          <button
            onClick={shareX}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-widest text-foreground hover:text-primary"
          >
            <Twitter className="w-3.5 h-3.5" /> SHARE ON X
          </button>
          <button
            onClick={shareReddit}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-widest text-foreground hover:text-primary"
          >
            <Share2 className="w-3.5 h-3.5" /> POST TO REDDIT
          </button>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-widest text-foreground hover:text-primary"
          >
            <Copy className="w-3.5 h-3.5" /> COPY REFERRAL LINK
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Share"
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_-8px_hsl(var(--primary))] flex items-center justify-center hover:opacity-90"
      >
        {open ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
