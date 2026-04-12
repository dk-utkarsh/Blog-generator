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
    "title": "Simple main heading (MAX 6 WORDS, e.g. 'Dental 3D Printing Resin Guide')",
    "subtitle": "Simple tagline (MAX 5 WORDS, e.g. 'Selecting the Right Material')",
    "description": "2-3 simple sentences (30-40 words) introducing the topic. Do NOT include the main keyword — it is already in the title. Just write a clean intro.",
    "stats": []
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
  "content": "Structure: 3-4 lines of intro text, then a bullet list (<ul><li>...</li></ul>) of 4-6 SHORT points (each point = 8-12 words max, NO bold headings inside bullets, just plain short sentences). Total ~150-180 words per section. Embed 1-2 <a href='EXACT_URL_FROM_APPROVED_LIST'>anchor text</a> links in the intro text.",
  "components": [ /* 1-2 component objects chosen from the 12 types below — EVERY section MUST have at least 1 */ ]
}

- Produce exactly ${input.mainSections.length} sections, one for each assigned section topic.
- Section titles must be MAX 5 words.
- EVERY section MUST have at least 1 component (diagram, infographic, table, cards, etc.). No section should be text-only.
- Use "infographic" type in at least 2-3 sections for visual SVG diagrams.
- 8-10 total <a> product links across all section content fields combined.

===============================================================================
COMPONENT CATALOGUE — ALL 12 TYPES
===============================================================================

IMPORTANT: EVERY section MUST have at least 1 component. Use a variety of visual types across the blog. The "infographic" type is PREFERRED — use it in at least 2-3 sections.
Pick 5-7 types total across the blog. Use each type's exact "type" string.

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

4. checklist
{
  "type": "checklist",
  "title": "Checklist Title",
  "items": [
    { "text": "checklist item", "detail": "1-sentence explanation" }
  ]
}

5. decision-matrix
{
  "type": "decision-matrix",
  "title": "Decision Matrix Title",
  "rows": [
    { "if": "condition/scenario", "then": "recommended action or product" }
  ]
}

6. tip-box
{
  "type": "tip-box",
  "title": "Tip Title",
  "content": "Tip body — practical advice with a specific number or measurement."
}

7. warning-box
{
  "type": "warning-box",
  "title": "Warning Title",
  "content": "Warning body — what to avoid and why, with a specific consequence."
}

8. timeline
{
  "type": "timeline",
  "items": [
    { "title": "Step or phase title", "description": "1-2 sentence detail" }
  ]
}

9. step-cards
{
  "type": "step-cards",
  "cards": [
    { "title": "Step title", "description": "1-2 sentence instruction with a specific number." }
  ]
}

10. feature-bars
{
  "type": "feature-bars",
  "title": "Feature Bars Title",
  "bars": [
    { "label": "feature name", "value": 8, "color": "#4f46e5" }
  ]
}
Note: "value" is an integer 1-10. "color" is a hex color string.

11. infographic (PREFERRED — renders as SVG diagram with colored cards and arrows)
{
  "type": "infographic",
  "title": "Diagram Title (e.g. 'Key Benefits of X' or 'How X Works')",
  "items": [
    { "icon": "single emoji", "title": "short bold label (2-3 words)", "description": "Complete sentence, 10-15 words max. Must end properly — no cut-off sentences." }
  ]
}
Note: Use 3-5 items. This renders as a professional SVG infographic with colored bordered boxes, arrows between them, and a gradient background. Great for showing processes, benefits, comparisons, or breakdowns. Use this type frequently.

DO NOT use "product-cards" type — product data must come from real DentalKart listings, not AI-generated.

===============================================================================
FAQ RULES
===============================================================================

Produce 4-5 FAQ objects:
{ "question": "full question string?", "answer": "50-70 word answer with at least one specific number." }

===============================================================================
WRITING RULES
===============================================================================

WORD LIMIT: 800-1200 words total (hero description + all section content + faq answers). HARD MINIMUM is 800 words — do not write less. Each section should be 180-220 words (3-4 lines intro + 5-6 bullet points).

TONE: Simple, clean, and professional — like a friendly guide, NOT a clinical textbook. A BDS student should understand everything. No jargon without explanation. Keep sentences short. Avoid heavy academic language. Write like you're explaining to a colleague over coffee.

CONTENT FORMAT: Every section must follow this pattern:
1. Start with 3-4 lines of simple introductory text (no walls of text)
2. Then use an HTML bullet list (<ul><li>...</li></ul>) with 4-6 concise bullet points
3. Keep it scannable and easy to read — readers should grasp the key points quickly

SEO KEYWORD LINKING (STRICT RULES):

RULE 1 — MAIN KEYWORD BAN: The main keyword "${input.searchKeyword}" is in the title. It is STRICTLY BANNED from appearing ANYWHERE else in the entire blog — not in hero description, not in section paragraphs, not in bullet points, not in FAQ answers, not in component text. ZERO occurrences. Also ban any rephrased version of it (e.g. if main keyword is "dental suction unit" then "dental suction units", "suction units", "suction unit" are ALL banned). This is non-negotiable.

RULE 2 — HERO: The hero description should be a simple 2-3 sentence intro about the topic. Do NOT include the main keyword as a link or text in the hero description. The title already has it.

RULE 3 — SUB-KEYWORDS IN PARAGRAPHS: In sections, ONLY add keyword links if there is a genuinely relevant related product from the APPROVED PRODUCT LINKS list. If no suitable keyword fits naturally, DO NOT force one. It is better to have zero keyword links in a section than to add irrelevant ones.

RULE 4 — PRIORITY (when suitable keywords exist):
  * HIGH: Products directly used with the main topic
  * MEDIUM: Products in the same clinical workflow
  * LOW: Products in the broader category

RULE 5 — FORMAT: Wrap as <a href="EXACT_URL_FROM_APPROVED_LIST" class="keyword-highlight">short keyword</a>. Keywords must be 2-3 words max. ONLY use URLs from the approved list.

RULE 6 — NO DUPLICATE HIGHLIGHTS: Each sub-keyword can be highlighted ONLY ONCE in the entire blog. If "rotary files" is linked in section 1, it must appear as plain text (no link) in all other sections. Never highlight the same keyword twice.

NUMBERS: Use percentages, measurements, or durations in sections. Do NOT mention prices (₹) or cost ranges — DentalKart handles pricing.

LINKS: ALL links in the blog (keyword-highlight and regular) must use EXACT URLs from the approved list above. Never invent or guess a dentalkart.com URL.

SECTION TITLES: MAX 5 words each.

FAQ COUNT: 4-5 items.

COMPONENT COUNT: Pick 4-6 distinct component types total (from the 11 types — NO product-cards). EVERY section must have at least 1 component. Use "infographic" in 2-3 sections.

===============================================================================
FINAL INSTRUCTION
===============================================================================

REMEMBER: Bullet points must be SHORT (8-12 words each, no bold headings, no sub-explanations). Blog must be 800-1200 words — not less than 800.

Output ONLY the raw JSON object. Do not wrap it in markdown code fences. Do not add any text before or after the JSON.`;
}
