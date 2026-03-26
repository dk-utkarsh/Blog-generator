/**
 * Fetch dental topic ideas from multiple research sources:
 * 1. PubMed (NCBI E-utilities API) — recent dental research paper titles
 * 2. DentalAssociates.com — dental topic categories and headings
 *
 * Both sources use 8-second timeouts and graceful fallback on failure.
 * Returns an array of topic strings for AI context during topic generation.
 */
export async function fetchDentalTrends(): Promise<string[]> {
  const results: string[] = [];

  // Source 1: PubMed — free NCBI E-utilities API (no API key required)
  try {
    console.log("[Research] Fetching from PubMed...");

    const searchTerms = [
      "dental equipment clinical review",
      "dental practice technology",
      "dental sterilization best practices",
      "endodontics techniques 2024",
      "dental imaging advances",
      "dental implant procedures",
      "orthodontic treatment methods",
      "periodontal disease management",
      "dental curing light polymerization",
      "dental handpiece maintenance",
      "intraoral scanner accuracy",
      "dental autoclave sterilization cycle",
    ];

    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=5&sort=date&retmode=json`;

    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const ids: string[] = searchData.esearchresult?.idlist || [];

      if (ids.length > 0) {
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
        const summaryRes = await fetch(summaryUrl, {
          signal: AbortSignal.timeout(8000),
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const articles = summaryData.result || {};
          for (const id of ids) {
            if (articles[id]?.title) {
              results.push(articles[id].title);
            }
          }
        }
      }
    }

    console.log(`[Research] PubMed: ${results.length} topics found`);
  } catch (error) {
    console.log("[Research] PubMed unavailable (non-fatal) — continuing");
  }

  // Source 2: DentalAssociates.com topic headings
  try {
    console.log("[Research] Fetching from DentalAssociates.com...");
    const res = await fetch("https://www.dentalassociates.com/dental-topics", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const html = await res.text();

      // Extract topic titles from heading tags
      const headingMatches =
        html.match(/<h[23][^>]*>([^<]+)<\/h[23]>/gi) || [];
      for (const match of headingMatches) {
        const title = match.replace(/<[^>]+>/g, "").trim();
        if (title.length > 5 && title.length < 100) {
          results.push(title);
        }
      }

      // Extract link text containing dental terms
      const linkMatches =
        html.match(/<a[^>]*>([^<]*dental[^<]*)<\/a>/gi) || [];
      for (const match of linkMatches) {
        const text = match.replace(/<[^>]+>/g, "").trim();
        if (text.length > 5 && text.length < 100) {
          results.push(text);
        }
      }
    }

    console.log(
      `[Research] DentalAssociates: ${results.length} total topics collected`
    );
  } catch (error) {
    console.log(
      "[Research] DentalAssociates unavailable (non-fatal) — continuing"
    );
  }

  // Deduplicate and limit to 15 topics
  const unique = [...new Set(results)];
  console.log(`[Research] Total unique research topics: ${unique.length}`);
  return unique.slice(0, 15);
}
