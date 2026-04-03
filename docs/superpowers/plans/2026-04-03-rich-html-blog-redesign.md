# Rich HTML Blog Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace markdown+AI-images blog output with structured JSON rendered into rich HTML components (hero, info-cards, comparison tables, product cards, checklists, etc.) matching the Dentalkart reference blog style, under 1500 words.

**Architecture:** LLM generates structured JSON defining hero, sections with typed components, FAQ, and CTA. A renderer maps each component type to pre-built HTML/CSS. No more markdown conversion or image generation.

**Tech Stack:** Next.js 16, Gemini 2.5 Pro (AI SDK), Drizzle ORM, Neon PostgreSQL

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/utils/html-template.ts` | Rewrite | CSS design system + JSON→HTML renderer for all 11 components |
| `lib/prompts/blog-writing.ts` | Rewrite | New prompt that outputs structured JSON instead of markdown |
| `lib/pipeline/05-write-blog.ts` | Modify | Parse JSON output, return new `BlogContent` type |
| `lib/pipeline/07-finalize.ts` | Modify | Remove `marked`, call JSON renderer, drop image references |
| `app/api/generate/route.ts` | Modify | Remove image generation step |
| `lib/config.ts` | Modify | Remove `GEMINI_IMAGE_MODEL` |
| `lib/db/schema.ts` | Modify | Remove `images` column |
| `lib/db/queries.ts` | Modify | Remove image field from save |
| `app/blog/[id]/page.tsx` | No change | Already renders `htmlContent` via iframe |
| `app/page.tsx` | No change | Shows blog list metadata only |
| `lib/pipeline/06-images.ts` | Delete | No longer needed |
| `lib/prompts/image-generation.ts` | Delete | No longer needed |

---

### Task 1: Build the HTML Template & Component Renderer

This is the core of the redesign — the CSS design system and the function that converts structured JSON into rich HTML.

**Files:**
- Rewrite: `lib/utils/html-template.ts`

- [ ] **Step 1: Define the TypeScript interfaces for the blog JSON structure**

Add these interfaces at the top of `lib/utils/html-template.ts`:

```typescript
// ===== Blog JSON Schema Types =====

export interface BlogHero {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { num: string; label: string }[];
}

export interface InfoCard {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface ProsConsOption {
  title: string;
  icon: string;
  items: string[];
  watchOut?: string;
}

export interface ComparisonTableCell {
  text: string;
  badge?: "best" | "value" | "premium";
}

export interface ProductCard {
  tag: string;
  tagColor: "bestseller" | "premium" | "budget" | "editors" | "advanced";
  name: string;
  brand: string;
  mrp?: string;
  price: string;
  discount?: string;
  rating: number;
  ratingText: string;
  features: string[];
  specs?: { label: string; value: string }[];
  bestFor: string;
  url: string;
}

export interface ChecklistItem {
  text: string;
  detail: string;
}

export interface DecisionRow {
  if: string;
  then: string;
}

export interface TimelineItem {
  title: string;
  description: string;
}

export interface StepCard {
  title: string;
  description: string;
}

export interface FeatureBar {
  label: string;
  value: number;
  color: string;
}

export type BlogComponent =
  | { type: "info-cards"; cards: InfoCard[] }
  | { type: "pros-cons"; optionA: ProsConsOption; optionB: ProsConsOption }
  | { type: "comparison-table"; headers: string[]; rows: (string | ComparisonTableCell)[][]; footnote?: string }
  | { type: "product-cards"; products: ProductCard[] }
  | { type: "checklist"; title: string; items: ChecklistItem[] }
  | { type: "decision-matrix"; title: string; rows: DecisionRow[] }
  | { type: "tip-box"; title: string; content: string }
  | { type: "warning-box"; title: string; content: string }
  | { type: "timeline"; items: TimelineItem[] }
  | { type: "step-cards"; cards: StepCard[] }
  | { type: "feature-bars"; title: string; bars: FeatureBar[] };

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  components: BlogComponent[];
}

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface BlogCTA {
  title: string;
  description: string;
  buttonText: string;
  url: string;
}

export interface BlogJSON {
  hero: BlogHero;
  sections: BlogSection[];
  faq: BlogFAQ[];
  cta: BlogCTA;
}
```

- [ ] **Step 2: Write all 11 component renderer functions**

Add these functions below the interfaces in `lib/utils/html-template.ts`:

```typescript
// ===== Component Renderers =====

function renderInfoCards(cards: InfoCard[]): string {
  return `<div class="info-grid">${cards.map(c => `
    <div class="info-card">
      <div class="info-icon">${c.icon}</div>
      <h4>${c.title}</h4>
      <p class="info-subtitle">${c.subtitle}</p>
      <p>${c.description}</p>
    </div>`).join("")}
  </div>`;
}

function renderProsCons(optionA: ProsConsOption, optionB: ProsConsOption): string {
  return `<div class="pros-cons">
    <div class="pros">
      <h4>${optionA.icon} ${optionA.title}</h4>
      <ul>${optionA.items.map(i => `<li>${i}</li>`).join("")}</ul>
      ${optionA.watchOut ? `<p class="watch-out"><strong>Watch out:</strong> ${optionA.watchOut}</p>` : ""}
    </div>
    <div class="cons">
      <h4>${optionB.icon} ${optionB.title}</h4>
      <ul>${optionB.items.map(i => `<li>${i}</li>`).join("")}</ul>
      ${optionB.watchOut ? `<p class="watch-out"><strong>Watch out:</strong> ${optionB.watchOut}</p>` : ""}
    </div>
  </div>`;
}

function renderComparisonTable(headers: string[], rows: (string | ComparisonTableCell)[][], footnote?: string): string {
  function renderCell(cell: string | ComparisonTableCell): string {
    if (typeof cell === "string") return cell;
    const badgeClass = cell.badge ? ` <span class="badge-${cell.badge}">${cell.badge === "best" ? "Best" : cell.badge === "value" ? "Value" : "Premium"}</span>` : "";
    return `${cell.text}${badgeClass}`;
  }
  return `<div class="comparison-table-wrapper">
    <table class="comparison-table">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${renderCell(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>${footnote ? `<p class="table-footnote">${footnote}</p>` : ""}`;
}

function renderProductCards(products: ProductCard[]): string {
  return products.map(p => {
    const stars = "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating));
    return `<div class="product-card">
      <div class="product-tag tag-${p.tagColor}">${p.tag}</div>
      <div class="product-header">
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-brand">by ${p.brand}</div>
        </div>
        <div class="product-price">
          ${p.mrp ? `<div class="mrp">MRP ${p.mrp}</div>` : ""}
          <div class="sale">${p.price}</div>
          ${p.discount ? `<div class="discount">${p.discount}</div>` : ""}
        </div>
      </div>
      <div class="product-stars">${stars} <span class="star-text">${p.ratingText}</span></div>
      <div class="product-features">${p.features.map(f => `
        <div class="product-feature"><span class="feature-check">✓</span> ${f}</div>`).join("")}
      </div>
      ${p.specs && p.specs.length > 0 ? `<div class="product-specs">${p.specs.map(s => `
        <div class="spec-item"><div class="spec-label">${s.label}</div><div class="spec-value">${s.value}</div></div>`).join("")}
      </div>` : ""}
      <div class="best-for">🏆 Best for: ${p.bestFor}</div><br>
      <a href="${p.url}" class="product-cta" target="_blank">View on Dentalkart →</a>
    </div>`;
  }).join("\n");
}

function renderChecklist(title: string, items: ChecklistItem[]): string {
  return `<div class="checklist">
    <h3>✅ ${title}</h3>
    ${items.map((item, i) => `<div class="checklist-item">
      <div class="check-icon">${i + 1}</div>
      <div class="checklist-text"><strong>${item.text}</strong><span>${item.detail}</span></div>
    </div>`).join("")}
  </div>`;
}

function renderDecisionMatrix(title: string, rows: DecisionRow[]): string {
  return `<div class="decision-box">
    <h3>💡 ${title}</h3>
    ${rows.map(r => `<div class="decision-row">
      <div class="decision-if">${r.if}</div>
      <div class="decision-arrow">→</div>
      <div class="decision-then">${r.then}</div>
    </div>`).join("")}
  </div>`;
}

function renderTipBox(title: string, content: string): string {
  return `<div class="tip-box">
    <h4>💡 ${title}</h4>
    <p>${content}</p>
  </div>`;
}

function renderWarningBox(title: string, content: string): string {
  return `<div class="warning-box">
    <h4>⚠️ ${title}</h4>
    <p>${content}</p>
  </div>`;
}

function renderTimeline(items: TimelineItem[]): string {
  return `<div class="timeline">${items.map(item => `
    <div class="timeline-item">
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>`).join("")}
  </div>`;
}

function renderStepCards(cards: StepCard[]): string {
  return `<div class="step-cards">${cards.map((c, i) => `
    <div class="step-card">
      <div class="step-num">${i + 1}</div>
      <h4>${c.title}</h4>
      <p>${c.description}</p>
    </div>`).join("")}
  </div>`;
}

function renderFeatureBars(title: string, bars: FeatureBar[]): string {
  const maxVal = 10;
  const barWidth = 500;
  const barHeight = 18;
  const rowHeight = 30;
  const svgHeight = 40 + bars.length * rowHeight;

  const barsHtml = bars.map((b, i) => {
    const w = (b.value / maxVal) * barWidth;
    const y = 45 + i * rowHeight;
    return `<text x="190" y="${y + 14}" text-anchor="end" font-family="Inter,sans-serif" font-size="12" fill="#444">${b.label}</text>
      <rect x="200" y="${y}" width="${w}" height="${barHeight}" rx="4" fill="${b.color}"></rect>
      <text x="${205 + w}" y="${y + 14}" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="${b.color}">${b.value}/10</text>`;
  }).join("\n");

  return `<div class="infographic-wrapper">
    <svg viewBox="0 0 800 ${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="max-width:800px;">
      <rect width="800" height="${svgHeight}" rx="16" fill="#f8f9fa" stroke="#e0e0e0" stroke-width="1"></rect>
      <text x="400" y="30" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="800" fill="#1a1a2e">${title.toUpperCase()}</text>
      ${barsHtml}
    </svg>
  </div>`;
}
```

- [ ] **Step 3: Write the component dispatcher function**

```typescript
function renderComponent(component: BlogComponent): string {
  switch (component.type) {
    case "info-cards": return renderInfoCards(component.cards);
    case "pros-cons": return renderProsCons(component.optionA, component.optionB);
    case "comparison-table": return renderComparisonTable(component.headers, component.rows, component.footnote);
    case "product-cards": return renderProductCards(component.products);
    case "checklist": return renderChecklist(component.title, component.items);
    case "decision-matrix": return renderDecisionMatrix(component.title, component.rows);
    case "tip-box": return renderTipBox(component.title, component.content);
    case "warning-box": return renderWarningBox(component.title, component.content);
    case "timeline": return renderTimeline(component.items);
    case "step-cards": return renderStepCards(component.cards);
    case "feature-bars": return renderFeatureBars(component.title, component.bars);
    default: return "";
  }
}
```

- [ ] **Step 4: Write the main `renderBlogHTML` function**

This replaces the old `wrapInHtmlTemplate`. It takes a `BlogJSON` object and returns a complete HTML document.

```typescript
export function renderBlogHTML(blog: BlogJSON, metaDescription: string): string {
  // Build TOC
  const tocHtml = `<div class="toc">
    <h2>📋 Table of Contents</h2>
    <ol>${blog.sections.map(s => `<li><a href="#${s.id}">${s.title}</a></li>`).join("\n")}</ol>
  </div>`;

  // Build sections
  const sectionsHtml = blog.sections.map(section => {
    const componentsHtml = section.components.map(c => renderComponent(c)).join("\n");
    return `<div class="section" id="${section.id}">
      <h2>${section.title}</h2>
      <p>${section.content}</p>
      ${componentsHtml}
    </div>
    <div class="visual-divider"></div>`;
  }).join("\n");

  // Build FAQ
  const faqHtml = blog.faq.length > 0 ? `<div class="section" id="faq">
    <h2>Frequently Asked Questions</h2>
    ${blog.faq.map(f => `<div class="faq-item">
      <h4>Q: ${f.question}</h4>
      <p>${f.answer}</p>
    </div>`).join("\n")}
  </div>` : "";

  // Build CTA
  const ctaHtml = `<div class="cta-banner">
    <h2>${blog.cta.title}</h2>
    <p>${blog.cta.description}</p>
    <a href="${blog.cta.url}" class="cta-btn" target="_blank">${blog.cta.buttonText}</a>
  </div>`;

  // Hero
  const heroHtml = `<div class="hero">
    <div class="hero-badge">${blog.hero.badge}</div>
    <h1>${blog.hero.title}<br>${blog.hero.subtitle}</h1>
    <p>${blog.hero.description}</p>
    <div class="hero-stats">${blog.hero.stats.map(s => `
      <div class="hero-stat"><div class="num">${s.num}</div><div class="label">${s.label}</div></div>`).join("")}
    </div>
  </div>`;

  // Footer
  const footerHtml = `<div class="blog-footer">
    <p><strong>Dentalkart</strong> — India's Largest Online Dental Store</p>
    <p>📞 +91-728-9999-456 &nbsp;|&nbsp; 📧 support@dentalkart.com &nbsp;|&nbsp; <a href="https://www.dentalkart.com/" target="_blank">www.dentalkart.com</a></p>
    <p style="margin-top:12px; font-size:12px; opacity:0.7;">© ${new Date().getFullYear()} Dentalkart. All rights reserved.</p>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.hero.title} — ${blog.hero.subtitle} | Dentalkart</title>
  <meta name="description" content="${metaDescription}">
  <style>
${CSS_STYLES}
  </style>
</head>
<body>
${heroHtml}
${tocHtml}
${sectionsHtml}
${faqHtml}
${ctaHtml}
${footerHtml}
<script>
  document.querySelectorAll('a[href]').forEach(function(link) {
    if (!link.getAttribute('href').startsWith('#')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
</script>
</body>
</html>`;
}
```

- [ ] **Step 5: Add the CSS_STYLES constant**

This is the full CSS from the reference blog. Add it as a const string at the bottom of the file (before the closing exports):

```typescript
const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  :root {
    --dk-blue: #0066CC; --dk-dark: #1a1a2e; --dk-orange: #FF6B35; --dk-green: #00A86B;
    --dk-light: #f8f9fa; --dk-gray: #6c757d; --dk-border: #e0e0e0; --dk-yellow: #FFC107;
    --dk-red: #DC3545; --shadow-sm: 0 2px 8px rgba(0,0,0,0.08); --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.16); --radius: 12px;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; color:#333; line-height:1.7; background:#fff; }

  .hero { background:linear-gradient(135deg,#0066CC 0%,#004494 50%,#1a1a2e 100%); color:white; padding:60px 20px 50px; text-align:center; position:relative; overflow:hidden; }
  .hero::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px); background-size:30px 30px; }
  .hero-badge { display:inline-block; background:rgba(255,107,53,0.9); color:white; padding:6px 20px; border-radius:50px; font-size:13px; font-weight:600; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; position:relative; }
  .hero h1 { font-size:clamp(28px,5vw,48px); font-weight:900; line-height:1.2; margin-bottom:16px; position:relative; }
  .hero p { font-size:18px; opacity:0.9; max-width:650px; margin:0 auto 30px; position:relative; }
  .hero-stats { display:flex; justify-content:center; gap:40px; flex-wrap:wrap; position:relative; }
  .hero-stat { text-align:center; }
  .hero-stat .num { font-size:32px; font-weight:800; }
  .hero-stat .label { font-size:13px; opacity:0.8; text-transform:uppercase; letter-spacing:0.5px; }

  .container { max-width:900px; margin:0 auto; padding:0 20px; }

  .toc { background:var(--dk-light); border:2px solid var(--dk-border); border-radius:var(--radius); padding:30px; margin:40px auto; max-width:880px; }
  .toc h2 { font-size:20px; margin-bottom:16px; color:var(--dk-dark); }
  .toc ol { padding-left:20px; }
  .toc li { margin-bottom:8px; }
  .toc a { color:var(--dk-blue); text-decoration:none; font-weight:500; font-size:15px; }
  .toc a:hover { text-decoration:underline; }

  .section { max-width:900px; margin:50px auto; padding:0 20px; }
  .section h2 { font-size:28px; font-weight:800; color:var(--dk-dark); margin-bottom:20px; padding-bottom:12px; border-bottom:3px solid var(--dk-blue); display:inline-block; }
  .section h3 { font-size:20px; font-weight:700; color:var(--dk-dark); margin:28px 0 12px; }
  .section p { margin-bottom:16px; font-size:16px; color:#444; }
  .section ol, .section ul { margin:10px 0 20px 24px; }
  .section li { margin-bottom:8px; font-size:15px; color:#444; }

  .info-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:20px; margin:30px 0; }
  .info-card { background:white; border:1px solid var(--dk-border); border-radius:var(--radius); padding:24px; text-align:center; box-shadow:var(--shadow-sm); transition:transform 0.2s,box-shadow 0.2s; }
  .info-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .info-icon { font-size:40px; margin-bottom:12px; }
  .info-card h4 { font-size:16px; font-weight:700; color:var(--dk-dark); margin-bottom:8px; }
  .info-card .info-subtitle { font-size:12px; color:var(--dk-gray); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
  .info-card p { font-size:14px; color:var(--dk-gray); margin:0; }

  .infographic-wrapper { margin:30px 0; text-align:center; }
  .infographic-wrapper svg { max-width:100%; height:auto; }

  .comparison-table-wrapper { overflow-x:auto; margin:30px 0; border-radius:var(--radius); box-shadow:var(--shadow-md); }
  .comparison-table { width:100%; border-collapse:collapse; font-size:14px; min-width:700px; }
  .comparison-table thead { background:var(--dk-dark); color:white; }
  .comparison-table th { padding:14px 16px; text-align:left; font-weight:600; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; }
  .comparison-table td { padding:14px 16px; border-bottom:1px solid var(--dk-border); }
  .comparison-table tbody tr:nth-child(even) { background:#f8f9fa; }
  .comparison-table tbody tr:hover { background:#e8f4ff; }
  .badge-best { display:inline-block; background:var(--dk-green); color:white; padding:2px 10px; border-radius:50px; font-size:11px; font-weight:600; }
  .badge-value { display:inline-block; background:var(--dk-orange); color:white; padding:2px 10px; border-radius:50px; font-size:11px; font-weight:600; }
  .badge-premium { display:inline-block; background:var(--dk-blue); color:white; padding:2px 10px; border-radius:50px; font-size:11px; font-weight:600; }
  .table-footnote { font-size:13px; color:var(--dk-gray); margin-top:10px; }

  .product-card { background:white; border:1px solid var(--dk-border); border-radius:var(--radius); padding:28px; margin:24px 0; box-shadow:var(--shadow-sm); position:relative; transition:box-shadow 0.2s; }
  .product-card:hover { box-shadow:var(--shadow-md); }
  .product-tag { position:absolute; top:-12px; left:20px; padding:4px 16px; border-radius:50px; font-size:12px; font-weight:700; color:white; text-transform:uppercase; }
  .tag-bestseller { background:var(--dk-orange); }
  .tag-premium { background:var(--dk-blue); }
  .tag-budget { background:var(--dk-green); }
  .tag-editors { background:#8B5CF6; }
  .tag-advanced { background:#EC4899; }
  .product-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:16px; }
  .product-name { font-size:22px; font-weight:700; color:var(--dk-dark); }
  .product-brand { font-size:14px; color:var(--dk-gray); margin-top:2px; }
  .product-price { text-align:right; }
  .product-price .mrp { font-size:13px; color:var(--dk-gray); text-decoration:line-through; }
  .product-price .sale { font-size:26px; font-weight:800; color:var(--dk-red); }
  .product-price .discount { display:inline-block; background:#FFEAEA; color:var(--dk-red); padding:2px 10px; border-radius:50px; font-size:12px; font-weight:600; margin-top:4px; }
  .product-stars { color:var(--dk-yellow); font-size:16px; margin:8px 0; }
  .star-text { color:var(--dk-gray); font-size:13px; margin-left:6px; }
  .product-features { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin:16px 0; }
  .product-feature { display:flex; align-items:center; gap:8px; font-size:14px; color:#555; }
  .feature-check { color:var(--dk-green); font-weight:bold; font-size:16px; }
  .product-specs { background:var(--dk-light); border-radius:8px; padding:16px; margin:16px 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; }
  .spec-item { text-align:center; }
  .spec-label { font-size:11px; color:var(--dk-gray); text-transform:uppercase; letter-spacing:0.5px; }
  .spec-value { font-size:16px; font-weight:700; color:var(--dk-dark); }
  .product-cta { display:inline-block; background:var(--dk-orange); color:white; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px; margin-top:16px; transition:background 0.2s; }
  .product-cta:hover { background:#e85d2a; }
  .best-for { display:inline-block; background:#E8F5E9; color:#2E7D32; padding:6px 14px; border-radius:6px; font-size:13px; font-weight:600; margin-top:10px; }

  .checklist { background:linear-gradient(135deg,#f0f7ff,#e8f4ff); border:2px solid #b3d4fc; border-radius:var(--radius); padding:30px; margin:30px 0; }
  .checklist h3 { font-size:20px; color:var(--dk-blue); margin-bottom:20px; }
  .checklist-item { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid rgba(0,102,204,0.15); }
  .checklist-item:last-child { border-bottom:none; }
  .check-icon { width:24px; height:24px; background:var(--dk-blue); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; margin-top:2px; }
  .checklist-text strong { display:block; font-size:15px; color:var(--dk-dark); }
  .checklist-text span { font-size:14px; color:var(--dk-gray); }

  .timeline { margin:30px 0; position:relative; padding-left:40px; }
  .timeline::before { content:''; position:absolute; left:16px; top:0; bottom:0; width:3px; background:linear-gradient(to bottom,var(--dk-blue),var(--dk-green)); border-radius:3px; }
  .timeline-item { position:relative; margin-bottom:28px; padding:20px; background:white; border-radius:var(--radius); box-shadow:var(--shadow-sm); border-left:3px solid var(--dk-blue); }
  .timeline-item::before { content:''; position:absolute; left:-32px; top:24px; width:14px; height:14px; background:var(--dk-blue); border:3px solid white; border-radius:50%; box-shadow:0 0 0 3px var(--dk-blue); }
  .timeline-item h4 { font-size:16px; font-weight:700; color:var(--dk-blue); margin-bottom:6px; }
  .timeline-item p { font-size:14px; color:#555; margin:0; }

  .pros-cons { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:20px 0; }
  .pros,.cons { padding:20px; border-radius:var(--radius); }
  .pros { background:#E8F5E9; border:1px solid #A5D6A7; }
  .cons { background:#E3F2FD; border:1px solid #90CAF9; }
  .pros h4 { color:#2E7D32; margin-bottom:10px; }
  .cons h4 { color:#1565C0; margin-bottom:10px; }
  .pros li,.cons li { font-size:14px; margin-bottom:6px; padding-left:4px; }
  .watch-out { font-size:13px; margin-top:10px; color:#555; }

  .decision-box { background:linear-gradient(135deg,#fff3e0,#ffe0b2); border:2px solid #FFB74D; border-radius:var(--radius); padding:30px; margin:30px 0; }
  .decision-box h3 { color:#E65100; margin-bottom:20px; font-size:20px; }
  .decision-row { display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid rgba(230,81,0,0.15); }
  .decision-row:last-child { border-bottom:none; }
  .decision-if { background:white; padding:6px 14px; border-radius:6px; font-weight:600; font-size:14px; color:#E65100; white-space:nowrap; }
  .decision-then { font-size:14px; color:#555; }
  .decision-arrow { font-size:20px; color:#E65100; }

  .tip-box { background:linear-gradient(135deg,#E8F5E9,#C8E6C9); border-left:5px solid var(--dk-green); border-radius:0 var(--radius) var(--radius) 0; padding:20px 24px; margin:24px 0; }
  .tip-box h4 { color:#2E7D32; margin-bottom:8px; font-size:16px; }
  .tip-box p { font-size:14px; color:#444; margin:0; }

  .warning-box { background:linear-gradient(135deg,#FFF3E0,#FFE0B2); border-left:5px solid var(--dk-orange); border-radius:0 var(--radius) var(--radius) 0; padding:20px 24px; margin:24px 0; }
  .warning-box h4 { color:#E65100; margin-bottom:8px; font-size:16px; }
  .warning-box p { font-size:14px; color:#444; margin:0; }

  .step-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin:30px 0; }
  .step-card { background:white; border:2px solid var(--dk-border); border-radius:var(--radius); padding:24px; position:relative; }
  .step-num { position:absolute; top:-14px; left:20px; background:var(--dk-blue); color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; }
  .step-card h4 { margin-top:8px; font-size:16px; color:var(--dk-dark); margin-bottom:8px; }
  .step-card p { font-size:14px; color:#555; margin:0; }

  .cta-banner { background:linear-gradient(135deg,var(--dk-blue),#004494); color:white; padding:40px; border-radius:var(--radius); text-align:center; margin:40px 20px; }
  .cta-banner h2 { font-size:28px; font-weight:800; margin-bottom:12px; border:none; color:white; display:block; }
  .cta-banner p { font-size:16px; opacity:0.9; margin-bottom:20px; color:white; }
  .cta-btn { display:inline-block; background:var(--dk-orange); color:white; padding:14px 40px; border-radius:8px; text-decoration:none; font-weight:700; font-size:16px; transition:background 0.2s,transform 0.2s; }
  .cta-btn:hover { background:#e85d2a; transform:scale(1.05); }

  .faq-item { background:var(--dk-light); border:1px solid var(--dk-border); border-radius:var(--radius); padding:20px; margin:14px 0; }
  .faq-item h4 { font-size:16px; font-weight:700; color:var(--dk-dark); margin-bottom:8px; }
  .faq-item p { font-size:14px; color:#555; margin:0; }

  .blog-footer { background:var(--dk-dark); color:#ccc; text-align:center; padding:30px; margin-top:50px; font-size:14px; }
  .blog-footer a { color:var(--dk-orange); }

  .visual-divider { height:4px; background:linear-gradient(to right,var(--dk-blue),var(--dk-orange),var(--dk-green)); border-radius:4px; margin:50px auto; max-width:200px; }

  @media (max-width:768px) {
    .pros-cons { grid-template-columns:1fr; }
    .hero-stats { gap:20px; }
    .decision-row { flex-direction:column; gap:8px; }
    .product-header { flex-direction:column; }
    .product-price { text-align:left; }
    .step-cards { grid-template-columns:1fr; }
  }
`;
```

- [ ] **Step 6: Remove the old `wrapInHtmlTemplate` function**

Delete the entire old `wrapInHtmlTemplate` function from the file. The new `renderBlogHTML` replaces it.

- [ ] **Step 7: Verify the file compiles**

Run: `cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator && npx tsc --noEmit lib/utils/html-template.ts`

Expected: No errors (or only errors from other files that import the old function — those get fixed in later tasks).

- [ ] **Step 8: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add lib/utils/html-template.ts
git commit -m "feat: rewrite html-template with rich component renderer

Replace wrapInHtmlTemplate with renderBlogHTML that takes structured
BlogJSON and renders 11 component types (info-cards, product-cards,
comparison-table, checklist, decision-matrix, etc.) into the
Dentalkart reference blog style."
```

---

### Task 2: Rewrite the Blog Writing Prompt for JSON Output

**Files:**
- Rewrite: `lib/prompts/blog-writing.ts`

- [ ] **Step 1: Rewrite `buildBlogWritingPrompt` to request JSON output**

Replace the entire content of `lib/prompts/blog-writing.ts` with:

```typescript
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

  return `You are a dental content writer for DentalKart.com. Generate a structured blog as a JSON object.

===============================================================================
BLOG ASSIGNMENT
===============================================================================

**Title:** ${input.title}
**Subtitle:** ${input.subtitle}
**Category:** ${input.category}
**Target Keyword:** ${input.searchKeyword}
**Hook:** ${input.hook}
**Year:** ${input.currentYear}

**Sections to Cover:**
${input.mainSections.map((section, i) => \`\${i + 1}. \${section}\`).join("\\n")}

===============================================================================
OUTPUT FORMAT — STRICT JSON
===============================================================================

Output a single JSON object with this exact structure. No markdown wrapping, no \\\`\\\`\\\`json fences, just raw JSON:

{
  "hero": {
    "badge": "Dentalkart ${input.category} Guide ${input.currentYear}",
    "title": "First line of title",
    "subtitle": "Second line of title",
    "description": "30-word summary of what this guide covers",
    "stats": [
      { "num": "value", "label": "LABEL" },
      { "num": "value", "label": "LABEL" },
      { "num": "value", "label": "LABEL" }
    ]
  },
  "sections": [
    {
      "id": "url-safe-slug",
      "title": "Section Title (max 5 words)",
      "content": "100-150 words of paragraph text. Can include <strong>, <em>, and <a href='url'> tags for product links.",
      "components": [ ONE OR TWO components from the list below ]
    }
  ],
  "faq": [
    { "question": "Question text?", "answer": "30-40 word answer with specific numbers." }
  ],
  "cta": {
    "title": "Call to action title",
    "description": "1-2 sentences encouraging purchase",
    "buttonText": "Shop [Category] on Dentalkart →",
    "url": "https://www.dentalkart.com/search?query=${encodeURIComponent(input.searchKeyword)}"
  }
}

===============================================================================
COMPONENT TYPES — Pick 4-6 total across all sections
===============================================================================

Each section gets 1-2 components. Pick from:

1. INFO-CARDS — 3 cards with icon, title, subtitle, description
   { "type": "info-cards", "cards": [{ "icon": "emoji", "title": "", "subtitle": "", "description": "" }] }

2. PROS-CONS — Compare two options side by side
   { "type": "pros-cons", "optionA": { "title": "", "icon": "emoji", "items": ["..."], "watchOut": "..." }, "optionB": { ... } }

3. COMPARISON-TABLE — Data table with optional badges
   { "type": "comparison-table", "headers": ["Col1", "Col2", ...], "rows": [["cell", "cell", ...]], "footnote": "optional" }
   For badges: use { "text": "label", "badge": "best" } or "value" or "premium" instead of a plain string

4. PRODUCT-CARDS — Rich product recommendations (use in 1 section max)
   { "type": "product-cards", "products": [{
     "tag": "Best Overall", "tagColor": "bestseller|premium|budget|editors|advanced",
     "name": "Product Name", "brand": "Brand",
     "mrp": "₹XX,XXX", "price": "₹XX,XXX", "discount": "XX% OFF",
     "rating": 5, "ratingText": "5.0",
     "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
     "specs": [{ "label": "Spec", "value": "Value" }],
     "bestFor": "Description of ideal user",
     "url": "exact dentalkart URL from approved list"
   }] }

5. CHECKLIST — Numbered verification items
   { "type": "checklist", "title": "Checklist Title", "items": [{ "text": "Bold title", "detail": "Description" }] }

6. DECISION-MATRIX — If/then recommendation rows
   { "type": "decision-matrix", "title": "Title", "rows": [{ "if": "Scenario...", "then": "Recommendation..." }] }

7. TIP-BOX — Green callout for recommendations
   { "type": "tip-box", "title": "Tip Title", "content": "Tip text" }

8. WARNING-BOX — Orange callout for cautions
   { "type": "warning-box", "title": "Warning Title", "content": "Warning text" }

9. TIMELINE — Vertical timeline for evolution/history
   { "type": "timeline", "items": [{ "title": "Period — Name", "description": "What happened" }] }

10. STEP-CARDS — Numbered grid cards for mistakes/tips
    { "type": "step-cards", "cards": [{ "title": "Card Title", "description": "Description" }] }

11. FEATURE-BARS — Horizontal bar chart ratings out of 10
    { "type": "feature-bars", "title": "Chart Title", "bars": [{ "label": "Feature", "value": 8.5, "color": "#0066CC" }] }

===============================================================================
RULES
===============================================================================

WORD LIMIT: Total text content (hero description + section content + FAQ answers) must be 900-1200 words. The visual components add richness without inflating word count.

SECTIONS: Exactly ${input.mainSections.length} sections matching the assigned topics.

HEADING FORMAT: Max 5 words per section title.

PRODUCT LINKS: Include 8-10 product links in section content using <a href="url">label</a> format.
ONLY USE THESE EXACT LINKS — do NOT invent URLs:
${productLinks}

PRODUCT CARDS: If using product-cards component, only use products with URLs from the approved list above.

SEO: Keyword "${input.searchKeyword}" used 4-6 times naturally across content.

TONE: Simple, professional. A BDS student should understand everything.

DATA: Every section must have specific numbers (temperatures, costs in ₹, percentages, measurements).

FAQ: 4-5 questions with practical, data-rich answers.

HERO STATS: Use real numbers relevant to the topic (e.g., products compared, price range, brands available).

OUTPUT: Raw JSON only. No markdown fences. No explanations before or after.`;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator && npx tsc --noEmit lib/prompts/blog-writing.ts`

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add lib/prompts/blog-writing.ts
git commit -m "feat: rewrite blog-writing prompt for structured JSON output

LLM now outputs a BlogJSON object with hero, typed sections,
components, FAQ, and CTA instead of markdown."
```

---

### Task 3: Update the Write Blog Pipeline Step

**Files:**
- Modify: `lib/pipeline/05-write-blog.ts`

- [ ] **Step 1: Rewrite `05-write-blog.ts` to parse JSON and return new types**

Replace the entire content:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add lib/pipeline/05-write-blog.ts
git commit -m "feat: write-blog now parses structured JSON from LLM

Returns BlogJSON object instead of raw markdown. Calculates word
count from text content only (excludes component data)."
```

---

### Task 4: Update the Finalize Pipeline Step

**Files:**
- Modify: `lib/pipeline/07-finalize.ts`

- [ ] **Step 1: Rewrite `07-finalize.ts` to use `renderBlogHTML` instead of `marked`**

Replace the entire content:

```typescript
import { renderBlogHTML } from "../utils/html-template";
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
  research: ResearchData;
}

export async function finalize(
  input: FinalizeInput
): Promise<{ blogId: number; title: string }> {
  console.log("[Step 5] Finalizing blog...");

  const { blogContent, topic, research } = input;

  const fullHtml = renderBlogHTML(blogContent.blogJson, blogContent.blogSubtitle);

  await db
    .update(blogs)
    .set({
      markdownContent: JSON.stringify(blogContent.blogJson, null, 2),
      htmlContent: fullHtml,
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
    console.error("[Step 5] Research source save failed (non-critical):", err);
  }

  console.log(
    `[Step 5] Blog #${topic.blogNumber} finalized: "${topic.title}"`
  );

  return { blogId: topic.blogId, title: topic.title };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add lib/pipeline/07-finalize.ts
git commit -m "feat: finalize uses renderBlogHTML, drops marked and images

Removed markdown conversion and image insertion. Stores raw JSON in
markdownContent field for debugging."
```

---

### Task 5: Update the API Route & Remove Image Pipeline

**Files:**
- Modify: `app/api/generate/route.ts`
- Modify: `lib/config.ts`
- Delete: `lib/pipeline/06-images.ts`
- Delete: `lib/prompts/image-generation.ts`

- [ ] **Step 1: Update `app/api/generate/route.ts` to remove image step**

Replace the entire content:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getLastBlogWithinHours, updateBlogStatus } from "@/lib/db/queries";
import { runResearch } from "@/lib/pipeline/01-research";
import { generateTopic } from "@/lib/pipeline/02-topic";
import { writeBlog } from "@/lib/pipeline/05-write-blog";
import { finalize } from "@/lib/pipeline/07-finalize";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  if (!force) {
    const recentBlog = await getLastBlogWithinHours(12);
    if (recentBlog) {
      return NextResponse.json({
        message: "Blog already generated within last 12 hours",
        lastBlog: recentBlog.title,
      });
    }
  }

  let blogId: number | null = null;

  try {
    const research = await runResearch();
    const topic = await generateTopic(research);
    blogId = topic.blogId;

    const blogContent = await writeBlog(topic, research.seasonalContext);

    const result = await finalize({
      blogContent,
      topic,
      research,
    });

    return NextResponse.json({
      success: true,
      blogId: result.blogId,
      title: result.title,
      wordCount: blogContent.wordCount,
    });
  } catch (error) {
    console.error("Blog generation failed:", error);

    if (blogId) {
      await updateBlogStatus(
        blogId,
        "failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Remove `GEMINI_IMAGE_MODEL` from `lib/config.ts`**

Delete this line from the top of `lib/config.ts`:

```typescript
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
```

- [ ] **Step 3: Delete image pipeline files**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
rm lib/pipeline/06-images.ts
rm lib/prompts/image-generation.ts
```

- [ ] **Step 4: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add -A
git commit -m "feat: remove image generation pipeline

Delete 06-images.ts and image-generation.ts prompts.
Remove image step from API route and GEMINI_IMAGE_MODEL config.
Blog visuals now come from CSS components, not AI images."
```

---

### Task 6: Update Database Schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Remove the `images` column from the schema**

In `lib/db/schema.ts`, delete these lines (lines 21-24):

```typescript
  images: jsonb("images").$type<
    { url: string; caption: string; prompt: string }[]
  >(),
```

The column remains in the actual database (we don't run a destructive migration), but Drizzle will simply ignore it. New blogs won't write to it.

- [ ] **Step 2: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add lib/db/schema.ts
git commit -m "chore: remove images column from Drizzle schema

Column still exists in DB but is no longer read or written.
New blogs use CSS components instead of stored images."
```

---

### Task 7: Uninstall Unused Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove `sharp` and `marked` dependencies**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
npm uninstall sharp marked
```

- `sharp` — was used for image post-processing in `06-images.ts` (deleted)
- `marked` — was used for markdown→HTML conversion in `07-finalize.ts` (replaced with JSON renderer)

- [ ] **Step 2: Verify the build still works**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
npm run build
```

Expected: Build succeeds with no errors. If there are type errors from `marked`, ensure no file still imports it (should only have been `07-finalize.ts` which was already updated).

- [ ] **Step 3: Commit**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add package.json package-lock.json
git commit -m "chore: remove sharp and marked dependencies

No longer needed — images are CSS components, markdown is replaced
with structured JSON rendering."
```

---

### Task 8: Full Build Verification

- [ ] **Step 1: Run TypeScript type check**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
npx tsc --noEmit
```

Expected: No type errors. If there are errors, they will likely be:
- Imports of deleted files (already handled)
- `BlogContent.markdown` references (changed to `blogJson`)
- `images` parameter in finalize (removed)

Fix any remaining type errors before proceeding.

- [ ] **Step 2: Run the Next.js build**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit any fixes**

```bash
cd /Users/maclapctp85/Desktop/Blog\ Generator/dentalkart-blog-generator
git add -A
git commit -m "fix: resolve any remaining type/build errors from redesign"
```
