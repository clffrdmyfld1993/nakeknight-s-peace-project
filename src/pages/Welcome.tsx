import { Link } from "react-router-dom";
import { CheckCircle2, Headphones, BookOpen, Share2 } from "lucide-react";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { getStoredRef } from "@/components/RefCapture";

const STEPS = [
  {
    icon: Headphones,
    title: "Start with Episode 01",
    body: "The whole free run is on the Chronicles page. No account, no paywall on the starters.",
    to: "/chronicles",
    cta: "LISTEN NOW",
  },
  {
    icon: BookOpen,
    title: "Read the field notes",
    body: "How the autonomous engine writes, voices and publishes an episode every week.",
    to: "/blog",
    cta: "READ",
  },
  {
    icon: Share2,
    title: "Grab your referral link",
    body: "Share the Chronicles with your link and climb the referral leaderboard.",
    to: "/referrals",
    cta: "GET MY LINK",
  },
];

export default function Welcome() {
  const ref = getStoredRef() ?? undefined;
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Welcome to NakeKnight Chronicles | HeroDossier"
        description="You're in. Start with Episode 01 of the NakeKnight Chronicles, read the build notes, and grab your referral link."
        path="/welcome"
        noindex
      />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" />
          <p className="font-display text-xs tracking-[0.3em] text-primary">YOU'RE IN</p>
        </div>
        <h1 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-4">
          Welcome to the Chronicles
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-12 max-w-xl">
          Check your inbox for the confirmation. While you wait, here's everything worth doing in the
          next five minutes.
        </p>

        <div className="space-y-4">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="p-6 bg-card/60 border border-border rounded-lg backdrop-blur-sm flex items-start gap-4"
            >
              <div className="p-2.5 bg-background border border-border rounded-md shrink-0">
                <s.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-foreground mb-1">{s.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{s.body}</p>
                <Link
                  to={s.to}
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-xs rounded-sm hover:opacity-90"
                >
                  {s.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <ShareButtons
            url="/chronicles"
            refCode={ref}
            text="Just joined NakeKnight Chronicles — a PG audio serial about knights who took off their armor. New episode every Friday."
          />
        </div>
      </div>
    </div>
  );
}
