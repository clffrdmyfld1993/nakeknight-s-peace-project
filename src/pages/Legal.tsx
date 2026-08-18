import SEO from "@/components/SEO";

const PROMISE =
  "No Email Tracking Promise — we sell direct, live data only via GA4, no data brokers.";

interface Section {
  h: string;
  body: string[];
}

const PAGES: Record<
  string,
  { title: string; meta: string; path: string; heading: string; sections: Section[] }
> = {
  privacy: {
    title: "Privacy Policy — NakeKnight",
    meta:
      "How NakeKnight handles your data: no mailing list, no data brokers, aggregate analytics only.",
    path: "/privacy",
    heading: "PRIVACY POLICY",
    sections: [
      {
        h: "We do not run a mailing list",
        body: [
          "NakeKnight does not collect email addresses for marketing. There is no newsletter, no waitlist, and no lead magnet anywhere on this site.",
          "The only address we ever see is the one Stripe collects at checkout so it can send your receipt and so we can deliver your download link. It is never added to a list, never sold, and never shared with a data broker.",
        ],
      },
      {
        h: "What we measure",
        body: [
          "We use Google Analytics 4 (property G-28DS4V8XRT) for aggregate traffic and commerce reporting, and Google Search Console for search performance. Both report on traffic in aggregate.",
          "We record anonymous episode plays and share clicks in our own database. Those rows contain no name, no email, and no account identifier.",
        ],
      },
      {
        h: "Payments",
        body: [
          "Card details are handled entirely by Stripe. They never touch our servers and we never store them.",
        ],
      },
      {
        h: "Your rights",
        body: [
          "Want your purchase record deleted? Email hello@nakeknight.proton.me with your Stripe receipt and we will remove it.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy — 7-Day Money-Back Guarantee",
    meta:
      "NakeKnight digital downloads carry a 7-day, no-forms money-back guarantee. Here is exactly how it works.",
    path: "/refund",
    heading: "REFUND POLICY",
    sections: [
      {
        h: "7 days, no forms",
        body: [
          "Every digital product on this site is covered by a 7-day money-back guarantee. If the files are not what you expected, email hello@nakeknight.proton.me with your Stripe receipt and we refund in full.",
          "We do not ask you to delete the files or justify the request.",
        ],
      },
      {
        h: "Memberships",
        body: [
          "Cancel the Chronicles Membership at any time. You keep access through the end of the paid period; we do not pro-rate partial months.",
        ],
      },
      {
        h: "Licenses",
        body: [
          "Commercial licenses ($250 / $1,000 / $5,000) are refundable within 7 days provided the artwork has not yet been published, printed, or shipped in a commercial product.",
        ],
      },
      {
        h: "How long it takes",
        body: [
          "Refunds are issued through Stripe and typically land on your statement in 5–10 business days depending on your bank.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service — NakeKnight",
    meta:
      "Terms covering purchases, personal-use licensing, commercial licensing and acceptable use of NakeKnight digital products.",
    path: "/terms",
    heading: "TERMS OF SERVICE",
    sections: [
      {
        h: "What you are buying",
        body: [
          "Purchases on this site grant a personal, non-transferable license to use the files for your own enjoyment and non-commercial projects.",
          "Commercial rights are sold separately on the licensing page. Nothing on the store page conveys commercial rights.",
        ],
      },
      {
        h: "What you may not do",
        body: [
          "Do not resell, redistribute, or re-upload the files, and do not train a model on them for redistribution. Sharing your download link publicly voids the license.",
        ],
      },
      {
        h: "Ownership",
        body: [
          "NakeKnight and all associated characters, artwork, audio, and lore remain the property of the creator. Human-curated and copyright-cleared.",
        ],
      },
      {
        h: "Liability",
        body: [
          "The files are provided as-is. Our total liability for any claim is limited to the amount you paid.",
        ],
      },
    ],
  },
  delivery: {
    title: "Delivery Policy — Instant Digital Download",
    meta:
      "How NakeKnight delivers digital files: instant secure download links, 72-hour window, five downloads per purchase.",
    path: "/delivery",
    heading: "DELIVERY POLICY",
    sections: [
      {
        h: "Instant, digital, no shipping",
        body: [
          "Everything on this site is a digital file. There is no shipping, no address collection, and no wait. The moment Stripe clears the payment you land on a confirmation page with your download links.",
        ],
      },
      {
        h: "Link lifetime",
        body: [
          "Download links are secure and time-limited. Your purchase page stays valid for 72 hours and allows up to five downloads, which is plenty for a laptop, a phone, and a backup.",
        ],
      },
      {
        h: "Lost your link?",
        body: [
          "Bookmark the confirmation URL — it is your access token. If you lose it, email hello@nakeknight.proton.me with your Stripe receipt and we reissue it manually, usually the same day.",
        ],
      },
      {
        h: "Audio and memberships",
        body: [
          "Chronicles episodes stream from the site rather than downloading. Membership access is checked live against Stripe.",
        ],
      },
    ],
  },
};

export default function Legal({ page }: { page: keyof typeof PAGES }) {
  const doc = PAGES[page];
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO title={doc.title} description={doc.meta} path={doc.path} />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-display tracking-[0.3em] text-xs text-primary mb-2">{PROMISE}</p>
        <h1 className="font-display text-5xl text-foreground mb-10">{doc.heading}</h1>
        <div className="space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-2xl text-foreground mb-2">{s.h}</h2>
              {s.body.map((p) => (
                <p key={p} className="text-muted-foreground mb-3 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          Questions: <a className="text-primary underline" href="mailto:hello@nakeknight.proton.me">hello@nakeknight.proton.me</a>
        </p>
      </div>
    </div>
  );
}
