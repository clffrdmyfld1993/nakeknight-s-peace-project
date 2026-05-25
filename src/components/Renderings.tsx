import { motion } from "framer-motion";
import rainRooftop from "@/assets/renderings/rain-rooftop.png";
import pressConference from "@/assets/renderings/press-conference.png";
import wastelandWalk from "@/assets/renderings/wasteland-walk.png";
import neonRooftop from "@/assets/renderings/neon-rooftop.png";

const renderings = [
  {
    src: neonRooftop,
    title: "NEON VIGIL",
    caption: "Rain-soaked rooftop. The city below holds its breath.",
    tag: "PORTRAIT // 01",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: rainRooftop,
    title: "THE NEGOTIATOR'S WALK",
    caption: "Steel canteen. No weapon. Always the harder ask.",
    tag: "PORTRAIT // 02",
    span: "md:col-span-1",
  },
  {
    src: wastelandWalk,
    title: "ASHES OF REDMARSH",
    caption: "Returning from a ceasefire that held.",
    tag: "FIELD // 03",
    span: "md:col-span-1",
  },
  {
    src: pressConference,
    title: "PRESS CONFERENCE — REDACTED",
    caption: "Operation Nightwatch. Cameras flash. He stays silent.",
    tag: "ARCHIVE // 04",
    span: "md:col-span-2",
  },
];

export default function Renderings() {
  return (
    <section id="renderings" className="border-y border-border bg-card/20">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-primary font-display tracking-[0.3em] mb-3">DOSSIER</p>
          <h2 className="font-display text-5xl text-foreground mb-4">RENDERINGS</h2>
          <p className="text-muted-foreground">
            Official illustrated dossier of NakeKnight in the field — between accords, after sieges,
            and the rare moments the press gets close.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[280px] gap-4">
          {renderings.map((r, i) => (
            <motion.figure
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-lg border border-border bg-card ${r.span}`}
            >
              <img
                src={r.src}
                alt={`${r.title} — ${r.caption}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-primary font-display text-xs tracking-[0.3em] mb-1">{r.tag}</p>
                <h3 className="font-display text-2xl text-foreground leading-tight">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{r.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
