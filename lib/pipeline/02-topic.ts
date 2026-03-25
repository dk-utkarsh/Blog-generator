import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_TEXT_MODEL } from "../config";
import { getNextBlogNumber, saveBlog } from "../db/queries";
import { buildTopicSuggestionPrompt } from "../prompts/topic-suggestion";
import type { ResearchData } from "./01-research";

export interface TopicData {
  blogId: number;
  blogNumber: number;
  title: string;
  subtitle: string;
  category: string;
  contentType: string;
  keywords: string[];
  searchKeyword: string;
  hook: string;
  mainSections: string[];
  infographic: { title: string };
}

export async function generateTopic(research: ResearchData): Promise<TopicData> {
  console.log("[Step 2] Generating topic...");

  const nextBlogNumber = await getNextBlogNumber();

  const last5 = research.recentBlogs.slice(0, 5);
  const forbiddenCategories = last5.map((b) => b.category).filter(Boolean) as string[];

  const categoryCount: Record<string, number> = {};
  research.recentBlogs.forEach((b) => {
    if (b.category) categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
  });
  const overusedCategories = Object.keys(categoryCount).filter((c) => categoryCount[c] >= 2);

  const lastContentType = research.recentBlogs[0]?.contentType || "";

  const recentBlogsList = last5
    .map((b) => `#${b.blogNumber}: ${b.category} - ${b.contentType} - "${b.title}"`)
    .join("\n");

  const prompt = buildTopicSuggestionPrompt({
    nextBlogNumber,
    seasonalContext: research.seasonalContext,
    trends: research.trends,
    forbiddenCategories,
    overusedCategories,
    lastContentType,
    recentBlogsList,
  });

  const { text } = await generateText({
    model: google(GEMINI_TEXT_MODEL),
    prompt,
  });

  const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const topic = JSON.parse(cleanJson);

  if (!topic.title || !topic.category || !Array.isArray(topic.mainSections) || topic.mainSections.length === 0) {
    throw new Error(`LLM returned invalid topic structure: missing title, category, or mainSections`);
  }

  const blog = await saveBlog({
    blogNumber: nextBlogNumber,
    title: topic.title,
    subtitle: topic.subtitle,
    category: topic.category,
    contentType: topic.contentType,
    keywords: topic.keywords,
    searchKeyword: topic.searchKeyword,
    status: "generating",
  });

  console.log(`[Step 2] Topic: "${topic.title}" (Blog #${nextBlogNumber})`);

  return {
    blogId: blog.id,
    blogNumber: nextBlogNumber,
    title: topic.title,
    subtitle: topic.subtitle,
    category: topic.category,
    contentType: topic.contentType,
    keywords: topic.keywords,
    searchKeyword: topic.searchKeyword,
    hook: topic.hook,
    mainSections: topic.mainSections,
    infographic: topic.infographic,
  };
}
