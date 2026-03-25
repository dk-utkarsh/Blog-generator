export interface DentalKartProduct {
  id: string;
  name: string;
  sku: string;
  url: string;
}

export async function scrapeDentalKartProducts(
  searchKeyword: string
): Promise<DentalKartProduct[]> {
  const query = searchKeyword.replace(/\s+/g, "+");
  const url = `https://www.dentalkart.com/search?query=${query}&page=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error(`DentalKart scraping failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseProducts(html);
  } catch (error) {
    console.error("DentalKart scraping error:", error);
    return [];
  }
}

function parseProducts(html: string): DentalKartProduct[] {
  const productPattern =
    /\\"product_id\\":\\"(\d+)\\",\\"name\\":\\"([^"]+)\\",\\"sku\\":\\"([^"]+)\\"/g;

  const products: DentalKartProduct[] = [];
  let match;

  while ((match = productPattern.exec(html)) !== null) {
    const id = match[1];
    const name = match[2]
      .replace(/\\\\/g, "")
      .replace(/\\"/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    const sku = match[3];

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    products.push({
      id,
      name,
      sku,
      url: `https://www.dentalkart.com/${slug}.html?type=p&id=${id}`,
    });
  }

  const unique = new Map(products.map((p) => [p.id, p]));
  return Array.from(unique.values());
}
