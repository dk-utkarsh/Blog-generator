export type BrandTier = "budget" | "mid-range" | "premium";

const BRAND_TIERS: Record<string, string[]> = {
  budget: ["waldent", "oro", "d-dent", "dentis", "unident", "sun", "phos"],
  "mid-range": ["woodpecker", "denext", "runyes", "fomos"],
  premium: ["nsk", "ems", "dentsply", "sirona", "3m", "ivoclar", "kavo"],
};

export function classifyBrand(productName: string): BrandTier {
  const name = productName.toLowerCase();
  for (const [tier, brands] of Object.entries(BRAND_TIERS)) {
    if (brands.some((b) => name.includes(b))) {
      return tier as BrandTier;
    }
  }
  return "mid-range";
}

export interface EnrichedProduct {
  name: string;
  brand: string;
  positioning: BrandTier;
  url: string;
  sku?: string;
  keyFeature: string;
}

export function enrichProducts(
  products: { name: string; url: string; sku?: string }[],
  searchKeyword: string
): EnrichedProduct[] {
  return products.map((p) => {
    const brand = p.name.split(" ")[0];
    return {
      name: p.name,
      brand,
      positioning: classifyBrand(p.name),
      url: p.url,
      sku: p.sku,
      keyFeature: `Professional ${searchKeyword} from ${brand}`,
    };
  });
}

export function selectBalancedProducts(
  products: EnrichedProduct[],
  count = 5
): EnrichedProduct[] {
  const budget = products.filter((p) => p.positioning === "budget").slice(0, 2);
  const mid = products.filter((p) => p.positioning === "mid-range").slice(0, 2);
  const premium = products.filter((p) => p.positioning === "premium").slice(0, 1);

  let selected = [...budget, ...mid, ...premium];
  if (selected.length < 3) {
    selected = products.slice(0, count);
  }
  return selected.slice(0, count);
}
