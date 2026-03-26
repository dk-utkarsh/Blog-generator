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
  return `You are a clinical dental content strategist. Your task is to suggest ONE unique, professionally focused blog topic for an Indian dental audience.

CRITICAL RULES:
1. NEVER repeat a topic already written — check the "Previous blogs" list below with extreme care
2. NEVER reuse the same category + content type combination that appears in the list
3. NEVER generate a title with similar wording, angle, or subject matter to any previous blog
4. Every topic must be ENTIRELY UNIQUE in subject, clinical angle, and category
5. Content must be EVERGREEN — useful year-round with no time-bound references
6. ABSOLUTELY FORBIDDEN in title or content angle: "FY-end", "Tax", "March 31", "Financial Year", "Investment", "Deadline", "Budget Season", "Diwali", "Festival", "New Year", "Seasonal", "Quarter-end"

CONTEXT:
- Blog number: #${input.nextBlogNumber}
- Recent dental research topics: ${input.trends.length > 0 ? input.trends.join("; ") : "No external research data available — rely on clinical dental knowledge for the Indian market"}

RESTRICTIONS:
- Forbidden categories (used in last 5 blogs): ${input.forbiddenCategories.join(", ") || "None"}
- Overused categories (2+ blogs overall): ${input.overusedCategories.join(", ") || "None"}
- Last content type used: ${input.lastContentType || "None"} — select a DIFFERENT type
- Forbidden topic combinations:
  ${FORBIDDEN_PATTERNS.map((p) => `- ${p}`).join("\n  ")}
- Previous blogs (DO NOT repeat any of these):
  ${input.recentBlogsList || "No previous blogs — this is the first one."}

DENTAL EQUIPMENT CATEGORIES:
${DENTAL_CATEGORIES.map((c) => `- ${c}`).join("\n")}

CONTENT TYPES (rotate through these):
${CONTENT_TYPES.map((t) => `- ${t}`).join("\n")}

TOPIC FOCUS AREAS (choose from these clinical angles):
- Clinical techniques and procedural best practices
- Equipment selection criteria and evaluation parameters
- Troubleshooting common equipment issues in Indian practice settings
- Preventive maintenance protocols and schedules
- Comparative analysis of equipment types or techniques
- Infection control and sterilization workflows
- Ergonomic considerations for dental practitioners
- Equipment calibration and quality assurance
- Integration of new technology into existing workflows
- Cost-of-ownership analysis and operational efficiency

REQUIREMENTS:
- Select a category NOT in the forbidden list
- Select a content type DIFFERENT from the last one used
- Title must be specific, clinically focused, and SEO-friendly
- The hook must be professional and directly relevant to Indian dental practitioners
- Keywords must reflect actual search terms used by Indian dentists
- All 4 main sections must remain focused on the chosen category — no deviation to unrelated subjects

OUTPUT (strict JSON, no markdown code blocks):
{
  "title": "SEO-friendly, clinically focused blog title",
  "subtitle": "Meta description, 150-160 characters, keyword-rich",
  "category": "One category from the list above",
  "contentType": "One content type from the list above",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "searchKeyword": "Primary product/equipment search term for DentalKart",
  "hook": "Professional opening paragraph (2-3 sentences, formal tone, India-specific clinical context)",
  "mainSections": ["Section 1 title", "Section 2 title", "Section 3 title", "Section 4 title"],
  "infographic": { "title": "Concise infographic title for this topic" }
}`;
}
