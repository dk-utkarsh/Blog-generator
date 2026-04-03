# Rich HTML Blog Redesign — Design Spec

## Goal

Redesign the blog generator output to match the visual style of the reference Endomotor buying guide HTML. Blogs should use rich CSS components (hero, info-cards, comparison tables, product cards, checklists, etc.) instead of AI-generated images. Word count must stay under 1500.

## Approach: Hybrid (Structured JSON + Template Rendering)

The LLM generates structured JSON defining content and component types. A template renderer maps that JSON to pre-built HTML/CSS components. This ensures consistent visual quality across all blogs.

---

## Pipeline Change

### Current Flow
```
Research → Topic → Write Markdown → Generate Images → Convert MD→HTML + Template → Save
```

### New Flow
```
Research → Topic → Write Structured JSON → Render JSON → Rich HTML → Save
```

- **Step 3 (write-blog):** LLM outputs structured JSON instead of markdown
- **Step 4 (images):** Removed entirely
- **Step 5 (finalize):** JSON→HTML renderer replaces `marked` markdown conversion

---

## JSON Schema (LLM Output)

```json
{
  "hero": {
    "badge": "string — e.g. 'Dentalkart Buying Guide 2025'",
    "title": "string — main H1",
    "subtitle": "string — line 2 of H1",
    "description": "string — ~30 words",
    "stats": [
      { "num": "string — e.g. '7+'", "label": "string — e.g. 'Products Compared'" }
    ]
  },
  "sections": [
    {
      "id": "string — URL-safe slug",
      "title": "string — section heading",
      "content": "string — paragraph text (HTML allowed: <strong>, <a>, <em>)",
      "components": [
        {
          "type": "info-cards | pros-cons | comparison-table | product-cards | checklist | decision-matrix | tip-box | warning-box | timeline | step-cards | feature-bars",
          "...": "component-specific fields (see Component Definitions below)"
        }
      ]
    }
  ],
  "faq": [
    { "question": "string", "answer": "string" }
  ],
  "cta": {
    "title": "string",
    "description": "string",
    "buttonText": "string",
    "url": "string — Dentalkart category URL"
  }
}
```

---

## 11 Component Definitions

### 1. info-cards
3-column grid with icon, title, subtitle, description.
```json
{
  "type": "info-cards",
  "cards": [
    { "icon": "emoji", "title": "string", "subtitle": "string", "description": "string" }
  ]
}
```

### 2. pros-cons
Side-by-side comparison boxes. Green for option A, blue for option B.
```json
{
  "type": "pros-cons",
  "optionA": { "title": "string", "icon": "emoji", "items": ["string"], "watchOut": "string" },
  "optionB": { "title": "string", "icon": "emoji", "items": ["string"], "watchOut": "string" }
}
```

### 3. comparison-table
Table with dark header and badge support.
```json
{
  "type": "comparison-table",
  "headers": ["string"],
  "rows": [
    ["string or { text, badge: 'best|value|premium' }"]
  ],
  "footnote": "string (optional)"
}
```

### 4. product-cards
Rich product cards with pricing, rating, features, specs, CTA.
```json
{
  "type": "product-cards",
  "products": [
    {
      "tag": "string — e.g. 'Best Overall'",
      "tagColor": "bestseller | premium | budget | editors | advanced",
      "name": "string",
      "brand": "string",
      "mrp": "string (optional)",
      "price": "string",
      "discount": "string (optional)",
      "rating": "number (1-5)",
      "ratingText": "string",
      "features": ["string"],
      "specs": [{ "label": "string", "value": "string" }],
      "bestFor": "string",
      "url": "string — Dentalkart product URL"
    }
  ]
}
```

### 5. checklist
Numbered check items with title and detail.
```json
{
  "type": "checklist",
  "title": "string",
  "items": [
    { "text": "string — bold title", "detail": "string — description" }
  ]
}
```

### 6. decision-matrix
If/then recommendation rows.
```json
{
  "type": "decision-matrix",
  "title": "string",
  "rows": [
    { "if": "string", "then": "string" }
  ]
}
```

### 7. tip-box
Green callout with left border.
```json
{
  "type": "tip-box",
  "title": "string",
  "content": "string"
}
```

### 8. warning-box
Orange callout with left border.
```json
{
  "type": "warning-box",
  "title": "string",
  "content": "string"
}
```

### 9. timeline
Vertical timeline with connected items.
```json
{
  "type": "timeline",
  "items": [
    { "title": "string", "description": "string" }
  ]
}
```

### 10. step-cards
Numbered grid cards.
```json
{
  "type": "step-cards",
  "cards": [
    { "title": "string", "description": "string" }
  ]
}
```

### 11. feature-bars
Horizontal SVG bar chart with ratings out of 10.
```json
{
  "type": "feature-bars",
  "title": "string",
  "bars": [
    { "label": "string", "value": "number (1-10)", "color": "string (hex)" }
  ]
}
```

---

## Blog Structure (Under 1500 Words)

Every blog includes:
1. **Hero** — badge, title, subtitle, description (~30 words), 3-4 stats
2. **Table of Contents** — auto-generated from section titles
3. **4-5 Content Sections** — each with ~100-150 words of text + 1-2 visual components
4. **FAQ** — 4-5 Q&As (~30-40 words each)
5. **CTA Banner** — title, description, button
6. **Footer** — Dentalkart branding

### Word Budget
| Part | Words |
|------|-------|
| Hero description | ~30 |
| Section 1 (Intro/What) | ~150 |
| Section 2 (Types/Features) | ~150 |
| Section 3 (Specs/Checklist) | ~150 |
| Section 4 (Comparison) | ~80 |
| Section 5 (Top Picks) | ~150 |
| FAQ (4-5 items) | ~200 |
| **Total** | **~900-1100** |

The LLM picks 4-6 component types per blog based on topic relevance. Not all 11 are used every time.

---

## CSS Design System

Taken directly from the reference blog. Key variables:
```css
--dk-blue: #0066CC;
--dk-dark: #1a1a2e;
--dk-orange: #FF6B35;
--dk-green: #00A86B;
--dk-light: #f8f9fa;
--dk-gray: #6c757d;
--dk-border: #e0e0e0;
--dk-yellow: #FFC107;
--dk-red: #DC3545;
```

Fonts: Inter (body), used throughout. Mobile-responsive at 768px breakpoint.

---

## Files to Change

| File | Action |
|------|--------|
| `lib/pipeline/05-write-blog.ts` | Rewrite prompt — output structured JSON |
| `lib/utils/html-template.ts` | Replace — new CSS + JSON→HTML renderer |
| `lib/pipeline/07-finalize.ts` | Update — remove `marked`, call JSON renderer |
| `lib/pipeline/06-images.ts` | **Delete** |
| `lib/prompts/image-generation.ts` | **Delete** |
| `app/api/generate/route.ts` | Remove image step from pipeline |
| `lib/config.ts` | Remove image model config |
| `lib/db/schema.ts` | Remove `images` column |
| `lib/db/queries.ts` | Remove image references in save/query functions |
| `app/blog/[id]/page.tsx` | Remove image display logic |

## Files Unchanged
- `lib/pipeline/01-research.ts`
- `lib/pipeline/02-topic.ts`
- `lib/scrapers/`
- `app/layout.tsx`
- `app/page.tsx` (minor — remove image count display if shown)

---

## Product URLs

Product URLs continue to come from the existing `lib/config.ts` hardcoded list. The write-blog prompt passes relevant product URLs to the LLM based on the blog's category/keywords. The LLM selects which products to feature in product-cards and comparison-tables from this approved list only.

---

## What We're NOT Changing
- Research pipeline (PubMed, web scraping, textbook topics)
- Topic generation logic (deduplication, forbidden patterns, category weights)
- Database structure (except removing `images` column)
- Cron/API security (CRON_SECRET)
- Rate limiting (12-hour check)
