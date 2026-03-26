export interface DentalKartProduct {
  id: string;
  name: string;
  sku: string;
  url: string;
  price?: string;
}

/**
 * Scrape DentalKart search results by parsing the RSC flight data.
 * DentalKart is a Next.js app — product data is embedded in the
 * server-rendered RSC payload as escaped JSON.
 */
export async function scrapeDentalKartProducts(
  searchKeyword: string
): Promise<DentalKartProduct[]> {
  const query = encodeURIComponent(searchKeyword);
  const url = `https://www.dentalkart.com/search?query=${query}&page=1`;

  try {
    console.log(`[Scraper] Fetching DentalKart: "${searchKeyword}"...`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(`[Scraper] DentalKart returned ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseProductsFromRSC(html);
  } catch (error) {
    console.error("[Scraper] DentalKart error:", error);
    return [];
  }
}

function parseProductsFromRSC(html: string): DentalKartProduct[] {
  // Extract product data from escaped JSON in RSC flight payload
  const nameRegex = /\\"name\\":\\"([^\\]*?)\\"/g;
  const urlRegex = /\\"url_key\\":\\"([^\\]*?)\\"/g;
  const priceRegex = /\\"selling_price\\":([0-9.]+)/g;

  const rawNames = [...html.matchAll(nameRegex)].map((m) => m[1]);
  const urls = [...html.matchAll(urlRegex)].map((m) => m[1]);
  const prices = [...html.matchAll(priceRegex)].map((m) => m[1]);

  // Filter out non-product names (meta tags etc.)
  const skipNames = new Set([
    "viewport", "description", "robots", "theme-color",
    "next-size-adjust", "google-adsense-account",
  ]);

  const products: DentalKartProduct[] = [];
  let urlIdx = 0;
  let priceIdx = 0;

  for (const name of rawNames) {
    if (skipNames.has(name) || name.length < 5 || name.length > 300) continue;

    const productUrl = urls[urlIdx] || "";
    const price = prices[priceIdx] || "";
    urlIdx++;
    priceIdx++;

    const fullUrl = productUrl.startsWith("http")
      ? productUrl
      : `https://www.dentalkart.com/${productUrl.startsWith("p/") ? productUrl : productUrl}.html`;

    products.push({
      id: String(products.length + 1),
      name: name.trim(),
      sku: "",
      url: fullUrl,
      price: price ? `₹${price}` : "",
    });
  }

  // Deduplicate by name
  const unique = new Map(products.map((p) => [p.name, p]));
  return Array.from(unique.values());
}
