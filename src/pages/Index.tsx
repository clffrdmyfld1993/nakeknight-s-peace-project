import PeacemakerHero from "@/components/PeacemakerHero";
import HeroProfile from "@/components/HeroProfile";
import OfferLadder from "@/components/OfferLadder";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";


const Index = () => (
  <>
    <SEO
      title="NakeKnight's Peace Project — Serialized Audio Drama | HeroDossier"
      description="Immerse in The Peacemaker's story. Weekly serialized audio episodes, case files, and exclusive content. Free starters + $29 lifetime premium access."
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "PodcastSeries",
        name: "NakeKnight Chronicles",
        url: "https://herodossier.lovable.app/chronicles",
        description:
          "Serialized audio drama following NakeKnight — an empathic mediator navigating a staged reality.",
        author: { "@type": "Organization", name: "NakeKnight" },
      }}
    />
    <PeacemakerHero />
    <OfferLadder source="home" />
    <section className="max-w-3xl mx-auto px-6 pb-16">
      <p className="font-display tracking-[0.3em] text-xs text-primary mb-2">NOT READY TO BUY?</p>
      <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
        LISTEN TO EPISODE 01 — NO EMAIL, NO SIGNUP
      </h2>
      <p className="text-muted-foreground mb-6">
        Free episodes stream straight from the archive. Nothing to hand over, nothing to unsubscribe
        from. Come back Fridays for the next drop.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/chronicles"
          className="font-display tracking-[0.2em] text-sm px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          PLAY EPISODE 01
        </Link>
        <Link
          to="/store"
          className="font-display tracking-[0.2em] text-sm px-6 py-3 border border-border text-foreground hover:border-primary transition-colors"
        >
          SEE THE ARCHIVE
        </Link>
      </div>
    </section>

    <HeroProfile />

  </>
);

export default Index;
