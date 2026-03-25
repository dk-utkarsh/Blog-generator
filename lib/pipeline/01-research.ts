import { getRecentBlogs } from "../db/queries";
import { getSeasonalContext } from "../utils/seasonal";
import { fetchDentalTrends } from "../scrapers/google-trends";
import type { blogs } from "../db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Blog = InferSelectModel<typeof blogs>;

export interface ResearchData {
  trends: string[];
  seasonalContext: string;
  seasonalMarketInsight: string;
  recentBlogs: Blog[];
}

export async function runResearch(): Promise<ResearchData> {
  console.log("[Step 1] Running research...");

  const [trends, recentBlogs] = await Promise.all([
    fetchDentalTrends(),
    getRecentBlogs(20),
  ]);

  const seasonal = getSeasonalContext();

  console.log(`[Step 1] Trends: ${trends.length}, Blogs: ${recentBlogs.length}, Season: ${seasonal.season}`);

  return {
    trends,
    seasonalContext: `${seasonal.season} — ${seasonal.context}`,
    seasonalMarketInsight: seasonal.marketInsight,
    recentBlogs,
  };
}
