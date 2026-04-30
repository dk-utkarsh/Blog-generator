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

  // Run with a generous output budget; Gemini 2.5 Pro supports up to 65k.
  // Truncated responses are the #1 cause of "Unterminated string" parse fails.
  const generate = (max: number) =>
    generateText({
      model: google(GEMINI_TEXT_MODEL),
      prompt,
      maxOutputTokens: max,
      providerOptions: { google: { structuredOutputs: true } },
    });

  let text = (await generate(32768)).text;

  const stripFences = (s: string) =>
    s.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let blogJson: BlogJSON;
  try {
    blogJson = JSON.parse(stripFences(text));
  } catch (err) {
    console.warn(
      `[Step 3] JSON parse failed (${(err as Error).message}); raw length=${text.length}, retrying with larger budget`
    );
    text = (await generate(65536)).text;
    blogJson = JSON.parse(stripFences(text));
  }

  // Strip main keyword from entire blog (AI sometimes ignores the ban)
  // Remove keyword-highlight links containing the main keyword
  const kwEscaped = topic.searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kwLinkPattern = new RegExp(
    `<a[^>]*class=["']keyword-highlight["'][^>]*>[^<]*?${kwEscaped}[^<]*?</a>`,
    "gi"
  );
  const stripKwLinks = (text: string) => text.replace(kwLinkPattern, (match) => {
    const textMatch = match.match(/>([^<]*)</);
    return textMatch ? textMatch[1] : "";
  });

  // Strip from hero description
  blogJson.hero.description = stripKwLinks(blogJson.hero.description);

  // Strip from all section content
  for (const section of blogJson.sections) {
    section.content = stripKwLinks(section.content);
  }

  // Strip from FAQ answers
  for (const faq of blogJson.faq) {
    faq.answer = stripKwLinks(faq.answer);
  }

  // Deduplicate keyword highlights — each keyword linked only once in entire blog
  const seenKeywords = new Set<string>();
  const dedupeKeywords = (html: string) => {
    return html.replace(/<a[^>]*class=["']keyword-highlight["'][^>]*>([^<]*)<\/a>/gi, (match, text) => {
      const key = text.trim().toLowerCase();
      if (seenKeywords.has(key)) {
        return text; // Return plain text, no link
      }
      seenKeywords.add(key);
      return match; // Keep the first occurrence
    });
  };

  blogJson.hero.description = dedupeKeywords(blogJson.hero.description);
  for (const section of blogJson.sections) {
    section.content = dedupeKeywords(section.content);
  }
  for (const faq of blogJson.faq) {
    faq.answer = dedupeKeywords(faq.answer);
  }

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
