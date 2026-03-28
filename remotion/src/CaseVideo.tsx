import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: bebasNeue } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["300", "400", "600"], subsets: ["latin"] });

interface CaseProps {
  codename: string;
  title: string;
  caseId: string;
  threat: string;
  summary: string;
  quote: string;
  quoteSpeaker: string;
  resolutionTitle: string;
  stats: { value: string; label: string }[];
  closingQuote: string;
  imagePath: string;
}

const TitleScene: React.FC<{ codename: string; title: string; caseId: string; imagePath: string }> = ({ codename, title, caseId, imagePath }) => {
  const frame = useCurrentFrame();
  const bgScale = interpolate(frame, [0, 120], [1.1, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [15, 50], [80, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subtitleOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lineWidth = interpolate(frame, [40, 80], [0, 400], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const caseIdOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const lines = codename.split(" ");
  const top = lines.length > 2 ? lines.slice(0, -1).join(" ") : lines[0] || "";
  const bottom = lines.length > 2 ? lines[lines.length - 1] : lines[1] || "";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, opacity: 0.35 }}>
        <Img src={staticFile(imagePath)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(13,9,6,0.8) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 0%, rgba(180,100,20,0.08) 50%, rgba(13,9,6,0.9) 100%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: bebasNeue, fontSize: 28, letterSpacing: "0.4em", color: "#d4934a", opacity: caseIdOpacity, marginBottom: 20 }}>
            CASE FILE {caseId}
          </div>
          <div style={{ fontFamily: bebasNeue, fontSize: 130, color: "#f0e6d8", lineHeight: 0.9, transform: `translateY(${titleY}px)`, opacity: titleOpacity }}>
            {top}<br />{bottom}
          </div>
          <div style={{ width: lineWidth, height: 2, background: "linear-gradient(90deg, transparent, #d4934a, transparent)", margin: "30px auto", opacity: subtitleOpacity }} />
          <div style={{ fontFamily: inter, fontSize: 22, fontWeight: 300, color: "#8a7a6a", opacity: subtitleOpacity, letterSpacing: "0.15em" }}>
            {title.toUpperCase()}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BriefingScene: React.FC<{ summary: string; threat: string }> = ({ summary, threat }) => {
  const frame = useCurrentFrame();
  const labelOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const textOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: "clamp" });
  const threatOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const driftY = Math.sin(frame * 0.02) * 3;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(180,100,20,0.06) 0%, transparent 60%)" }} />
      <AbsoluteFill style={{ padding: "120px 200px", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${driftY}px)` }}>
          <div style={{ fontFamily: bebasNeue, fontSize: 20, letterSpacing: "0.4em", color: "#d4934a", opacity: labelOpacity, marginBottom: 30 }}>
            SITUATION BRIEFING
          </div>
          <div style={{ fontFamily: inter, fontSize: 36, fontWeight: 300, color: "#f0e6d8", lineHeight: 1.5, opacity: textOpacity, transform: `translateY(${textY}px)`, maxWidth: 1200 }}>
            {summary}
          </div>
          <div style={{ marginTop: 50, opacity: threatOpacity }}>
            <div style={{ fontFamily: bebasNeue, fontSize: 18, letterSpacing: "0.3em", padding: "8px 24px", backgroundColor: "rgba(212,147,74,0.15)", border: "1px solid rgba(212,147,74,0.3)", color: "#d4934a", display: "inline-block" }}>
              THREAT LEVEL: {threat}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const QuoteScene: React.FC<{ quote: string; speaker: string; imagePath: string }> = ({ quote, speaker, imagePath }) => {
  const frame = useCurrentFrame();
  const heroScale = interpolate(frame, [0, 120], [1.15, 1.0], { extrapolateRight: "clamp" });
  const heroOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const quoteOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  const quoteY = interpolate(frame, [40, 65], [40, 0], { extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <div style={{ position: "absolute", right: -50, top: -50, bottom: -50, width: "55%", opacity: heroOpacity, transform: `scale(${heroScale})` }}>
        <Img src={staticFile("images/nakeknight.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #0d0906 0%, transparent 40%, transparent 80%, rgba(13,9,6,0.5) 100%)" }} />
      </div>
      <AbsoluteFill style={{ padding: "0 120px", justifyContent: "center" }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ fontFamily: inter, fontSize: 38, fontWeight: 300, fontStyle: "italic", color: "#f0e6d8", lineHeight: 1.5, opacity: quoteOpacity, transform: `translateY(${quoteY}px)` }}>
            {quote}
          </div>
          <div style={{ fontFamily: bebasNeue, fontSize: 24, letterSpacing: "0.3em", color: "#d4934a", marginTop: 30, opacity: nameOpacity }}>
            — {speaker}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ResolutionScene: React.FC<{ resolutionTitle: string; stats: { value: string; label: string }[]; closingQuote: string }> = ({ resolutionTitle, stats, closingQuote }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const quoteOpacity = interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" });
  const driftY = Math.sin(frame * 0.015) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(180,100,20,0.08) 0%, transparent 60%)" }} />
      <AbsoluteFill style={{ padding: "100px 200px", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${driftY}px)` }}>
          <div style={{ fontFamily: bebasNeue, fontSize: 20, letterSpacing: "0.4em", color: "#d4934a", opacity: titleOpacity, marginBottom: 15 }}>RESOLUTION</div>
          <div style={{ fontFamily: bebasNeue, fontSize: 68, color: "#f0e6d8", opacity: titleOpacity, lineHeight: 0.9, marginBottom: 60 }}>
            {resolutionTitle}
          </div>
          <div style={{ display: "flex", gap: 80 }}>
            {stats.map((s, i) => {
              const o = interpolate(frame, [20 + i * 15, 40 + i * 15], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(frame, [20 + i * 15, 40 + i * 15], [30, 0], { extrapolateRight: "clamp" });
              return (
                <div key={s.label} style={{ opacity: o, transform: `translateY(${y}px)` }}>
                  <div style={{ fontFamily: bebasNeue, fontSize: 64, color: "#d4934a" }}>{s.value}</div>
                  <div style={{ fontFamily: bebasNeue, fontSize: 16, letterSpacing: "0.2em", color: "#8a7a6a" }}>{s.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 60, fontFamily: inter, fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "#8a7a6a", opacity: quoteOpacity, maxWidth: 700 }}>
            {closingQuote}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const nameOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const nameScale = interpolate(frame, [10, 40], [0.9, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [35, 60], [0, 300], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(180,100,20,0.05) 0%, transparent 60%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: bebasNeue, fontSize: 120, color: "#f0e6d8", opacity: nameOpacity, transform: `scale(${nameScale})`, letterSpacing: "0.1em" }}>NAKEKNIGHT</div>
          <div style={{ width: lineWidth, height: 2, background: "linear-gradient(90deg, transparent, #d4934a, transparent)", margin: "20px auto" }} />
          <div style={{ fontFamily: inter, fontSize: 22, fontWeight: 300, letterSpacing: "0.2em", color: "#8a7a6a", opacity: taglineOpacity }}>PEACE IS NOT THE ABSENCE OF CONFLICT</div>
          <div style={{ fontFamily: inter, fontSize: 22, fontWeight: 300, letterSpacing: "0.2em", color: "#d4934a", opacity: taglineOpacity, marginTop: 5 }}>IT'S THE PRESENCE OF JUSTICE</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CaseVideo: React.FC<CaseProps> = (props) => (
  <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={130}>
        <TitleScene codename={props.codename} title={props.title} caseId={props.caseId} imagePath={props.imagePath} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
      <TransitionSeries.Sequence durationInFrames={110}>
        <BriefingScene summary={props.summary} threat={props.threat} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: 20 })} />
      <TransitionSeries.Sequence durationInFrames={130}>
        <QuoteScene quote={props.quote} speaker={props.quoteSpeaker} imagePath={props.imagePath} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
      <TransitionSeries.Sequence durationInFrames={130}>
        <ResolutionScene resolutionTitle={props.resolutionTitle} stats={props.stats} closingQuote={props.closingQuote} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
      <TransitionSeries.Sequence durationInFrames={125}>
        <EndScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
