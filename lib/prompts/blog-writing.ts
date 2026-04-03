import { getProductLinksForTopic } from "../config";

interface BlogPromptInput {
  title: string;
  subtitle: string;
  category: string;
  searchKeyword: string;
  hook: string;
  mainSections: string[];
  currentYear: number;
}

export function buildBlogWritingPrompt(input: BlogPromptInput): string {
  const productLinks = getProductLinksForTopic(input.title, input.category, input.searchKeyword);

  return `You are a dental content writer for DentalKart.com. Your output must be a single raw JSON object — no markdown, no code fences, no extra text.

===============================================================================
BLOG ASSIGNMENT
===============================================================================

Title: ${input.title}
Subtitle: ${input.subtitle}
Category: ${input.category}
Target Keyword: ${input.searchKeyword}
Hook: ${input.hook}
Year: ${input.currentYear}

Sections to cover (you must produce exactly ${input.mainSections.length} section objects):
${input.mainSections.map((section, i) => `${i + 1}. ${section}`).join("\n")}

===============================================================================
APPROVED PRODUCT LINKS — USE ONLY THESE EXACT URLs
===============================================================================

${productLinks}

CRITICAL: Never invent or modify a dentalkart.com URL. Every <a href="..."> in section content and every product card "url" field must be an exact URL from the list above. If a product is not in the list, mention it as plain text without a link.

===============================================================================
OUTPUT FORMAT
===============================================================================

Return ONE raw JSON object that exactly matches this structure (no extra keys, no missing keys):

{
  "hero": {
    "badge": "short badge label, e.g. 'Complete Guide ${input.currentYear}'",
    "title": "${input.title}",
    "subtitle": "${input.subtitle}",
    "description": "~30 words summarising the blog value",
    "stats": [
      { "num": "e.g. 95%", "label": "e.g. Success Rate" },
      { "num": "e.g. ₹800", "label": "e.g. Starting Price" },
      { "num": "e.g. 10+", "label": "e.g. Products Reviewed" }
    ]
  },
  "sections": [ /* exactly ${input.mainSections.length} section objects — see SECTION RULES */ ],
  "faq": [ /* 4-5 objects — see FAQ RULES */ ],
  "cta": {
    "title": "short CTA heading",
    "description": "1-2 sentence CTA body",
    "buttonText": "e.g. Shop Now",
    "url": "https://www.dentalkart.com/search?query=${encodeURIComponent(input.searchKeyword)}"
  }
}

===============================================================================
SECTION RULES
===============================================================================

Each section object:
{
  "id": "kebab-case-slug-matching-section-title",
  "title": "MAX 5 WORDS",
  "content": "100-150 words of prose. Embed 1-2 <a href='EXACT_URL_FROM_APPROVED_LIST'>anchor text</a> links naturally. Include specific numbers (costs in ₹, percentages, measurements) in every section.",
  "components": [ /* 0-2 component objects chosen from the 11 types below */ ]
}

- Produce exactly ${input.mainSections.length} sections, one for each assigned section topic.
- Section titles must be MAX 5 words.
- Distribute 4-6 component types across the entire blog (not every section needs a component).
- 8-10 total <a> product links across all section content fields combined.

===============================================================================
COMPONENT CATALOGUE — ALL 11 TYPES
===============================================================================

Pick 4-6 types total across the blog. Use each type's exact "type" string.

1. info-cards
{
  "type": "info-cards",
  "cards": [
    { "icon": "single emoji", "title": "short title", "subtitle": "short subtitle", "description": "1-2 sentence detail" }
  ]
}

2. pros-cons
{
  "type": "pros-cons",
  "optionA": {
    "title": "Option A name",
    "icon": "single emoji",
    "items": ["pro/con point", "..."],
    "watchOut": "optional caution note"
  },
  "optionB": {
    "title": "Option B name",
    "icon": "single emoji",
    "items": ["pro/con point", "..."],
    "watchOut": "optional caution note"
  }
}

3. comparison-table
{
  "type": "comparison-table",
  "headers": ["Feature", "Option A", "Option B"],
  "rows": [
    ["Row label", "plain string value", { "text": "Best value", "badge": "best" }]
  ],
  "footnote": "optional footnote string"
}
Note: each cell can be either a plain string OR an object { "text": "label", "badge": "best" | "value" | "premium" }.

4. product-cards
{
  "type": "product-cards",
  "products": [
    {
      "tag": "Best Seller",
      "tagColor": "bestseller",
      "name": "Product Name",
      "brand": "Brand Name",
      "mrp": "₹1,200",
      "price": "₹950",
      "discount": "20% off",
      "rating": 4.5,
      "ratingText": "4.5/5",
      "features": ["feature 1", "feature 2", "feature 3"],
      "specs": [
        { "label": "Size", "value": "10 ml" }
      ],
      "bestFor": "short use-case",
      "url": "EXACT_URL_FROM_APPROVED_LIST"
    }
  ]
}
Note: tagColor must be one of: "bestseller" | "premium" | "budget" | "editors" | "advanced".
Note: specs is optional. url must be an exact URL from the approved list above.

5. checklist
{
  "type": "checklist",
  "title": "Checklist Title",
  "items": [
    { "text": "checklist item", "detail": "1-sentence explanation" }
  ]
}

6. decision-matrix
{
  "type": "decision-matrix",
  "title": "Decision Matrix Title",
  "rows": [
    { "if": "condition/scenario", "then": "recommended action or product" }
  ]
}

7. tip-box
{
  "type": "tip-box",
  "title": "Tip Title",
  "content": "Tip body — practical advice with a specific number or measurement."
}

8. warning-box
{
  "type": "warning-box",
  "title": "Warning Title",
  "content": "Warning body — what to avoid and why, with a specific consequence."
}

9. timeline
{
  "type": "timeline",
  "items": [
    { "title": "Step or phase title", "description": "1-2 sentence detail" }
  ]
}

10. step-cards
{
  "type": "step-cards",
  "cards": [
    { "title": "Step title", "description": "1-2 sentence instruction with a specific number." }
  ]
}

11. feature-bars
{
  "type": "feature-bars",
  "title": "Feature Bars Title",
  "bars": [
    { "label": "feature name", "value": 8, "color": "#4f46e5" }
  ]
}
Note: "value" is an integer 1-10. "color" is a hex color string.

===============================================================================
FAQ RULES
===============================================================================

Produce 4-5 FAQ objects:
{ "question": "full question string?", "answer": "30-40 word answer with at least one specific number." }

===============================================================================
WRITING RULES
===============================================================================

WORD LIMIT: 900-1200 words of text content total (hero description + all section content + faq answers combined).

TONE: Simple and professional. A BDS student should understand everything. No jargon without explanation.

SEO: Use the keyword "${input.searchKeyword}" naturally 4-6 times across hero description, section content, and FAQ answers.

NUMBERS: Every section content must include at least one specific number — price in ₹, percentage, measurement, or duration.

LINKS: Embed 8-10 <a href="EXACT_URL"> tags across section content. Use approved URLs only. Repeat a URL if genuinely relevant in multiple sections.

PRODUCT CARDS URLs: Must be an exact URL from the approved list.

SECTION TITLES: MAX 5 words each.

FAQ COUNT: 4-5 items.

COMPONENT COUNT: Pick 4-6 distinct component types total across the blog.

===============================================================================
FINAL INSTRUCTION
===============================================================================

Output ONLY the raw JSON object. Do not wrap it in markdown code fences. Do not add any text before or after the JSON.`;
}
