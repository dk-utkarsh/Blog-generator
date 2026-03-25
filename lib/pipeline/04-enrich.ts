import { enrichProducts, selectBalancedProducts, type EnrichedProduct } from "../utils/brand-tiers";
import type { DentalKartProduct } from "../scrapers/dentalkart";

export function enrichAndSelectProducts(
  products: DentalKartProduct[],
  searchKeyword: string
): EnrichedProduct[] {
  console.log(`[Step 4] Enriching ${products.length} products...`);

  const enriched = enrichProducts(
    products.map((p) => ({ name: p.name, url: p.url, sku: p.sku })),
    searchKeyword
  );

  const selected = selectBalancedProducts(enriched);

  console.log(
    `[Step 4] Selected ${selected.length} products: ${selected.map((p) => `${p.name} (${p.positioning})`).join(", ")}`
  );

  return selected;
}
