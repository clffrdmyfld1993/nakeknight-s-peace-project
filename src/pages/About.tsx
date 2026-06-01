import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Bot, ShieldCheck, Sparkles, Code2, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "afterglow619@proton.me";

const verifiableFacts = [
  {
    label: "Live storefront",
    value: "Stripe Checkout, 6 SKUs",
    href: "/store",
    internal: true,
  },
  {
    label: "Search Console",
    value: "Verified (siteOwner)",
    href: "/analytics",
    internal: true,
  },
  {
    label: "Index coverage",
    value: "Tracked live via GSC URL Inspection",
    href: "/coverage",
    internal: true,
  },
  {
    label: "Analytics",
    value: "GA4 G-28DS4V8XRT, sitewide",
    href: "/command",
    internal: true,
  },
  {
    label: "Sitemap",
    value: "sitemap.xml submitted & accepted",
    href: "/sitemap.xml",
    internal: false,
  },
  {
    label: "Robots",
    value: "robots.txt published",
    href: "/robots.txt",
    internal: false,
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "LIVE DATA ONLY",
    body:
      "Revenue, payment counts, search clicks, impressions and index status are pulled live from Stripe, Google Search Console and GA4. No simulated numbers, ever.",
  },
  {
    icon: Bot,
    title: "BUILT ENTIRELY BY AI",
    body:
      "Site, art, lore, store, edge functions, and operational dashboards generated and iterated through Lovable + Claude with human direction.",
  },
  {
    icon: Code2,
    title: "TRANSPARENT STACK",
    body:
      "Frontend: React + Vite + Tailwind. Backend: Lovable Cloud (Supabase Edge Functions). Payments: Stripe. Search: GSC. Analytics: GA4.",
  },
  {
    icon: Sparkles,
    title: "AI-NATIVE IP",
    body:
      "NakeKnight™ is original IP designed to be adapted across mediums (publishing, gaming, film) using AI production pipelines.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="About NakeKnight™ — AI-Native IP, Live Data, Verified Build"
        description="NakeKnight is an AI-built entertainment IP with a live Stripe store, verified Google Search Console property, and sitewide GA4. Built transparently — no simulated metrics."
        path="/about"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About NakeKnight",
            url: "https://herodossier.lovable.app/about",
            mainEntity: {
              "@type": "Organization",
              name: "NakeKnight",
              alternateName: "NakeKnight™",
              url: "https://herodossier.lovable.app/",
              email: CONTACT_EMAIL,
              description:
                "AI-native superhero IP with a live storefront, verified search property, and transparent build process.",
              sameAs: [
                "https://tiktok.com/@nakeknight",
                "https://instagram.com/nakeknight",
                "https://x.com/NakeKnightIP",
                "https://youtube.com/@nakeknight",
              ],
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is NakeKnight really built by AI?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. Code, art, lore, video, and edge functions are generated with AI tooling (Lovable + Claude + Gemini image/video). Human direction guides product, story and licensing decisions.",
                },
              },
              {
                "@type": "Question",
                name: "Are the numbers on this site real?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. Revenue and payment counts are pulled live from Stripe. Search clicks, impressions and indexing status are pulled live from Google Search Console. GA4 (G-28DS4V8XRT) is installed sitewide. No simulated metrics are displayed.",
                },
              },
              {
                "@type": "Question",
                name: "How do I license the IP?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Visit the Licensing portal at /license for merchandise, publishing, gaming and film tiers, or email " +
                    CONTACT_EMAIL +
                    ".",
                },
              },
            ],
          },
        ]}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-primary font-display tracking-[0.3em] mb-2">ABOUT</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
            BUILT ENTIRELY BY AI. SHOWN ENTIRELY IN LIVE DATA.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            NakeKnight™ is an AI-native superhero IP. The site, the store, the
            lore, the art, the dashboards — all generated and iterated with
            AI. Every operational number you see is pulled from a verified
            live source (Stripe, Google Search Console, GA4) at request time.
          </p>
        </motion.div>

        {/* Principles — E-E-A-T */}
        <section className="grid md:grid-cols-2 gap-4 mb-16">
          {principles.map((p) => (
            <div
              key={p.title}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <p.icon className="w-6 h-6 text-primary mb-3" />
              <h2 className="font-display text-xl text-foreground mb-2">
                {p.title}
              </h2>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </section>

        {/* Verifiable facts */}
        <section className="mb-16">
          <h2 className="font-display text-3xl text-foreground mb-6">
            VERIFIABLE FACTS
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {verifiableFacts.map((f) => (
                  <tr
                    key={f.label}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-4 py-3 text-muted-foreground font-display tracking-wider w-1/3">
                      {f.label.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-foreground">{f.value}</td>
                    <td className="px-4 py-3 text-right">
                      {f.internal ? (
                        <Link
                          to={f.href}
                          className="inline-flex items-center gap-1 text-primary text-xs"
                        >
                          OPEN <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a
                          href={f.href}
                          className="inline-flex items-center gap-1 text-primary text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          OPEN <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 bg-card border border-primary/20 rounded-lg text-center"
        >
          <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-2xl text-foreground mb-2">
            DIRECT CONTACT
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Licensing, press, partnerships, or simply curious about the build.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=NakeKnight%20inquiry`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-display text-sm tracking-wider rounded-sm hover:opacity-90"
          >
            {CONTACT_EMAIL}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
