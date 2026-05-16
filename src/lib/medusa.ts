// Medusa Storefront API client
// Replace with your hosted Medusa URL when ready
const MEDUSA_URL = import.meta.env.VITE_MEDUSA_URL || "";

export interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  priceFormatted: string;
  category: string;
  badge?: string;
  /** Live Stripe price ID — used by the create-payment edge function. */
  stripePriceId?: string;
}

// Mock products used until Medusa is connected
export const mockProducts: Product[] = [
  {
    id: "prod_001",
    title: "The Iron Pact — Digital Comic #1",
    description: "The full illustrated story of NakeKnight's first case. 48 pages of AI-generated artwork and hand-crafted narrative.",
    thumbnail: "/placeholder.svg",
    price: 4.99,
    priceFormatted: "$4.99",
    category: "Comics",
    badge: "BESTSELLER",
    stripePriceId: "price_1TXekBQaKvygaDfuD0wRtBXy",
  },
  {
    id: "prod_002",
    title: "Hero Dossier Art Pack",
    description: "20 high-resolution AI-generated character portraits, environments, and concept art from the NakeKnight universe.",
    thumbnail: "/placeholder.svg",
    price: 9.99,
    priceFormatted: "$9.99",
    category: "Art Packs",
    stripePriceId: "price_1TXekpQaKvygaDfuVAcK9WYr",
  },
  {
    id: "prod_003",
    title: "Complete Lore Collection",
    description: "Every case file, origin story, and world-building document in one premium PDF bundle.",
    thumbnail: "/placeholder.svg",
    price: 14.99,
    priceFormatted: "$14.99",
    category: "Lore",
    badge: "PREMIUM",
  },
  {
    id: "prod_004",
    title: "NakeKnight Wallpaper Pack",
    description: "12 stunning wallpapers for desktop and mobile. 4K resolution, AI-generated artwork.",
    thumbnail: "/placeholder.svg",
    price: 2.99,
    priceFormatted: "$2.99",
    category: "Wallpapers",
  },
  {
    id: "prod_005",
    title: "The Ashen Accord — Digital Comic #3",
    description: "Five tribes, one oasis, and one man standing between blood and peace. 52 pages.",
    thumbnail: "/placeholder.svg",
    price: 4.99,
    priceFormatted: "$4.99",
    category: "Comics",
  },
  {
    id: "prod_006",
    title: "Soundtrack: Voices of Resolution",
    description: "AI-composed ambient soundtrack inspired by NakeKnight's mediation sessions. 12 tracks.",
    thumbnail: "/placeholder.svg",
    price: 7.99,
    priceFormatted: "$7.99",
    category: "Audio",
    badge: "NEW",
  },
];

export async function fetchProducts(): Promise<Product[]> {
  if (!MEDUSA_URL) return mockProducts;

  try {
    const res = await fetch(`${MEDUSA_URL}/store/products`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.products.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail,
      price: p.variants?.[0]?.prices?.[0]?.amount / 100 || 0,
      priceFormatted: `$${(p.variants?.[0]?.prices?.[0]?.amount / 100 || 0).toFixed(2)}`,
      category: p.collection?.title || "General",
    }));
  } catch {
    return mockProducts;
  }
}
