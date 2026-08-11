// Single source of truth for the money ladder.
// Every price ID below is a live Stripe price on this account.

export const OFFERS = {
  /** Order bump — attached at checkout, never sold alone in the ladder. */
  bump: {
    id: "bump_wallpapers",
    name: "NakeKnight Wallpaper Pack",
    blurb: "12 4K wallpapers — desktop + mobile.",
    price: 2.99,
    priceLabel: "$2.99",
    stripePriceId: "price_1TXeo8QaKvygaDfuLrhyzP8Q",
  },
  /** Entry offer. */
  caseFiles: {
    id: "case_files",
    name: "Complete Case Files & AI Prompts",
    blurb: "Every case file, the lore bible, and the full AI prompt library.",
    price: 15,
    priceLabel: "$15",
    stripePriceId: "price_1TePGgQaKvygaDfu3DJTEJm4",
  },
  /** Lifetime audio. */
  premium: {
    id: "premium_lifetime",
    name: "Premium Chronicles — Lifetime",
    blurb: "Every premium episode, past and future. One payment.",
    price: 29,
    priceLabel: "$29",
    stripePriceId: "price_1TelQGQaKvygaDfuazPCyTBv",
  },
  /** Recurring lane. */
  membership: {
    id: "membership_monthly",
    name: "Chronicles Membership",
    blurb: "Weekly premium episodes, full back catalog, member-only case files.",
    price: 7,
    priceLabel: "$7/mo",
    stripePriceId: "price_1U3A0ZQaKvygaDfuvR8SnhrO",
    recurring: true as const,
  },
  /** Flagship anchor. */
  founders: {
    id: "founders_archive",
    name: "Founder's Archive",
    blurb:
      "The entire vault — every comic, art pack, soundtrack, case file, prompt library, lifetime premium audio, plus one custom case file written into the canon for you.",
    price: 99,
    priceLabel: "$99",
    stripePriceId: "price_1U3A0KQaKvygaDfu5P6Asi4z",
  },
} as const;

export type OfferKey = keyof typeof OFFERS;
