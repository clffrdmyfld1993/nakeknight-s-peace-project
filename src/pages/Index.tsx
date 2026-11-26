import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const practices = [
  {
    number: "01",
    title: "Listen without judgment",
    text: "Make room for what each person is experiencing before deciding what the conflict means.",
  },
  {
    number: "02",
    title: "Translate the conflict",
    text: "Turn crossed wires and competing needs into clear, human language.",
  },
  {
    number: "03",
    title: "Choose a next step",
    text: "Find a reasonable action people can actually take, together or apart.",
  },
];

const Index = () => (
  <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <SEO
      title="NakeKnight | The Workplace Peacemaker"
      description="A superhero for the weekday grind. NakeKnight turns everyday conflict into respectful, practical next steps."
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NakeKnight",
        alternateName: "The Workplace Peacemaker",
        url: "https://nakeknight.sonickurrent.space/",
        description:
          "An LGBTQIA+ affirming superhero universe about practical, nonviolent communication and finding a path through everyday conflict.",
      }}
    />

    <section className="relative isolate border-b border-border">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_35%,hsl(var(--primary)/0.18),transparent_44%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--background))_58%,hsl(var(--primary)/0.08))]"
      />
      <div
        aria-hidden="true"
        className="absolute right-[-10rem] top-12 -z-10 h-[28rem] w-[28rem] rounded-full border border-primary/15 shadow-[0_0_0_3rem_hsl(var(--primary)/0.035),0_0_0_7rem_hsl(var(--primary)/0.025)]"
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-32 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pb-28 md:pt-40">
        <div className="max-w-3xl">
          <p className="mb-5 font-display text-xs tracking-[0.32em] text-primary">
            A SUPERHERO FOR THE WEEKDAY GRIND
          </p>
          <h1 className="font-display text-5xl leading-[0.96] tracking-tight md:text-7xl">
            Conflict can change direction.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            NakeKnight helps people slow down everyday conflict, hear what matters,
            and turn it into a reasonable next step—so work does not take the whole
            week from you.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/about"
              className="rounded-sm bg-primary px-6 py-3 font-display text-sm tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              MEET NAKEKNIGHT
            </Link>
            <Link
              to="/chronicles"
              className="rounded-sm border border-border px-6 py-3 font-display text-sm tracking-widest text-foreground transition-colors hover:border-primary"
            >
              EXPLORE THE STORIES
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            LGBTQIA+ affirming. Built around empathy, dignity, and nonviolent communication.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-primary/25 bg-card/70 p-7 shadow-[0_24px_90px_-45px_hsl(var(--primary)/0.7)] backdrop-blur">
            <p className="font-display text-xs tracking-[0.28em] text-primary">
              EVERY TIMELINE, SAME HERO
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight">
              The era changes.
              <br />
              The face stays.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              NakeKnight can choose where and when he arrives. His look adapts to
              the world he enters—from medieval leather to a neon future—while his
              identity remains unmistakably his.
            </p>
            <div className="mt-7 flex items-center gap-2" aria-label="A timeline from past to future">
              <span className="h-2 w-2 rounded-full bg-primary/50" />
              <span className="h-px flex-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_hsl(var(--primary))]" />
              <span className="h-px flex-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <span className="h-2 w-2 rounded-full bg-primary/50" />
            </div>
            <p className="mt-3 flex justify-between font-display text-[10px] tracking-[0.2em] text-muted-foreground">
              <span>PAST</span><span>NOW</span><span>FUTURE</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <div className="max-w-2xl">
        <p className="font-display text-xs tracking-[0.3em] text-primary">THE PEACEMAKER METHOD</p>
        <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          From stuck to specific.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          NakeKnight does not win by overpowering people. He helps them understand
          the problem clearly enough to choose what happens next.
        </p>
      </div>
      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {practices.map((practice) => (
          <li key={practice.number} className="rounded-xl border border-border bg-card/60 p-6">
            <span className="font-display text-sm tracking-[0.2em] text-primary">{practice.number}</span>
            <h3 className="mt-4 font-display text-2xl">{practice.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{practice.text}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="border-t border-border bg-card/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-primary">A UNIVERSE WITH ROOM FOR EVERYONE</p>
          <h2 className="mt-2 font-display text-3xl">More understanding. More weekend.</h2>
        </div>
        <Link
          to="/universe"
          className="w-fit border-b border-primary pb-1 font-display text-sm tracking-widest text-primary hover:opacity-80"
        >
          EXPLORE THE UNIVERSE
        </Link>
      </div>
    </section>
  </main>
);

export default Index;
