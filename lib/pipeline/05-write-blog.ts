import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_TEXT_MODEL } from "../config";
import { buildBlogWritingPrompt } from "../prompts/blog-writing";
import type { TopicData } from "./02-topic";
import type { BlogJSON } from "../utils/html-template";

export interface BlogContent {
  blogJson: BlogJSON;
  blogTitle: string;
  blogSubtitle: string;
  wordCount: number;
}

export async function writeBlog(
  topic: TopicData,
  seasonalContext: string
): Promise<BlogContent> {
  console.log(`[Step 3] Writing blog: "${topic.title}"...`);

  const prompt = buildBlogWritingPrompt({
    title: topic.title,
    subtitle: topic.subtitle,
    category: topic.category,
    searchKeyword: topic.searchKeyword,
    hook: topic.hook,
    mainSections: topic.mainSections,
    currentYear: new Date().getFullYear(),
  });

  const { text } = await generateText({
    model: google(GEMINI_TEXT_MODEL),
    prompt,
  });

  // Parse JSON — strip markdown fences if LLM adds them despite instructions
  const cleanJson = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const blogJson: BlogJSON = JSON.parse(cleanJson);

  // Calculate word count from text content only
  const textParts = [
    blogJson.hero.description,
    ...blogJson.sections.map((s) => s.content),
    ...blogJson.faq.map((f) => `${f.question} ${f.answer}`),
  ];
  const wordCount = textParts.join(" ").split(/\s+/).length;

  const blogTitle = `${blogJson.hero.title} — ${blogJson.hero.subtitle}`;
  const blogSubtitle = topic.subtitle;

  console.log(`[Step 3] Blog written: ${wordCount} words, ${blogJson.sections.length} sections`);

  return { blogJson, blogTitle, blogSubtitle, wordCount };
}
