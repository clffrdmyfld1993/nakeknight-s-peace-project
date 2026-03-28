import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cases = [
  {
    outputFile: "nakeknight-iron-pact.mp4",
    props: {
      codename: "THE IRON PACT", title: "Siege of Redmarsh", caseId: "NK-0041", threat: "CRITICAL",
      summary: "Two warlord factions locked in a blood feud over the last freshwater source in Redmarsh. 3,000 lives caught in the crossfire.",
      quote: '"You\'re both dying. And neither of you has the sense to see you\'re holding each other\'s cure."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "THE REDMARSH COMPACT",
      stats: [{ value: "0", label: "CASUALTIES" }, { value: "2,400", label: "POPULATION" }, { value: "14", label: "MONTHS HOLDING" }],
      closingQuote: '"You fight dirty." — Warlord Kael\n"With facts." — NakeKnight',
      imagePath: "images/iron-pact.jpg",
    },
  },
  {
    outputFile: "nakeknight-neon-truce.mp4",
    props: {
      codename: "THE NEON TRUCE", title: "Corporate War: Helix vs. Obsidian", caseId: "NK-0067", threat: "SEVERE",
      summary: "Two megacorps on the brink of deploying private armies over AI licensing rights. Both manipulated by a shadow broker.",
      quote: '"You should have been a lawyer." — "Lawyers don\'t walk into kill zones."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "JOINT DEFENSE PACT",
      stats: [{ value: "0", label: "CASUALTIES" }, { value: "2", label: "CORPS UNITED" }, { value: "1", label: "ARCHITECT EXPOSED" }],
      closingQuote: "The shadow broker known as The Architect was dismantled within weeks.",
      imagePath: "images/case-neon-truce.jpg",
    },
  },
  {
    outputFile: "nakeknight-ashen-accord.mp4",
    props: {
      codename: "THE ASHEN ACCORD", title: "The Desert Tribes Unification", caseId: "NK-0089", threat: "EXTREME",
      summary: "Five nomadic tribes at war over a sacred oasis. Generations of blood debt. 12,000 displaced refugees.",
      quote: '"They deserved to be remembered by someone who wasn\'t trying to avenge them."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "THE OASIS COMPACT",
      stats: [{ value: "5", label: "TRIBES UNITED" }, { value: "112", label: "NAMES HONORED" }, { value: "12K", label: "LIVES SAVED" }],
      closingQuote: '"You memorized our dead." — Chief Raya of the Duskwalkers',
      imagePath: "images/case-ashen-accord.jpg",
    },
  },
  {
    outputFile: "nakeknight-pit-peace.mp4",
    props: {
      codename: "PIT PEACE", title: "The Underground Circuit Shutdown", caseId: "NK-0103", threat: "HIGH",
      summary: "An illegal gladiator ring using indebted fighters. Two champions — former friends — forced to fight to the death.",
      quote: '"This fight is over."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "LIBERATION",
      stats: [{ value: "47", label: "FIGHTERS FREED" }, { value: "0", label: "DEBTS REMAINING" }, { value: "1", label: "PIT CLOSED" }],
      closingQuote: "Talon and Reaver now run a community defense training program together.",
      imagePath: "images/case-pit-peace.jpg",
    },
  },
  {
    outputFile: "nakeknight-drowned-treaty.mp4",
    props: {
      codename: "THE DROWNED TREATY", title: "Battle of the Flooded Capital", caseId: "NK-0112", threat: "EXTREME",
      summary: "Two naval factions controlling opposite banks of a flooded megacity. Trade routes severed. 20,000 civilians starving.",
      quote: '"You can fight over a city that won\'t exist in a month. Or you can save it together."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "JOINT TRADE COMMISSION",
      stats: [{ value: "72h", label: "SUPPLY RESTORED" }, { value: "23", label: "DAYS TO REPAIR" }, { value: "20K", label: "CIVILIANS FED" }],
      closingQuote: "The breakwater holds. The Joint Trade Commission still operates.",
      imagePath: "images/case-drowned-treaty.jpg",
    },
  },
  {
    outputFile: "nakeknight-forge-accord.mp4",
    props: {
      codename: "THE FORGE ACCORD", title: "Factory Revolt at Ironside Works", caseId: "NK-0128", threat: "HIGH",
      summary: "400 factory workers taken hostage by their own security force in a dispute over ration distribution. Three-way standoff.",
      quote: '"You\'re not employees anymore. You\'re a community. So decide how a community shares."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "WORKER COOPERATIVE",
      stats: [{ value: "400", label: "WORKERS FREED" }, { value: "+30%", label: "PRODUCTION UP" }, { value: "1st", label: "COOPERATIVE" }],
      closingQuote: "The region's first worker-owned cooperative. Rations by need, not rank.",
      imagePath: "images/case-forge-accord.jpg",
    },
  },
  {
    outputFile: "nakeknight-highway-kings.mp4",
    props: {
      codename: "HIGHWAY KINGS", title: "The Interstate Ceasefire", caseId: "NK-0134", threat: "SEVERE",
      summary: "Two motorcycle gangs controlling rival sections of the last functioning highway. Trade caravans ambushed weekly.",
      quote: '"You\'re the most effective security force on this highway. Start charging for it instead of stealing."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "THE HIGHWAY COMPACT",
      stats: [{ value: "+400%", label: "TRADE VOLUME" }, { value: "0", label: "CARAVAN LOSSES" }, { value: "8", label: "MONTHS CLEAN" }],
      closingQuote: "Both gangs earn more from escorts than they ever did from ambushes.",
      imagePath: "images/case-highway-kings.jpg",
    },
  },
  {
    outputFile: "nakeknight-frost-line.mp4",
    props: {
      codename: "THE FROST LINE", title: "Northern Mountain War", caseId: "NK-0147", threat: "EXTREME",
      summary: "Two highland armies locked in a winter siege over a mountain fortress. The only pass south. 6,000 troops freezing to death.",
      quote: '"I\'m asking you to trust math. The numbers don\'t lie, even when generals do."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "FORT KARROS ACCORD",
      stats: [{ value: "200", label: "MONTHLY CARAVANS" }, { value: "0", label: "COMBAT DEATHS" }, { value: "50/50", label: "REVENUE SPLIT" }],
      closingQuote: '"I told him to trust my enemy. He said trust math." — General Petra Vane',
      imagePath: "images/case-frost-line.jpg",
    },
  },
  {
    outputFile: "nakeknight-mercy-ward.mp4",
    props: {
      codename: "MERCY WARD", title: "The Hospital Standoff", caseId: "NK-0155", threat: "CRITICAL",
      summary: "Armed faction seizes the last functioning hospital. 300 patients trapped. 12 children on life support.",
      quote: '"You\'re not a monster, Marsh. Monsters don\'t post guards to make sure the ventilators keep running."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "NEUTRAL GROUND",
      stats: [{ value: "300", label: "PATIENTS SAFE" }, { value: "+40%", label: "CAPACITY UP" }, { value: "0", label: "VENTILATORS LOST" }],
      closingQuote: "Saint Elara Hospital: permanently neutral ground. The ventilators never stopped.",
      imagePath: "images/case-mercy-ward.jpg",
    },
  },
  {
    outputFile: "nakeknight-last-haven.mp4",
    props: {
      codename: "LAST HAVEN", title: "The Bunker Summit", caseId: "NK-0168", threat: "EXTREME",
      summary: "Six faction leaders trapped in a bunker during a radiation storm. Three days to negotiate or tear each other apart.",
      quote: '"You\'ve all been playing a game none of you can win. Imagine what you could build with the 60% you spend fighting each other."',
      quoteSpeaker: "NAKEKNIGHT", resolutionTitle: "THE LAST HAVEN ACCORD",
      stats: [{ value: "6", label: "FACTIONS UNITED" }, { value: "-70%", label: "CONFLICTS DOWN" }, { value: "1st", label: "PEACE TREATY" }],
      closingQuote: '"Did you trap us in here on purpose?"\n"I scheduled a meeting. The weather was a coincidence."',
      imagePath: "images/case-last-haven.jpg",
    },
  },
];

async function main() {
  console.log("Bundling...");
  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, "../src/index.ts"),
    webpackOverride: (config) => config,
  });

  console.log("Opening browser...");
  const browser = await openBrowser("chrome", {
    browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
    chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
    chromeMode: "chrome-for-testing",
  });

  for (const c of cases) {
    console.log(`Rendering ${c.outputFile}...`);
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "case-video",
      inputProps: c.props,
      puppeteerInstance: browser,
    });

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: `/mnt/documents/${c.outputFile}`,
      puppeteerInstance: browser,
      muted: true,
      concurrency: 1,
    });
    console.log(`  ✓ ${c.outputFile}`);
  }

  await browser.close({ silent: false });
  console.log("All 10 videos rendered!");
}

main().catch(console.error);
