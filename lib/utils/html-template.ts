// ─── TypeScript Interfaces ───────────────────────────────────────────────────

export interface BlogHeroStat {
  num: string;
  label: string;
}

export interface BlogHero {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  stats: BlogHeroStat[];
}

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  components: BlogComponent[];
}

export interface InfoCard {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface InfoCardsComponent {
  type: "info-cards";
  cards: InfoCard[];
}

export interface ProsConsOption {
  title: string;
  icon: string;
  items: string[];
  watchOut?: string;
}

export interface ProsConsComponent {
  type: "pros-cons";
  optionA: ProsConsOption;
  optionB: ProsConsOption;
}

export interface ComparisonTableCell {
  text: string;
  badge?: "best" | "value" | "premium";
}

export interface ComparisonTableComponent {
  type: "comparison-table";
  headers: string[];
  rows: (string | ComparisonTableCell)[][];
  footnote?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
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
  specs?: ProductSpec[];
  bestFor: string;
  url: string;
}

export interface ProductCardsComponent {
  type: "product-cards";
  products: Product[];
}

export interface ChecklistItem {
  text: string;
  detail: string;
}

export interface ChecklistComponent {
  type: "checklist";
  title: string;
  items: ChecklistItem[];
}

export interface DecisionMatrixRow {
  if: string;
  then: string;
}

export interface DecisionMatrixComponent {
  type: "decision-matrix";
  title: string;
  rows: DecisionMatrixRow[];
}

export interface TipBoxComponent {
  type: "tip-box";
  title: string;
  content: string;
}

export interface WarningBoxComponent {
  type: "warning-box";
  title: string;
  content: string;
}

export interface TimelineItem {
  title: string;
  description: string;
}

export interface TimelineComponent {
  type: "timeline";
  items: TimelineItem[];
}

export interface StepCard {
  title: string;
  description: string;
}

export interface StepCardsComponent {
  type: "step-cards";
  cards: StepCard[];
}

export interface FeatureBar {
  label: string;
  value: number;
  color: string;
}

export interface FeatureBarsComponent {
  type: "feature-bars";
  title: string;
  bars: FeatureBar[];
}

export type BlogComponent =
  | InfoCardsComponent
  | ProsConsComponent
  | ComparisonTableComponent
  | ProductCardsComponent
  | ChecklistComponent
  | DecisionMatrixComponent
  | TipBoxComponent
  | WarningBoxComponent
  | TimelineComponent
  | StepCardsComponent
  | FeatureBarsComponent;

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

// ─── Utility ─────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function starRating(rating: number): string {
  const filled = Math.round(Math.max(0, Math.min(5, rating)));
  const empty = 5 - filled;
  return "★".repeat(filled) + "☆".repeat(empty);
}

// ─── Component Renderers ─────────────────────────────────────────────────────

function renderInfoCards(c: InfoCardsComponent): string {
  const cards = c.cards
    .map(
      (card) => `
      <div class="info-card">
        <div class="info-card-icon">${card.icon}</div>
        <h4 class="info-card-title">${card.title}</h4>
        <div class="info-card-subtitle">${card.subtitle}</div>
        <p class="info-card-desc">${card.description}</p>
      </div>`
    )
    .join("");
  return `<div class="info-cards-grid">${cards}</div>`;
}

function renderProsCons(c: ProsConsComponent): string {
  const renderOption = (
    opt: ProsConsOption,
    cls: "pros" | "cons"
  ): string => {
    const items = opt.items.map((item) => `<li>${item}</li>`).join("");
    const watchOut = opt.watchOut
      ? `<div class="watch-out"><strong>Watch out:</strong> ${opt.watchOut}</div>`
      : "";
    return `
      <div class="pros-cons-box ${cls}">
        <div class="pros-cons-header">
          <span class="pros-cons-icon">${opt.icon}</span>
          <h4>${opt.title}</h4>
        </div>
        <ul>${items}</ul>
        ${watchOut}
      </div>`;
  };

  return `<div class="pros-cons-grid">
    ${renderOption(c.optionA, "pros")}
    ${renderOption(c.optionB, "cons")}
  </div>`;
}

function renderComparisonTable(c: ComparisonTableComponent): string {
  const thCells = c.headers
    .map((h) => `<th>${h}</th>`)
    .join("");

  const bodyRows = c.rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          if (typeof cell === "string") {
            return `<td>${cell}</td>`;
          }
          const badgeClass = cell.badge ? ` badge-${cell.badge}` : "";
          const badgeHtml = cell.badge
            ? ` <span class="table-badge${badgeClass}">${cell.badge}</span>`
            : "";
          return `<td>${cell.text}${badgeHtml}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const footnote = c.footnote
    ? `<div class="table-footnote">${c.footnote}</div>`
    : "";

  return `
    <div class="comparison-table-wrap">
      <table class="comparison-table">
        <thead><tr>${thCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      ${footnote}
    </div>`;
}

function renderProductCards(c: ProductCardsComponent): string {
  const cards = c.products
    .map((p) => {
      const tagClass = `tag-${p.tagColor}`;
      const mrpHtml = p.mrp
        ? `<span class="product-mrp">${p.mrp}</span>`
        : "";
      const discountHtml = p.discount
        ? `<span class="product-discount">${p.discount}</span>`
        : "";
      const features = p.features
        .map((f) => `<li>${f}</li>`)
        .join("");
      const specs = (p.specs ?? [])
        .map(
          (s) =>
            `<div class="spec-item"><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>`
        )
        .join("");

      return `
      <div class="product-card">
        <div class="product-tag ${tagClass}">${p.tag}</div>
        <h4 class="product-name">${p.name}</h4>
        <div class="product-brand">${p.brand}</div>
        <div class="product-pricing">
          ${mrpHtml}
          <span class="product-price">${p.price}</span>
          ${discountHtml}
        </div>
        <div class="product-rating">
          <span class="stars">${starRating(p.rating)}</span>
          <span class="rating-text">${p.ratingText}</span>
        </div>
        <ul class="product-features">${features}</ul>
        <div class="product-specs">${specs}</div>
        <div class="product-best-for"><strong>Best For:</strong> ${p.bestFor}</div>
        <a href="${escapeHtml(p.url)}" class="product-cta">View on Dentalkart</a>
      </div>`;
    })
    .join("");

  return `<div class="product-cards-grid">${cards}</div>`;
}

function renderChecklist(c: ChecklistComponent): string {
  const items = c.items
    .map(
      (item, i) => `
      <div class="checklist-item">
        <div class="checklist-number">${i + 1}</div>
        <div class="checklist-content">
          <strong>${item.text}</strong>
          <p>${item.detail}</p>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="checklist">
      <h4 class="checklist-title">${c.title}</h4>
      ${items}
    </div>`;
}

function renderDecisionMatrix(c: DecisionMatrixComponent): string {
  const rows = c.rows
    .map(
      (row) => `
      <div class="decision-row">
        <div class="decision-if"><strong>If</strong> ${row.if}</div>
        <div class="decision-then"><strong>Then</strong> ${row.then}</div>
      </div>`
    )
    .join("");

  return `
    <div class="decision-matrix">
      <h4 class="decision-title">${c.title}</h4>
      ${rows}
    </div>`;
}

function renderTipBox(c: TipBoxComponent): string {
  return `
    <div class="tip-box">
      <h4>${c.title}</h4>
      <p>${c.content}</p>
    </div>`;
}

function renderWarningBox(c: WarningBoxComponent): string {
  return `
    <div class="warning-box">
      <h4>${c.title}</h4>
      <p>${c.content}</p>
    </div>`;
}

function renderTimeline(c: TimelineComponent): string {
  const items = c.items
    .map(
      (item) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>
      </div>`
    )
    .join("");

  return `<div class="timeline">${items}</div>`;
}

function renderStepCards(c: StepCardsComponent): string {
  const cards = c.cards
    .map(
      (card, i) => `
      <div class="step-card">
        <div class="step-number">${i + 1}</div>
        <h4>${card.title}</h4>
        <p>${card.description}</p>
      </div>`
    )
    .join("");

  return `<div class="step-cards-grid">${cards}</div>`;
}

function renderFeatureBars(c: FeatureBarsComponent): string {
  const barHeight = 40;
  const gap = 12;
  const topPadding = 10;
  const svgHeight = topPadding + c.bars.length * (barHeight + gap);
  const maxBarWidth = 520;
  const labelX = 10;
  const barX = 200;
  const valueX = 740;

  const barsSvg = c.bars
    .map((bar, i) => {
      const y = topPadding + i * (barHeight + gap);
      const barWidth = (Math.max(0, Math.min(10, bar.value)) / 10) * maxBarWidth;
      return `
        <text x="${labelX}" y="${y + 26}" class="bar-label">${escapeHtml(bar.label)}</text>
        <rect x="${barX}" y="${y + 5}" width="${barWidth}" height="${barHeight - 10}" rx="6" fill="${bar.color}" opacity="0.85"/>
        <text x="${valueX}" y="${y + 26}" class="bar-value">${bar.value}/10</text>`;
    })
    .join("");

  return `
    <div class="feature-bars">
      <h4 class="feature-bars-title">${c.title}</h4>
      <svg viewBox="0 0 800 ${svgHeight}" class="feature-bars-svg">
        <style>
          .bar-label { font-family: 'Inter', sans-serif; font-size: 14px; fill: #333; font-weight: 500; }
          .bar-value { font-family: 'Inter', sans-serif; font-size: 14px; fill: #666; font-weight: 600; text-anchor: end; }
        </style>
        ${barsSvg}
      </svg>
    </div>`;
}

// ─── Component Dispatcher ────────────────────────────────────────────────────

function renderComponent(component: BlogComponent): string {
  switch (component.type) {
    case "info-cards":
      return renderInfoCards(component);
    case "pros-cons":
      return renderProsCons(component);
    case "comparison-table":
      return renderComparisonTable(component);
    case "product-cards":
      return renderProductCards(component);
    case "checklist":
      return renderChecklist(component);
    case "decision-matrix":
      return renderDecisionMatrix(component);
    case "tip-box":
      return renderTipBox(component);
    case "warning-box":
      return renderWarningBox(component);
    case "timeline":
      return renderTimeline(component);
    case "step-cards":
      return renderStepCards(component);
    case "feature-bars":
      return renderFeatureBars(component);
    default:
      return "";
  }
}

// ─── CSS Styles ──────────────────────────────────────────────────────────────

const CSS_STYLES = `
  :root {
    --dk-blue: #0066CC;
    --dk-dark: #1a1a2e;
    --dk-orange: #FF6B35;
    --dk-green: #00A86B;
    --dk-light: #f8f9fa;
    --dk-gray: #6c757d;
    --dk-border: #e0e0e0;
    --dk-yellow: #FFC107;
    --dk-red: #DC3545;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.7;
    color: #333;
    background: #fff;
    font-size: 16px;
  }

  /* ===== HERO ===== */
  .hero {
    background: linear-gradient(135deg, var(--dk-blue), #004999);
    color: #fff;
    padding: 60px 40px;
    text-align: center;
    border-radius: 0 0 24px 24px;
  }
  .hero-badge {
    display: inline-block;
    background: rgba(255,107,53,0.9);
    color: #fff;
    padding: 6px 20px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .hero h1 {
    font-size: 36px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
    color: #fff;
  }
  .hero-description {
    font-size: 18px;
    opacity: 0.9;
    max-width: 700px;
    margin: 0 auto 30px;
    line-height: 1.6;
  }
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }
  .hero-stat {
    text-align: center;
  }
  .hero-stat-num {
    font-size: 28px;
    font-weight: 800;
    display: block;
  }
  .hero-stat-label {
    font-size: 13px;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ===== MAIN CONTENT ===== */
  .blog-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  /* ===== TABLE OF CONTENTS ===== */
  .toc {
    background: var(--dk-light);
    border: 1px solid var(--dk-border);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 40px;
  }
  .toc h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 16px;
  }
  .toc ol {
    list-style: none;
    counter-reset: toc-counter;
    padding: 0;
    margin: 0;
  }
  .toc li {
    counter-increment: toc-counter;
    margin-bottom: 10px;
  }
  .toc li::before {
    content: counter(toc-counter) ".";
    font-weight: 700;
    color: var(--dk-blue);
    margin-right: 10px;
  }
  .toc a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .toc a:hover {
    color: var(--dk-blue);
  }

  /* ===== SECTIONS ===== */
  .section {
    margin-bottom: 48px;
  }
  .section h2 {
    font-size: 26px;
    font-weight: 800;
    color: var(--dk-dark);
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 3px solid var(--dk-blue);
  }
  .section-content {
    font-size: 16px;
    line-height: 1.8;
    color: #444;
    margin-bottom: 24px;
  }
  .section-content a {
    color: var(--dk-blue);
    text-decoration: none;
    font-weight: 600;
  }
  .section-content a:hover {
    text-decoration: underline;
  }

  /* ===== VISUAL DIVIDER ===== */
  .section-divider {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--dk-border), transparent);
    margin: 40px 0;
  }

  /* ===== INFO CARDS ===== */
  .info-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin: 24px 0;
  }
  .info-card {
    background: var(--dk-light);
    border: 1px solid var(--dk-border);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  .info-card-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }
  .info-card-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 4px;
  }
  .info-card-subtitle {
    font-size: 13px;
    color: var(--dk-gray);
    margin-bottom: 10px;
    font-weight: 500;
  }
  .info-card-desc {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    margin: 0;
  }

  /* ===== PROS / CONS (Option A / Option B) ===== */
  .pros-cons-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 24px 0;
  }
  .pros-cons-box {
    border-radius: 16px;
    padding: 24px;
  }
  .pros-cons-box.pros {
    background: #E8F5E9;
    border: 2px solid #81C784;
  }
  .pros-cons-box.cons {
    background: #E3F2FD;
    border: 2px solid #90CAF9;
  }
  .pros-cons-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .pros-cons-header h4 {
    font-size: 16px;
    font-weight: 700;
  }
  .pros-cons-box.pros .pros-cons-header h4 { color: #2E7D32; }
  .pros-cons-box.cons .pros-cons-header h4 { color: #1565C0; }
  .pros-cons-icon {
    font-size: 24px;
  }
  .pros-cons-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .pros-cons-box li {
    padding: 6px 0;
    font-size: 14px;
    position: relative;
    padding-left: 22px;
  }
  .pros-cons-box.pros li { color: #2E7D32; }
  .pros-cons-box.cons li { color: #1565C0; }
  .pros-cons-box.pros li::before {
    content: "\\2713";
    position: absolute;
    left: 0;
    color: #2E7D32;
    font-weight: 700;
  }
  .pros-cons-box.cons li::before {
    content: "\\2713";
    position: absolute;
    left: 0;
    color: #1565C0;
    font-weight: 700;
  }
  .watch-out {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    background: rgba(255,255,255,0.6);
    color: #555;
  }

  /* ===== COMPARISON TABLE ===== */
  .comparison-table-wrap {
    margin: 24px 0;
    overflow-x: auto;
  }
  .comparison-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    font-size: 14px;
  }
  .comparison-table thead tr {
    background: var(--dk-dark);
  }
  .comparison-table th {
    color: #fff;
    padding: 14px 18px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .comparison-table td {
    padding: 12px 18px;
    border-bottom: 1px solid #f1f5f9;
    color: #444;
    background: #fff;
  }
  .comparison-table tr:nth-child(even) td {
    background: #f8f9fa;
  }
  .comparison-table tr:hover td {
    background: #e8f4fd;
  }
  .comparison-table tr:last-child td {
    border-bottom: none;
  }
  .comparison-table td:first-child {
    font-weight: 600;
    color: var(--dk-dark);
  }
  .table-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    margin-left: 8px;
  }
  .badge-best {
    background: #E8F5E9;
    color: #2E7D32;
  }
  .badge-value {
    background: #FFF3E0;
    color: #E65100;
  }
  .badge-premium {
    background: #E3F2FD;
    color: #1565C0;
  }
  .table-footnote {
    font-size: 13px;
    color: var(--dk-gray);
    margin-top: 10px;
    font-style: italic;
  }

  /* ===== PRODUCT CARDS ===== */
  .product-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin: 24px 0;
  }
  .product-card {
    background: #fff;
    border: 1px solid var(--dk-border);
    border-radius: 16px;
    padding: 24px;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }
  .product-tag {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }
  .tag-bestseller { background: #FFF3E0; color: #E65100; }
  .tag-premium { background: #E3F2FD; color: #1565C0; }
  .tag-budget { background: #E8F5E9; color: #2E7D32; }
  .tag-editors { background: #F3E5F5; color: #7B1FA2; }
  .tag-advanced { background: #FCE4EC; color: #C2185B; }
  .product-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 4px;
  }
  .product-brand {
    font-size: 13px;
    color: var(--dk-gray);
    margin-bottom: 12px;
    font-weight: 500;
  }
  .product-pricing {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .product-mrp {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
  .product-price {
    font-size: 22px;
    font-weight: 800;
    color: var(--dk-green);
  }
  .product-discount {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    background: var(--dk-green);
    padding: 2px 10px;
    border-radius: 50px;
  }
  .product-rating {
    margin-bottom: 14px;
  }
  .stars {
    color: var(--dk-yellow);
    font-size: 16px;
    margin-right: 8px;
  }
  .rating-text {
    font-size: 13px;
    color: var(--dk-gray);
  }
  .product-features {
    list-style: none;
    padding: 0;
    margin: 0 0 14px 0;
  }
  .product-features li {
    font-size: 14px;
    padding: 4px 0;
    color: #444;
    position: relative;
    padding-left: 20px;
  }
  .product-features li::before {
    content: "\\2713";
    position: absolute;
    left: 0;
    color: var(--dk-green);
    font-weight: 700;
  }
  .product-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 14px;
    background: var(--dk-light);
    border-radius: 10px;
    padding: 12px;
  }
  .spec-item {
    display: flex;
    flex-direction: column;
  }
  .spec-label {
    font-size: 11px;
    color: var(--dk-gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .spec-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--dk-dark);
  }
  .product-best-for {
    font-size: 14px;
    color: #555;
    margin-bottom: 16px;
    padding: 10px 14px;
    background: #FFFDE7;
    border-radius: 8px;
  }
  .product-cta {
    display: block;
    text-align: center;
    background: var(--dk-blue);
    color: #fff !important;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none !important;
    transition: background 0.2s;
  }
  .product-cta:hover {
    background: #004999;
  }

  /* ===== CHECKLIST ===== */
  .checklist {
    margin: 24px 0;
  }
  .checklist-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 16px;
  }
  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }
  .checklist-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 50%;
    background: var(--dk-blue);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }
  .checklist-content {
    flex: 1;
  }
  .checklist-content strong {
    font-size: 15px;
    color: var(--dk-dark);
    display: block;
    margin-bottom: 4px;
  }
  .checklist-content p {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    margin: 0;
  }

  /* ===== DECISION MATRIX ===== */
  .decision-matrix {
    margin: 24px 0;
  }
  .decision-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 16px;
  }
  .decision-row {
    display: flex;
    gap: 0;
    margin-bottom: 10px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #FFE0B2;
  }
  .decision-if {
    flex: 1;
    background: #FFF3E0;
    padding: 14px 18px;
    font-size: 14px;
    color: #E65100;
  }
  .decision-then {
    flex: 1;
    background: #FFF8E1;
    padding: 14px 18px;
    font-size: 14px;
    color: #F57F17;
  }
  .decision-if strong,
  .decision-then strong {
    color: var(--dk-orange);
    margin-right: 6px;
  }

  /* ===== TIP BOX ===== */
  .tip-box {
    margin: 24px 0;
    padding: 20px 24px;
    border-left: 5px solid var(--dk-green);
    background: #E8F5E9;
    border-radius: 0 12px 12px 0;
  }
  .tip-box h4 {
    font-size: 15px;
    font-weight: 700;
    color: #2E7D32;
    margin-bottom: 8px;
  }
  .tip-box p {
    font-size: 14px;
    color: #2E7D32;
    line-height: 1.6;
    margin: 0;
  }

  /* ===== WARNING BOX ===== */
  .warning-box {
    margin: 24px 0;
    padding: 20px 24px;
    border-left: 5px solid var(--dk-orange);
    background: #FFF3E0;
    border-radius: 0 12px 12px 0;
  }
  .warning-box h4 {
    font-size: 15px;
    font-weight: 700;
    color: #E65100;
    margin-bottom: 8px;
  }
  .warning-box p {
    font-size: 14px;
    color: #BF360C;
    line-height: 1.6;
    margin: 0;
  }

  /* ===== TIMELINE ===== */
  .timeline {
    margin: 24px 0;
    position: relative;
    padding-left: 40px;
  }
  .timeline::before {
    content: "";
    position: absolute;
    left: 14px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--dk-blue);
    border-radius: 3px;
  }
  .timeline-item {
    position: relative;
    margin-bottom: 24px;
  }
  .timeline-dot {
    position: absolute;
    left: -33px;
    top: 8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--dk-blue);
    border: 3px solid #fff;
    box-shadow: 0 0 0 3px var(--dk-blue);
  }
  .timeline-card {
    background: var(--dk-light);
    border: 1px solid var(--dk-border);
    border-radius: 12px;
    padding: 18px;
  }
  .timeline-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 6px;
  }
  .timeline-card p {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    margin: 0;
  }

  /* ===== STEP CARDS ===== */
  .step-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 24px 0;
  }
  .step-card {
    background: var(--dk-light);
    border: 1px solid var(--dk-border);
    border-radius: 16px;
    padding: 30px 20px 20px;
    position: relative;
    text-align: center;
  }
  .step-number {
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--dk-blue);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,102,204,0.3);
  }
  .step-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 8px;
    margin-top: 6px;
  }
  .step-card p {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    margin: 0;
  }

  /* ===== FEATURE BARS ===== */
  .feature-bars {
    margin: 24px 0;
  }
  .feature-bars-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 16px;
  }
  .feature-bars-svg {
    width: 100%;
    height: auto;
  }

  /* ===== FAQ ===== */
  .faq-section {
    margin: 48px 0;
  }
  .faq-section h2 {
    font-size: 26px;
    font-weight: 800;
    color: var(--dk-dark);
    margin-bottom: 24px;
    text-align: center;
  }
  .faq-item {
    margin-bottom: 16px;
    border: 1px solid var(--dk-border);
    border-radius: 12px;
    overflow: hidden;
  }
  .faq-question {
    font-size: 15px;
    font-weight: 700;
    color: var(--dk-dark);
    padding: 16px 20px;
    background: var(--dk-light);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .faq-question::after {
    content: "+";
    font-size: 20px;
    font-weight: 700;
    color: var(--dk-blue);
    transition: transform 0.2s;
  }
  .faq-item.open .faq-question::after {
    content: "\\2212";
  }
  .faq-answer {
    padding: 0 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }
  .faq-item.open .faq-answer {
    padding: 16px 20px;
    max-height: 500px;
  }
  .faq-answer p {
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    margin: 0;
  }

  /* ===== CTA BANNER ===== */
  .cta-banner {
    background: linear-gradient(135deg, var(--dk-blue), #004999);
    color: #fff;
    padding: 48px 40px;
    border-radius: 20px;
    text-align: center;
    margin: 48px 0;
  }
  .cta-banner h2 {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 12px;
    color: #fff;
    border-bottom: none;
  }
  .cta-banner p {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 24px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .cta-button {
    display: inline-block;
    background: var(--dk-orange);
    color: #fff !important;
    padding: 14px 36px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 16px;
    text-decoration: none !important;
    transition: background 0.2s, transform 0.2s;
  }
  .cta-button:hover {
    background: #e55a2b;
    transform: translateY(-2px);
  }

  /* ===== FOOTER ===== */
  .blog-footer {
    background: var(--dk-dark);
    color: #ccc;
    padding: 40px;
    text-align: center;
    border-radius: 20px 20px 0 0;
    margin-top: 48px;
  }
  .blog-footer h3 {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }
  .blog-footer p {
    font-size: 14px;
    line-height: 1.7;
    color: #aaa;
    margin-bottom: 6px;
  }
  .blog-footer a {
    color: var(--dk-blue);
    text-decoration: none;
  }
  .blog-footer a:hover {
    text-decoration: underline;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .hero {
      padding: 40px 20px;
    }
    .hero h1 {
      font-size: 26px;
    }
    .hero-description {
      font-size: 15px;
    }
    .hero-stats {
      gap: 24px;
    }
    .hero-stat-num {
      font-size: 22px;
    }
    .blog-content {
      padding: 24px 16px;
    }
    .section h2 {
      font-size: 22px;
    }
    .info-cards-grid {
      grid-template-columns: 1fr;
    }
    .pros-cons-grid {
      grid-template-columns: 1fr;
    }
    .product-cards-grid {
      grid-template-columns: 1fr;
    }
    .step-cards-grid {
      grid-template-columns: 1fr;
    }
    .decision-row {
      flex-direction: column;
    }
    .cta-banner {
      padding: 32px 20px;
    }
    .cta-banner h2 {
      font-size: 22px;
    }
    .blog-footer {
      padding: 30px 20px;
    }
  }
`;

// ─── Main Render Function ────────────────────────────────────────────────────

export function renderBlogHTML(blog: BlogJSON, metaDescription: string): string {
  // Hero
  const statsHtml = blog.hero.stats
    .map(
      (s) => `
      <div class="hero-stat">
        <span class="hero-stat-num">${s.num}</span>
        <span class="hero-stat-label">${s.label}</span>
      </div>`
    )
    .join("");

  const heroHtml = `
    <div class="hero">
      <div class="hero-badge">${escapeHtml(blog.hero.badge)}</div>
      <h1>${blog.hero.title}<br>${blog.hero.subtitle}</h1>
      <p class="hero-description">${blog.hero.description}</p>
      <div class="hero-stats">${statsHtml}</div>
    </div>`;

  // Table of Contents
  const tocItems = blog.sections
    .map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`)
    .join("");
  const tocHtml = `
    <div class="toc">
      <h3>Table of Contents</h3>
      <ol>${tocItems}</ol>
    </div>`;

  // Sections
  const sectionsHtml = blog.sections
    .map((section, idx) => {
      const componentsHtml = section.components
        .map((c) => renderComponent(c))
        .join("");

      const divider =
        idx < blog.sections.length - 1
          ? '<hr class="section-divider">'
          : "";

      return `
      <div class="section" id="${section.id}">
        <h2>${section.title}</h2>
        <div class="section-content">${section.content}</div>
        ${componentsHtml}
      </div>
      ${divider}`;
    })
    .join("");

  // FAQ
  const faqItems = blog.faq
    .map(
      (item) => `
      <div class="faq-item">
        <div class="faq-question">${escapeHtml(item.question)}</div>
        <div class="faq-answer"><p>${item.answer}</p></div>
      </div>`
    )
    .join("");

  const faqHtml = `
    <div class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${faqItems}
    </div>`;

  // CTA
  const ctaHtml = `
    <div class="cta-banner">
      <h2>${blog.cta.title}</h2>
      <p>${blog.cta.description}</p>
      <a href="${escapeHtml(blog.cta.url)}" class="cta-button">${blog.cta.buttonText}</a>
    </div>`;

  // Footer
  const footerHtml = `
    <div class="blog-footer">
      <h3>Dentalkart</h3>
      <p>India's Most Trusted Online Dental Store</p>
      <p>Email: <a href="mailto:care@dentalkart.com">care@dentalkart.com</a> | Phone: <a href="tel:+918588834835">+91-8588834835</a></p>
      <p><a href="https://www.dentalkart.com">www.dentalkart.com</a></p>
    </div>`;

  // Script for external links + FAQ toggle
  const scriptHtml = `
  <script>
    // Open external links in new tab (skip anchor links)
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) !== '#') {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // FAQ toggle
    document.querySelectorAll('.faq-question').forEach(function(q) {
      q.addEventListener('click', function() {
        this.parentElement.classList.toggle('open');
      });
    });
  </script>`;

  const fullTitle = `${blog.hero.title} ${blog.hero.subtitle}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${CSS_STYLES}</style>
</head>
<body>
${heroHtml}
<div class="blog-content">
  ${tocHtml}
  ${sectionsHtml}
  ${faqHtml}
  ${ctaHtml}
</div>
${footerHtml}
${scriptHtml}
</body>
</html>`;
}
