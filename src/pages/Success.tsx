import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Loader2, AlertTriangle, ArrowRight, Headphones, Gift } from "lucide-react";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Fulfillment {
  paid: boolean;
  downloads: Array<{ label: string; url: string; file: string }>;
  premium_chronicles: boolean;
  customer_email: string | null;
  referral_code: string | null;
  error?: string;
}

const CASE_FILES_PRICE = "price_1TePGgQaKvygaDfu3DJTEJm4";
const PREMIUM_PRICE = "price_1TelQGQaKvygaDfuazPCyTBv";

const CASE_FILE = "case-files.zip";

export default function Success() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [data, setData] = useState<Fulfillment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (!sid) {
      setState("error");
      setErrorMsg("Missing session_id in URL.");
      return;
    }
    setSessionId(sid);

    (async () => {
      try {
        const { data: resp, error } = await supabase.functions.invoke("fulfill-purchase", {
          body: { session_id: sid },
        });
        if (error) throw new Error(error.message);
        if (resp?.error) throw new Error(resp.error);
        const d = resp as Fulfillment;
        setData(d);
        setState("ok");

        // Save premium chronicles grant
        if (d.premium_chronicles) {
          localStorage.setItem("nk_premium_session", sid);
        }

        // GA4 purchase event
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "purchase", {
            send_to: "G-28DS4V8XRT",
            transaction_id: sid,
            currency: "USD",
            referral_code: d.referral_code ?? undefined,
          });
        }
      } catch (e: any) {
        setState("error");
        setErrorMsg(e?.message || "Could not verify purchase.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Thank you — your NakeKnight purchase is ready"
        description="Your purchase has been verified. Download your files securely below."
        path="/success"
        noindex
      />
      <div className="max-w-2xl mx-auto px-6 py-20">
        {state === "loading" && (
          <div className="flex flex-col items-center text-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-display tracking-widest text-sm">VERIFYING PAYMENT…</p>
          </div>
        )}

        {state === "error" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
            <h1 className="font-display text-4xl mb-2">We couldn't verify the payment.</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <p className="text-sm text-muted-foreground">
              If you were charged, email <a className="text-primary underline" href="mailto:hello@nakeknight.proton.me">hello@nakeknight.proton.me</a> with your Stripe receipt and we'll send your files manually.
            </p>
          </motion.div>
        )}

        {state === "ok" && data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <CheckCircle2 className="w-12 h-12 text-primary mb-5" />
            <p className="text-primary font-display tracking-[0.3em] text-xs mb-2">PURCHASE CONFIRMED</p>
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-tight">
              WELCOME TO THE INNER CIRCLE.
            </h1>
            <p className="text-muted-foreground mb-10 max-w-lg">
              {data.customer_email ? <>A receipt was sent to <span className="text-foreground">{data.customer_email}</span>. </> : null}
              Your download links below are short-lived (15 minutes) — save your files now.
            </p>

            {data.downloads.length > 0 && (
              <div className="space-y-3 mb-10">
                <h2 className="font-display text-xs tracking-widest text-muted-foreground">YOUR DOWNLOADS</h2>
                {data.downloads.map((d) => (
                  <div
                    key={d.file}
                    className="flex items-center justify-between gap-4 p-5 bg-card border border-primary/30 rounded-lg shadow-[0_0_40px_-25px_hsl(var(--primary))]"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-lg text-foreground truncate">{d.label}</p>
                      <p className="text-[11px] text-muted-foreground">{d.file}</p>
                    </div>
                    {d.url ? (
                      <a
                        href={d.url}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
                      >
                        <Download className="w-4 h-4" /> DOWNLOAD
                      </a>
                    ) : (
                      <span className="text-xs text-destructive">File missing — contact support.</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.premium_chronicles && (
              <div className="p-6 bg-card/60 border border-border rounded-lg mb-10">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-primary" />
                  <p className="font-display tracking-widest text-xs text-primary">PREMIUM CHRONICLES UNLOCKED</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Lifetime access to every premium-only episode is now active on this browser. Keep this URL bookmarked as your unlock token, or paste the session ID into the Chronicles page on another device.
                </p>
                <Link
                  to="/chronicles"
                  className="inline-flex items-center gap-2 text-primary font-display tracking-widest text-sm hover:underline"
                >
                  GO TO CHRONICLES <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {data.downloads.length === 0 && !data.premium_chronicles && (
              <p className="text-muted-foreground text-sm">
                Payment received — but no automatic fulfillment is configured for these items. We'll be in touch shortly.
              </p>
            )}

            {/* Upsell logic */}
            {(() => {
              const boughtCaseFiles = data.downloads.some((d) => d.file === CASE_FILE);
              const boughtPremium = data.premium_chronicles;
              const startUpsell = async (items: Array<{ price: string; quantity: number }>) => {
                const ref = data.referral_code || (typeof window !== "undefined" ? localStorage.getItem("nk_ref") : null);
                const { data: resp, error } = await supabase.functions.invoke("create-payment", {
                  body: { items, referral: ref, source: "success_upsell" },
                });
                if (error || !resp?.url) {
                  toast.error(error?.message || "Could not open checkout");
                  return;
                }
                window.location.href = resp.url;
              };
              if (boughtCaseFiles && !boughtPremium) {
                return (
                  <div className="mt-4 p-5 bg-card/70 border border-primary/40 rounded-lg">
                    <p className="font-display tracking-widest text-xs text-primary mb-1">UPGRADE TO LIFETIME</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add <span className="text-foreground">Premium Chronicles</span> — lifetime access to every premium
                      episode — for $29.
                    </p>
                    <button
                      onClick={() => startUpsell([{ price: PREMIUM_PRICE, quantity: 1 }])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
                    >
                      UNLOCK LIFETIME — $29
                    </button>
                  </div>
                );
              }
              if (boughtPremium && !boughtCaseFiles) {
                return (
                  <div className="mt-4 p-5 bg-card/70 border border-primary/40 rounded-lg">
                    <p className="font-display tracking-widest text-xs text-primary mb-1">COMPLETE THE ARSENAL</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add the <span className="text-foreground">Case Files + AI Prompts</span> download — $15.
                    </p>
                    <button
                      onClick={() => startUpsell([{ price: CASE_FILES_PRICE, quantity: 1 }])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
                    >
                      ADD CASE FILES — $15
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            <div className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-primary" />
                <p className="font-display tracking-widest text-xs text-primary">SHARE FOR BONUS LORE</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Post your receipt + share NakeKnight with one friend and we'll send you an exclusive backstory file.
              </p>
              <ShareButtons
                url="/chronicles"
                text="Just unlocked NAKEKNIGHT CHRONICLES — a serialized audio drama built entirely with AI 🎙️"
                refCode={data.referral_code || sessionId.slice(-8)}
                compact
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/chronicles"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
              >
                CONTINUE TO CHRONICLES <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-display tracking-widest text-sm rounded-sm hover:border-primary/40"
              >
                BROWSE MORE DROPS
              </Link>
            </div>

            <details className="mt-12 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Session reference</summary>
              <p className="mt-2 font-mono break-all">{sessionId}</p>
              {data.referral_code && <p className="mt-1">Referral: <span className="text-primary">{data.referral_code}</span></p>}
            </details>
          </motion.div>
        )}
      </div>
    </div>
  );
}
