import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Download, Mail, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONTACT_EMAIL = "afterglow619@proton.me";
const SITE = "https://herodossier.lovable.app";

const boilerplate = `NakeKnight™ is an AI-native superhero IP. Site, art, lore, store, video, and operational dashboards are generated with AI tooling (Lovable + Claude + Gemini). The brand operates a live Stripe storefront, a verified Google Search Console property, and sitewide GA4 analytics. Every operational number published on herodossier.lovable.app is pulled live from Stripe, GSC, or GA4 — no simulated metrics.`;

const oneLiner = `NakeKnight™ — the AI-built superhero IP that proves "made by AI" can ship a real product, a real store, and real search traffic.`;

const facts = [
  { k: "Brand", v: "NakeKnight™ (The Peacemaker)" },
  { k: "Category", v: "AI-native entertainment IP" },
  { k: "Live storefront", v: "Stripe — 6 digital SKUs ($2.99–$14.99 USD)" },
  { k: "Search property", v: "Google Search Console verified (siteOwner)" },
  { k: "Analytics", v: "GA4 G-28DS4V8XRT, sitewide" },
  { k: "Site", v: SITE },
  { k: "Press contact", v: CONTACT_EMAIL },
];

const assets = [
  { name: "Brand logo / placeholder", path: "/placeholder.svg" },
  { name: "Sitemap (URLs)", path: "/sitemap.xml" },
  { name: "Robots", path: "/robots.txt" },
  { name: "Machine-readable site index", path: "/llms.txt" },
];

function CopyRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="p-5 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-sm tracking-wider text-muted-foreground">
          {label.toUpperCase()}
        </span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(`${label} copied`);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1 text-xs text-primary"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

export default function Press() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight™ Press Kit — Boilerplate, Facts & Assets"
        description="Press kit for NakeKnight™: AI-built superhero IP with a live Stripe store, verified search property and sitewide GA4. Boilerplate, fact sheet, and downloadable assets."
        path="/press"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "NakeKnight Press Kit",
          url: `${SITE}/press`,
          about: {
            "@type": "Organization",
            name: "NakeKnight",
            url: `${SITE}/`,
            email: CONTACT_EMAIL,
          },
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">PRESS KIT</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Bot className="w-3 h-3" /> AI-built IP
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
            NAKEKNIGHT™ PRESS KIT
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Everything an editor, podcaster or journalist needs to cover
            NakeKnight™ accurately. Boilerplate, fact sheet, downloadable
            assets, and a direct contact line.
          </p>
        </motion.div>

        {/* Copy-paste blocks */}
        <section className="grid md:grid-cols-2 gap-4 mb-12">
          <CopyRow label="One-liner" text={oneLiner} />
          <CopyRow label="Boilerplate (50 words)" text={boilerplate} />
        </section>

        {/* Fact sheet */}
        <section className="mb-12">
          <h2 className="font-display text-3xl text-foreground mb-6">FACT SHEET</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {facts.map((f) => (
                  <tr
                    key={f.k}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-4 py-3 text-muted-foreground font-display tracking-wider w-1/3">
                      {f.k.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-foreground">{f.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Assets */}
        <section className="mb-12">
          <h2 className="font-display text-3xl text-foreground mb-6">ASSETS</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {assets.map((a) => (
              <a
                key={a.path}
                href={a.path}
                target="_blank"
                rel="noreferrer"
                className="p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-display text-sm text-foreground tracking-wider">
                    {a.name.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{a.path}</div>
                </div>
                <Download className="w-4 h-4 text-primary" />
              </a>
            ))}
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
            PRESS CONTACT
          </h3>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Press%20inquiry%20%E2%80%94%20NakeKnight%E2%84%A2`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-display text-sm tracking-wider rounded-sm hover:opacity-90"
          >
            {CONTACT_EMAIL}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
