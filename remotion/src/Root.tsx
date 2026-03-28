import { Composition } from "remotion";
import { CaseVideo } from "./CaseVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="case-video"
      component={CaseVideo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        codename: "THE IRON PACT",
        title: "Siege of Redmarsh",
        caseId: "NK-0041",
        threat: "CRITICAL",
        summary: "Two warlord factions locked in a blood feud over a freshwater source.",
        quote: '"You\'re both dying."',
        quoteSpeaker: "NAKEKNIGHT",
        resolutionTitle: "THE REDMARSH COMPACT",
        stats: [
          { value: "0", label: "CASUALTIES" },
          { value: "2,400", label: "POPULATION" },
          { value: "14", label: "MONTHS HOLDING" },
        ],
        closingQuote: '"You fight dirty." — "With facts."',
        imagePath: "images/iron-pact.jpg",
      }}
    />
  </>
);
