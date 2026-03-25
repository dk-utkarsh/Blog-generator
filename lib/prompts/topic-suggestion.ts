import { DENTAL_CATEGORIES, CONTENT_TYPES, FORBIDDEN_PATTERNS } from "../config";

interface TopicPromptInput {
  nextBlogNumber: number;
  seasonalContext: string;
  trends: string[];
  forbiddenCategories: string[];
  overusedCategories: string[];
  lastContentType: string;
  recentBlogsList: string;
}

export function buildTopicSuggestionPrompt(input: TopicPromptInput): string {
  return `You are a dental content strategist for DentalKart.com, India's leading online dental marketplace.

Your job: Suggest ONE unique, high-value blog topic that will drive traffic and product sales.

CONTEXT:
- Blog number: #${input.nextBlogNumber}
- Current season: ${input.seasonalContext}
- Trending topics this week: ${input.trends.length > 0 ? input.trends.join("; ") : "No trends data available — use your knowledge of the Indian dental market"}

RESTRICTIONS (DO NOT use these):
- Forbidden categories (used in last 5 blogs): ${input.forbiddenCategories.join(", ") || "None"}
- Overused categories (2+ times overall): ${input.overusedCategories.join(", ") || "None"}
- Last content type used: ${input.lastContentType || "None"} — use a DIFFERENT type
- Forbidden topic combinations:
  ${FORBIDDEN_PATTERNS.map((p) => `- ${p}`).join("\n  ")}
- Recent blogs already written:
  ${input.recentBlogsList || "No previous blogs — this is the first one!"}

DENTAL PRODUCT CATEGORIES TO CHOOSE FROM:
${DENTAL_CATEGORIES.map((c) => `- ${c}`).join("\n")}

CONTENT TYPES TO ROTATE:
${CONTENT_TYPES.map((t) => `- ${t}`).join("\n")}

IMPORTANT:
- Choose a category NOT in the forbidden list
- Choose a content type DIFFERENT from the last one used
- Make the title specific, benefit-driven, and SEO-friendly
- The hook should be conversational, engaging, and India-specific
- Keywords should be search terms Indian dentists would actually use

OUTPUT (strict JSON, no markdown code blocks):
{
  "title": "SEO-friendly blog title",
  "subtitle": "Meta description, 150-160 characters",
  "category": "Category from the list above",
  "contentType": "Content type from the list above",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "searchKeyword": "main product search term for DentalKart",
  "hook": "Engaging opening paragraph (2-3 sentences, conversational, India-specific)",
  "mainSections": ["Section 1 title", "Section 2 title", "Section 3 title", "Section 4 title"],
  "infographic": { "title": "Infographic title for this topic" }
}`;
}
