import { Twitter, MessageCircle, Share2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string; // absolute or relative path
  text: string;
  refCode?: string;
  compact?: boolean;
}

const ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://herodossier.lovable.app";

function withRef(url: string, ref?: string) {
  const abs = url.startsWith("http") ? url : `${ORIGIN}${url}`;
  if (!ref) return abs;
  const u = new URL(abs);
  u.searchParams.set("ref", ref);
  return u.toString();
}

export default function ShareButtons({ url, text, refCode, compact }: ShareButtonsProps) {
  const fullUrl = withRef(url, refCode);
  const enc = encodeURIComponent;

  const targets = [
    {
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(fullUrl)}`,
    },
    {
      label: "Reddit",
      icon: Share2,
      href: `https://www.reddit.com/submit?url=${enc(fullUrl)}&title=${enc(text)}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(`${text} ${fullUrl}`)}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-4"}`}>
      <span className="text-[10px] tracking-[0.25em] text-muted-foreground font-display mr-1">
        SHARE
      </span>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Share on ${t.label}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-card border border-border rounded-sm text-xs font-display tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          <t.icon className="w-3.5 h-3.5" /> {t.label.toUpperCase()}
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-card border border-border rounded-sm text-xs font-display tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
      >
        <LinkIcon className="w-3.5 h-3.5" /> COPY
      </button>
    </div>
  );
}
