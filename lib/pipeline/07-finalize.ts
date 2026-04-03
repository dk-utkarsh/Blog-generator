import { renderBlogHTML } from "../utils/html-template";
import { saveResearchSource } from "../db/queries";
import { db } from "../db/client";
import { blogs } from "../db/schema";
import { eq } from "drizzle-orm";
import type { BlogContent } from "./05-write-blog";
import type { TopicData } from "./02-topic";
import type { ResearchData } from "./01-research";

interface FinalizeInput {
  blogContent: BlogContent;
  topic: TopicData;
  research: ResearchData;
}

export async function finalize(
  input: FinalizeInput
): Promise<{ blogId: number; title: string }> {
  console.log("[Step 5] Finalizing blog...");

  const { blogContent, topic, research } = input;

  const fullHtml = renderBlogHTML(blogContent.blogJson, blogContent.blogSubtitle);

  await db
    .update(blogs)
    .set({
      markdownContent: JSON.stringify(blogContent.blogJson, null, 2),
      htmlContent: fullHtml,
      wordCount: blogContent.wordCount,
      status: "generated",
    })
    .where(eq(blogs.id, topic.blogId));

  // Save research sources — non-critical, wrapped in try/catch
  try {
    if (research.trends && research.trends.length > 0) {
      await saveResearchSource({
        blogId: topic.blogId,
        sourceType: "pubmed_research",
        rawData: { trends: research.trends },
      });
    }

    await saveResearchSource({
      blogId: topic.blogId,
      sourceType: "seasonal",
      rawData: { context: research.seasonalContext },
    });
  } catch (err) {
    console.error("[Step 5] Research source save failed (non-critical):", err);
  }

  console.log(
    `[Step 5] Blog #${topic.blogNumber} finalized: "${topic.title}"`
  );

  return { blogId: topic.blogId, title: topic.title };
}
