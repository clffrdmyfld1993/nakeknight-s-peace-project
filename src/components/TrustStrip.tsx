import { Lock, Zap, ShieldCheck } from "lucide-react";

/**
 * 3-badge trust strip. Drop within ~100px of any Buy button.
 * Grayscale, low-noise, 32px icon row.
 */
export default function TrustStrip({ className = "" }: { className?: string }) {
  const items = [
    {
      icon: Lock,
      title: "Secure Checkout",
      sub: "Powered by Stripe · Visa · Mastercard · Apple Pay · Google Pay · Link",
    },
    {
      icon: Zap,
      title: "Instant Download",
      sub: "Files unlock the second payment clears",
    },
    {
      icon: ShieldCheck,
      title: "7-Day Money-Back Guarantee",
      sub: "Not what you expected? Full refund, no forms",
    },
  ];

  return (
    <ul
      className={`grid sm:grid-cols-3 gap-3 text-muted-foreground ${className}`}
      aria-label="Purchase guarantees"
    >
      {items.map(({ icon: Icon, title, sub }) => (
        <li
          key={title}
          className="flex items-start gap-3 p-3 bg-card/60 border border-border rounded-md grayscale"
        >
          <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-display text-[11px] tracking-widest text-foreground">
              {title.toUpperCase()}
            </span>
            <span className="block text-[11px] leading-snug">{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
