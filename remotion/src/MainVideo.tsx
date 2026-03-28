import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: bebasNeue } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["300", "400", "600"], subsets: ["latin"] });

// Scene 1: Title card with dramatic reveal
const TitleScene = () => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, 120], [1.1, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [15, 50], [80, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subtitleOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lineWidth = interpolate(frame, [40, 80], [0, 400], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const caseIdOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const vignetteOpacity = interpolate(frame, [0, 30], [1, 0.6], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      {/* Background image with slow zoom */}
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, opacity: 0.35 }}>
        <Img src={staticFile("images/iron-pact.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* Dark vignette overlay */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(13,9,6,${vignetteOpacity}) 100%)`,
      }} />

      {/* Amber atmospheric glow */}
      <AbsoluteFill style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(180,100,20,0.08) 50%, rgba(13,9,6,0.9) 100%)",
      }} />

      {/* Content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: bebasNeue,
            fontSize: 28,
            letterSpacing: "0.4em",
            color: "#d4934a",
            opacity: caseIdOpacity,
            marginBottom: 20,
          }}>
            CASE FILE NK-0041
          </div>

          <div style={{
            fontFamily: bebasNeue,
            fontSize: 140,
            color: "#f0e6d8",
            lineHeight: 0.9,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}>
            THE IRON
            <br />
            PACT
          </div>

          <div style={{
            width: lineWidth,
            height: 2,
            background: "linear-gradient(90deg, transparent, #d4934a, transparent)",
            margin: "30px auto",
            opacity: subtitleOpacity,
          }} />

          <div style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 300,
            color: "#8a7a6a",
            opacity: subtitleOpacity,
            letterSpacing: "0.15em",
          }}>
            SIEGE OF REDMARSH
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: Situation briefing
const BriefingScene = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const text1Opacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const text1Y = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: "clamp" });
  const text2Opacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const text2Y = interpolate(frame, [40, 60], [30, 0], { extrapolateRight: "clamp" });
  const threatOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

  const driftY = Math.sin(frame * 0.02) * 3;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      {/* Subtle gradient bg */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 30% 50%, rgba(180,100,20,0.06) 0%, transparent 60%)",
      }} />

      <AbsoluteFill style={{ padding: "120px 200px", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${driftY}px)` }}>
          <div style={{
            fontFamily: bebasNeue,
            fontSize: 20,
            letterSpacing: "0.4em",
            color: "#d4934a",
            opacity: labelOpacity,
            marginBottom: 30,
          }}>
            SITUATION BRIEFING
          </div>

          <div style={{
            fontFamily: inter,
            fontSize: 36,
            fontWeight: 300,
            color: "#f0e6d8",
            lineHeight: 1.5,
            opacity: text1Opacity,
            transform: `translateY(${text1Y}px)`,
            marginBottom: 30,
            maxWidth: 1200,
          }}>
            Two warlord factions locked in a blood feud<br />
            over the last freshwater source in Redmarsh.
          </div>

          <div style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 300,
            color: "#8a7a6a",
            lineHeight: 1.5,
            opacity: text2Opacity,
            transform: `translateY(${text2Y}px)`,
            maxWidth: 1000,
          }}>
            Commander Voss. Warlord Kael.<br />
            3,000 lives caught in the crossfire.
          </div>

          <div style={{
            marginTop: 50,
            opacity: threatOpacity,
            display: "flex",
            gap: 20,
          }}>
            <div style={{
              fontFamily: bebasNeue,
              fontSize: 18,
              letterSpacing: "0.3em",
              padding: "8px 24px",
              backgroundColor: "rgba(212,147,74,0.15)",
              border: "1px solid rgba(212,147,74,0.3)",
              color: "#d4934a",
            }}>
              THREAT: CRITICAL
            </div>
            <div style={{
              fontFamily: bebasNeue,
              fontSize: 18,
              letterSpacing: "0.3em",
              padding: "8px 24px",
              backgroundColor: "rgba(240,230,216,0.05)",
              border: "1px solid rgba(240,230,216,0.15)",
              color: "#8a7a6a",
            }}>
              CASUALTIES PROJECTED: 800+
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3: NakeKnight arrives — dramatic image reveal
const ArrivalScene = () => {
  const frame = useCurrentFrame();

  const heroScale = interpolate(frame, [0, 120], [1.15, 1.0], { extrapolateRight: "clamp" });
  const heroOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const quoteOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  const quoteY = interpolate(frame, [40, 65], [40, 0], { extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      {/* Hero image */}
      <div style={{
        position: "absolute", right: -50, top: -50, bottom: -50,
        width: "55%",
        opacity: heroOpacity,
        transform: `scale(${heroScale})`,
      }}>
        <Img src={staticFile("images/nakeknight.png")} style={{
          width: "100%", height: "100%", objectFit: "cover",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #0d0906 0%, transparent 40%, transparent 80%, rgba(13,9,6,0.5) 100%)",
        }} />
      </div>

      {/* Quote text */}
      <AbsoluteFill style={{ padding: "0 120px", justifyContent: "center" }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{
            fontFamily: inter,
            fontSize: 40,
            fontWeight: 300,
            fontStyle: "italic",
            color: "#f0e6d8",
            lineHeight: 1.5,
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
          }}>
            "You're both dying. And neither of you has the sense to see
            you're holding each other's cure."
          </div>

          <div style={{
            fontFamily: bebasNeue,
            fontSize: 24,
            letterSpacing: "0.3em",
            color: "#d4934a",
            marginTop: 30,
            opacity: nameOpacity,
          }}>
            — NAKEKNIGHT
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: The Resolution
const ResolutionScene = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const stat1Opacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const stat2Opacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const stat3Opacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const quoteOpacity = interpolate(frame, [80, 105], [0, 1], { extrapolateRight: "clamp" });

  const stat1Y = interpolate(frame, [20, 40], [30, 0], { extrapolateRight: "clamp" });
  const stat2Y = interpolate(frame, [35, 55], [30, 0], { extrapolateRight: "clamp" });
  const stat3Y = interpolate(frame, [50, 70], [30, 0], { extrapolateRight: "clamp" });

  const driftY = Math.sin(frame * 0.015) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 70% 40%, rgba(180,100,20,0.08) 0%, transparent 60%)",
      }} />

      <AbsoluteFill style={{ padding: "100px 200px", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${driftY}px)` }}>
          <div style={{
            fontFamily: bebasNeue,
            fontSize: 20,
            letterSpacing: "0.4em",
            color: "#d4934a",
            opacity: titleOpacity,
            marginBottom: 15,
          }}>
            RESOLUTION
          </div>

          <div style={{
            fontFamily: bebasNeue,
            fontSize: 72,
            color: "#f0e6d8",
            opacity: titleOpacity,
            lineHeight: 0.9,
            marginBottom: 60,
          }}>
            THE REDMARSH<br />COMPACT
          </div>

          <div style={{ display: "flex", gap: 80 }}>
            {[
              { value: "0", label: "CASUALTIES", opacity: stat1Opacity, y: stat1Y },
              { value: "2,400", label: "POPULATION RECOVERED", opacity: stat2Opacity, y: stat2Y },
              { value: "14", label: "MONTHS HOLDING", opacity: stat3Opacity, y: stat3Y },
            ].map((stat) => (
              <div key={stat.label} style={{ opacity: stat.opacity, transform: `translateY(${stat.y}px)` }}>
                <div style={{ fontFamily: bebasNeue, fontSize: 64, color: "#d4934a" }}>{stat.value}</div>
                <div style={{ fontFamily: bebasNeue, fontSize: 16, letterSpacing: "0.2em", color: "#8a7a6a" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 70,
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 300,
            fontStyle: "italic",
            color: "#8a7a6a",
            opacity: quoteOpacity,
            maxWidth: 600,
          }}>
            "You fight dirty." — Warlord Kael
            <br />
            <span style={{ color: "#d4934a" }}>"With facts." — NakeKnight</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 5: End card
const EndScene = () => {
  const frame = useCurrentFrame();

  const nameOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const nameScale = interpolate(frame, [10, 40], [0.9, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [35, 60], [0, 300], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at center, rgba(180,100,20,0.05) 0%, transparent 60%)",
      }} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: bebasNeue,
            fontSize: 120,
            color: "#f0e6d8",
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
            letterSpacing: "0.1em",
          }}>
            NAKEKNIGHT
          </div>

          <div style={{
            width: lineWidth,
            height: 2,
            background: "linear-gradient(90deg, transparent, #d4934a, transparent)",
            margin: "20px auto",
          }} />

          <div style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: "#8a7a6a",
            opacity: taglineOpacity,
          }}>
            PEACE IS NOT THE ABSENCE OF CONFLICT
          </div>
          <div style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: "#d4934a",
            opacity: taglineOpacity,
            marginTop: 5,
          }}>
            IT'S THE PRESENCE OF JUSTICE
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Main composition
export const IronPactVideo = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <TitleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <BriefingScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <ArrivalScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <ResolutionScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={125}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
