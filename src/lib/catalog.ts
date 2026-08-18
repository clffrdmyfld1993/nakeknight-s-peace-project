// Live Stripe catalog — every price ID below exists on the connected Stripe account.
// Files for the new SKUs must be uploaded to the `digital-products` bucket before
// a buyer can download them; fulfillment maps price -> file in fulfill-purchase.

export interface Sku {
  sku: string;
  name: string;
  blurb: string;
  price: number;
  priceLabel: string;
  stripePriceId: string;
}

/** Entry / anchor single items. */
export const SINGLES = {
  loreTeaser: {
    sku: "NK-DIGI-LORE-001",
    name: "Lore Teaser",
    blurb: "5-page illustrated lore teaser PDF. Instant download.",
    price: 3.99,
    priceLabel: "$3.99",
    stripePriceId: "price_1U5eo6QaKvygaDfuCBN6PlqJ",
  },
  brickBuild: {
    sku: "NK-DIGI-BLD-001",
    name: "Brick Build PDF",
    blurb: "Build instruction PDF + parts CSV + Stud.io file.",
    price: 5.99,
    priceLabel: "$5.99",
    stripePriceId: "price_1U5eoLQaKvygaDfu89rdjnui",
  },
  dossierPack: {
    sku: "NK-DIGI-DOSSIER-001",
    name: "Dossier Pack",
    blurb: "Full case dossier, art plates and prompt log.",
    price: 14.99,
    priceLabel: "$14.99",
    stripePriceId: "price_1U5eoYQaKvygaDfuPca90sP8",
  },
} as const satisfies Record<string, Sku>;

/** The 3-tier bundle ladder shown on /store. */
export const TIERS = [
  {
    key: "single",
    sku: "NK-DIGI-BLD-001",
    name: "Single Shot",
    price: 5.99,
    priceLabel: "$5.99",
    stripePriceId: SINGLES.brickBuild.stripePriceId,
    badge: null as string | null,
    includes: ["Brick Build PDF", "Parts CSV", "Stud.io source file"],
    valueLabel: null as string | null,
    saveLabel: null as string | null,
  },
  {
    key: "creator",
    sku: "NK-BUNDLE-CREATOR-002",
    name: "Creator Pack",
    price: 15.99,
    priceLabel: "$15.99",
    stripePriceId: "price_1U5eoiQaKvygaDfuws5sOcem",
    badge: "MOST WANTED",
    includes: [
      "Everything in Single Shot",
      "Lore PDF",
      "4K Render Pack (5 images)",
    ],
    valueLabel: "$28.97",
    saveLabel: "SAVE 45%",
  },
  {
    key: "complete",
    sku: "NK-BUNDLE-COMPLETE-003",
    name: "Complete Dossier",
    price: 24.99,
    priceLabel: "$24.99",
    stripePriceId: "price_1U5eowQaKvygaDfuPNTkVJPw",
    badge: "MOST VALUE",
    includes: [
      "Everything in Creator Pack",
      "Variant covers",
      "Prompt log",
      "Timelapse build video",
    ],
    valueLabel: "$47.94",
    saveLabel: "SAVE 48%",
  },
] as const;

export type Tier = (typeof TIERS)[number];

/** Order bump attached to any one-time checkout. */
export const ORDER_BUMP = {
  sku: "NK-DIGI-LORE-002",
  name: "Lore Expansion + Variant Colorways",
  blurb: "Expanded lore chapter plus the full variant colorway sheets.",
  price: 7,
  priceLabel: "$7",
  stripePriceId: "price_1U5ep8QaKvygaDfuZmol7l9w",
} as const;

/** Productized licensing tiers on /license. */
export const LICENSE_TIERS = [
  {
    key: "creator",
    sku: "NK-LIC-CREATOR-250",
    name: "Creator",
    price: 250,
    priceLabel: "$250",
    stripePriceId: "price_1U5eqeQaKvygaDfu2mLCyBcM",
    terms: [
      "Non-exclusive",
      "1 product or game",
      "10,000 print run",
      "1-year term",
      "Credit required",
      "North America",
    ],
  },
  {
    key: "indie",
    sku: "NK-LIC-INDIE-1000",
    name: "Indie",
    price: 1000,
    priceLabel: "$1,000",
    stripePriceId: "price_1U5erGQaKvygaDfu7J3i4MlT",
    terms: [
      "Exclusive by industry",
      "3-year term",
      "50,000 units, 1 title",
      "Worldwide",
      "Includes lore pack",
    ],
  },
  {
    key: "brand",
    sku: "NK-LIC-BRAND-5000",
    name: "Brand",
    price: 5000,
    priceLabel: "$5,000",
    stripePriceId: "price_1U5erZQaKvygaDfuBkX5vTII",
    terms: [
      "Exclusive across all channels",
      "5-year term",
      "Unlimited units",
      "Custom pose",
      "Brand colorways",
    ],
  },
] as const;

export type LicenseTier = (typeof LICENSE_TIERS)[number];

/** Every price the ladder can send to checkout, for GA4 item naming. */
export const PRICE_NAMES: Record<string, { sku: string; name: string; price: number }> = {
  [SINGLES.loreTeaser.stripePriceId]: SINGLES.loreTeaser,
  [SINGLES.brickBuild.stripePriceId]: SINGLES.brickBuild,
  [SINGLES.dossierPack.stripePriceId]: SINGLES.dossierPack,
  [TIERS[1].stripePriceId]: TIERS[1],
  [TIERS[2].stripePriceId]: TIERS[2],
  [ORDER_BUMP.stripePriceId]: ORDER_BUMP,
  ...Object.fromEntries(LICENSE_TIERS.map((t) => [t.stripePriceId, t])),
};
