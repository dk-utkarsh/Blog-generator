import { marked } from "marked";
import { wrapInHtmlTemplate } from "../utils/html-template";
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
  products: { name: string; url: string; brand: string; positioning: string }[];
  images: { url: string; caption: string; prompt: string }[];
  research: ResearchData;
}

export async function finalize(
  input: FinalizeInput
): Promise<{ blogId: number; title: string }> {
  console.log("[Step 7] Finalizing blog...");

  const { blogContent, topic, products, images, research } = input;

  const htmlBody = await marked(blogContent.markdown);

  const fullHtml = wrapInHtmlTemplate(
    htmlBody,
    blogContent.blogTitle,
    blogContent.blogSubtitle,
    images.map((img) => ({ url: img.url, caption: img.caption }))
  );

  await db
    .update(blogs)
    .set({
      markdownContent: blogContent.markdown,
      htmlContent: fullHtml,
      images: images.map((img) => ({
        url: img.url.startsWith("data:") ? "(embedded in HTML)" : img.url,
        caption: img.caption,
        prompt: img.prompt,
      })),
      productsUsed:
        products.length > 0
          ? products.map((p) => ({
              name: p.name,
              url: p.url,
              brand: p.brand,
              positioning: p.positioning,
            }))
          : [],
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
    console.error("[Step 7] Research source save failed (non-critical):", err);
  }

  console.log(
    `[Step 7] Blog #${topic.blogNumber} finalized: "${topic.title}"`
  );

  return { blogId: topic.blogId, title: topic.title };
}
