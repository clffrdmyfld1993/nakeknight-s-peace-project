import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gaEvent } from "@/lib/ga4";

export default function MilestoneOffer({ source = "episode" }: { source?: string }) {
  return (
    <section id="episode-offer" className="border-y border-border py-8 mt-6 scroll-mt-20">
      <p className="font-display text-xs text-primary mb-2">THE CASE FILES · FREE PREVIEW</p>
      <h2 className="font-display text-3xl text-foreground mb-3">Inside the Peacemaker’s dossier</h2>
      <p className="text-muted-foreground max-w-xl mb-5">
        Read the Iron Pact and explore the illustrated case narratives, conflicts and resolutions on this site.
        The downloadable archive is not available to buy while its contents and delivery are being checked.
      </p>
      <Button asChild className="h-auto min-h-11 whitespace-normal">
        <Link to="/#case-files" onClick={() => gaEvent("offer_click", { source, offer: "case_files_preview" })}>
          <FileText aria-hidden="true" /> Read the case files <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}