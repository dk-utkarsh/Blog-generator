interface TrendResult {
  title: string;
  snippet: string;
}

export async function fetchDentalTrends(): Promise<string[]> {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) {
    console.log("No SERPAPI_KEY — skipping trends fetch");
    return [];
  }

  try {
    const queries = [
      "dental equipment trends India 2026",
      "latest dental products India",
    ];

    const results: string[] = [];

    for (const query of queries) {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&location=India&hl=en&gl=in&api_key=${serpApiKey}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const organic: TrendResult[] = data.organic_results || [];

      for (const result of organic.slice(0, 3)) {
        if (result.title) results.push(result.title);
        if (result.snippet) results.push(result.snippet);
      }
    }

    return results.slice(0, 10);
  } catch (error) {
    console.error("Trends fetch failed (non-fatal):", error);
    return [];
  }
}
