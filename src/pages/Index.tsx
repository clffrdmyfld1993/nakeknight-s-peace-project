import PeacemakerHero from "@/components/PeacemakerHero";
import HeroProfile from "@/components/HeroProfile";
import SEO from "@/components/SEO";

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
    <HeroProfile />
  </>
);

export default Index;
