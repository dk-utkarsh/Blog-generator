import { scrapeDentalKartProducts } from "../scrapers/dentalkart";
import { CATEGORY_KEYWORD_MAP } from "../config";
import type { DentalKartProduct } from "../scrapers/dentalkart";

export function extractSearchKeyword(title: string, defaultKeyword: string): string {
  const lower = title.toLowerCase();

  for (const [key, value] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  const words = lower
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .filter(
      (w) =>
        !["guide", "complete", "step", "best", "top", "how", "what", "when", "where", "why"].includes(w)
    );

  return words.slice(0, 2).join(" ") || defaultKeyword;
}

export async function scrapeProducts(
  searchKeyword: string
): Promise<DentalKartProduct[]> {
  console.log(`[Step 3] Scraping DentalKart for: "${searchKeyword}"...`);

  const products = await scrapeDentalKartProducts(searchKeyword);

  console.log(`[Step 3] Found ${products.length} products`);
  return products;
}
