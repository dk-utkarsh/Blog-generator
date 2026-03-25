import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_TEXT_MODEL } from "../config";
import { buildBlogWritingPrompt } from "../prompts/blog-writing";
import type { TopicData } from "./02-topic";
import type { EnrichedProduct } from "../utils/brand-tiers";

export interface BlogContent {
  markdown: string;
  blogTitle: string;
  blogSubtitle: string;
  wordCount: number;
}

export async function writeBlog(
  topic: TopicData,
  products: EnrichedProduct[],
  seasonalContext: string
): Promise<BlogContent> {
  console.log(`[Step 5] Writing blog: "${topic.title}"...`);

  const prompt = buildBlogWritingPrompt({
    title: topic.title,
    subtitle: topic.subtitle,
    category: topic.category,
    searchKeyword: topic.searchKeyword,
    hook: topic.hook,
    mainSections: topic.mainSections,
    products,
    seasonalContext,
    currentYear: new Date().getFullYear(),
  });

  const { text } = await generateText({
    model: google(GEMINI_TEXT_MODEL),
    prompt,
  });

  const markdown = text.trim();

  const titleMatch = markdown.match(/^#\s+(.*)/m);
  const blogTitle = titleMatch ? titleMatch[1].trim() : topic.title;

  const metaMatch = markdown.match(/\*\*Meta Description:\*\*\s*(.*)/i);
  const blogSubtitle = metaMatch ? metaMatch[1].trim() : topic.subtitle;

  const wordCount = markdown.split(/\s+/).length;

  console.log(`[Step 5] Blog written: ${wordCount} words`);

  return { markdown, blogTitle, blogSubtitle, wordCount };
}
