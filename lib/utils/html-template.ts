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

export interface InfographicItem {
  icon: string;
  title: string;
  description: string;
}

export interface InfographicComponent {
  type: "infographic";
  title: string;
  items: InfographicItem[];
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
  | FeatureBarsComponent
  | InfographicComponent;

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
  return `<div class="info-cards-wrap"><div class="info-cards-grid">${cards}</div></div>`;
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

function renderInfographic(c: InfographicComponent): string {
  const colors = ["#0066CC", "#00A86B", "#FF6B35", "#8B5CF6", "#DC3545", "#00ACC1"];
  const count = c.items.length;
  const cols = Math.min(count, 3);
  const cardW = 220;
  const cardH = 180;
  const gap = 24;
  const padX = 30;
  const padTop = 55;
  const totalW = padX * 2 + cols * cardW + (cols - 1) * gap;
  const rows = Math.ceil(count / cols);
  const totalH = padTop + rows * (cardH + gap) + 10;

  const cards = c.items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padX + col * (cardW + gap);
    const y = padTop + row * (cardH + gap);
    const color = colors[i % colors.length];
    const descLines = escapeHtml(item.description).match(/.{1,32}(\s|$)/g) || [item.description];

    let descSvg = "";
    descLines.slice(0, 5).forEach((line, li) => {
      descSvg += `<text x="${x + cardW / 2}" y="${y + 95 + li * 16}" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#444">${line.trim()}</text>`;
    });

    // Arrow between cards in same row (except last in row)
    let arrow = "";
    if (col < cols - 1 && i < count - 1) {
      const ax = x + cardW + 2;
      const ay = y + cardH / 2;
      arrow = `<polygon points="${ax},${ay - 6} ${ax + 14},${ay} ${ax},${ay + 6}" fill="${color}" opacity="0.6"/>`;
    }

    return `
      <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="12" fill="white" stroke="${color}" stroke-width="2"/>
      <text x="${x + cardW / 2}" y="${y + 30}" text-anchor="middle" font-size="24">${item.icon}</text>
      <text x="${x + cardW / 2}" y="${y + 56}" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="${color}">${escapeHtml(item.title).toUpperCase()}</text>
      ${descSvg}
      ${arrow}`;
  }).join("");

  return `
    <div class="infographic-wrapper">
      <svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="max-width:${totalW}px;">
        <defs>
          <linearGradient id="ig${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0066CC;stop-opacity:0.08"/>
            <stop offset="100%" style="stop-color:#00A86B;stop-opacity:0.08"/>
          </linearGradient>
        </defs>
        <rect width="${totalW}" height="${totalH}" rx="16" fill="#f8fafc" stroke="#e0e0e0" stroke-width="1.5"/>
        <text x="${totalW / 2}" y="35" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="800" fill="#1a1a2e">${escapeHtml(c.title).toUpperCase()}</text>
        ${cards}
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
    case "infographic":
      return renderInfographic(component);
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
    --dk-border: #e8eaed;
    --dk-yellow: #FFC107;
    --dk-red: #DC3545;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --shadow-hover: 0 12px 40px rgba(0,0,0,0.15);
    --radius: 16px;
    --radius-sm: 12px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.7;
    color: #333;
    background: linear-gradient(180deg, #f8f9fb 0%, #ffffff 400px);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== HERO ===== */
  .hero {
    background: linear-gradient(135deg, var(--dk-blue), #004999);
    color: #fff !important;
    padding: 72px 48px 64px;
    text-align: center;
    border-radius: 0 0 28px 28px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero::after {
    content: "";
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero > * {
    position: relative;
    z-index: 1;
  }
  .hero-badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 8px 22px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 24px;
    text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .hero h1 {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 20px;
    color: #fff !important;
    letter-spacing: -0.5px;
  }
  .hero-subtitle {
    font-size: 24px;
    font-weight: 400;
    opacity: 0.85;
    color: #fff !important;
  }
  .hero-description {
    font-size: 17px;
    opacity: 0.88;
    max-width: 680px;
    margin: 0 auto 20px;
    line-height: 1.7;
    color: #fff !important;
  }
  .hero p, .hero span, .hero div {
    color: #fff !important;
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

  /* ===== KEYWORD HIGHLIGHTS ===== */
  .keyword-highlight {
    color: var(--dk-blue);
    font-weight: 600;
    text-decoration: none;
    background: linear-gradient(120deg, rgba(0,102,204,0.08) 0%, rgba(0,168,107,0.08) 100%);
    padding: 2px 6px;
    border-radius: 4px;
    border-bottom: 2px solid var(--dk-blue);
    transition: var(--transition);
  }
  .keyword-highlight:hover {
    background: linear-gradient(120deg, rgba(0,102,204,0.15) 0%, rgba(0,168,107,0.15) 100%);
    transform: translateY(-1px);
  }
  .hero .keyword-highlight {
    color: #fff;
    background: rgba(255,255,255,0.18);
    border-bottom: 3px solid rgba(255,255,255,0.6);
    padding: 2px 8px;
    border-radius: 6px;
  }
  .hero .keyword-highlight:hover {
    background: rgba(255,255,255,0.3);
    border-bottom-color: #fff;
  }
  .hero h1 .keyword-highlight {
    font-weight: 800;
  }

  /* ===== MAIN CONTENT ===== */
  .blog-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  /* ===== TABLE OF CONTENTS ===== */
  .toc {
    background: #fff;
    border: 1px solid var(--dk-border);
    border-radius: var(--radius);
    padding: 36px 40px;
    margin-bottom: 44px;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  .toc:hover {
    box-shadow: var(--shadow-md);
  }
  .toc h3 {
    font-size: 22px;
    font-weight: 800;
    color: var(--dk-dark);
    margin-bottom: 24px;
  }
  .toc ol {
    list-style: none;
    counter-reset: toc-counter;
    padding: 0;
    margin: 0;
  }
  .toc li {
    counter-increment: toc-counter;
    margin-bottom: 4px;
    padding: 10px 14px;
    border-radius: 10px;
    transition: var(--transition);
  }
  .toc li:hover {
    background: linear-gradient(135deg, rgba(0,102,204,0.04), rgba(0,168,107,0.04));
    transform: translateX(4px);
  }
  .toc li::before {
    content: counter(toc-counter) ".";
    font-weight: 700;
    color: var(--dk-blue);
    margin-right: 12px;
    font-size: 16px;
  }
  .toc a {
    color: var(--dk-blue);
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: var(--transition);
  }
  .toc a:hover {
    color: var(--dk-dark);
  }

  /* ===== SECTIONS ===== */
  .section {
    margin-bottom: 52px;
  }
  .section h2 {
    font-size: 28px;
    font-weight: 800;
    color: var(--dk-dark);
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 4px solid var(--dk-blue);
    border-bottom-width: 4px;
    display: inline-block;
  }
  .section-content {
    font-size: 16px;
    line-height: 1.85;
    color: #3a3a3a;
    margin-bottom: 24px;
    margin-top: 18px;
  }
  .section-content a:not(.keyword-highlight) {
    color: var(--dk-blue);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .section-content a:not(.keyword-highlight):hover {
    text-decoration: underline;
  }
  .section-content ul {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    background: #fff;
    border: 1px solid var(--dk-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .section-content ul li {
    position: relative;
    padding: 12px 16px 12px 40px;
    font-size: 15px;
    color: #444;
    border-bottom: 1px solid #f4f5f6;
    transition: var(--transition);
  }
  .section-content ul li:last-child {
    border-bottom: none;
  }
  .section-content ul li:hover {
    background: linear-gradient(90deg, rgba(0,102,204,0.04), transparent);
    padding-left: 44px;
  }
  .section-content ul li::before {
    content: "\\2713";
    position: absolute;
    left: 14px;
    color: var(--dk-green);
    font-weight: 700;
    font-size: 14px;
  }

  /* ===== VISUAL DIVIDER ===== */
  .section-divider {
    border: none;
    height: 3px;
    background: linear-gradient(to right, transparent, var(--dk-blue), var(--dk-green), var(--dk-orange), transparent);
    margin: 48px auto;
    max-width: 200px;
    border-radius: 3px;
    opacity: 0.4;
  }

  /* ===== INFO CARDS (Diagram Style) ===== */
  .info-cards-wrap {
    background: linear-gradient(135deg, #f8fafc, #f0f4ff);
    border: 2px dashed var(--dk-border);
    border-radius: 20px;
    padding: 32px 28px;
    margin: 28px 0;
    transition: var(--transition);
  }
  .info-cards-wrap:hover {
    border-color: var(--dk-blue);
    border-style: solid;
    box-shadow: var(--shadow-md);
  }
  .info-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .info-card {
    background: #fff;
    border-radius: 14px;
    padding: 22px 18px;
    text-align: center;
    position: relative;
    transition: var(--transition);
    overflow: hidden;
    min-width: 0;
  }
  .info-card:nth-child(1) { border: 2px solid #42a5f5; }
  .info-card:nth-child(2) { border: 2px solid #ef5350; }
  .info-card:nth-child(3) { border: 2px solid #66bb6a; }
  .info-card:nth-child(4) { border: 2px solid #ffa726; }
  .info-card:nth-child(5) { border: 2px solid #ab47bc; }
  .info-card:nth-child(6) { border: 2px solid #26c6da; }
  .info-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-lg);
  }
  /* Arrow connectors between cards in same row */
  .info-card:not(:nth-child(3n))::after {
    content: "\\25C0";
    position: absolute;
    right: -14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--dk-blue);
    z-index: 1;
  }
  .info-card-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }
  .info-card-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .info-card:nth-child(1) .info-card-title { color: #1e88e5; }
  .info-card:nth-child(2) .info-card-title { color: #e53935; }
  .info-card:nth-child(3) .info-card-title { color: #43a047; }
  .info-card:nth-child(4) .info-card-title { color: #f57c00; }
  .info-card:nth-child(5) .info-card-title { color: #8e24aa; }
  .info-card:nth-child(6) .info-card-title { color: #00acc1; }
  .info-card-subtitle {
    font-size: 12px;
    color: var(--dk-gray);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .info-card-desc {
    font-size: 13px;
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
    border-radius: var(--radius);
    padding: 24px;
    transition: var(--transition);
  }
  .pros-cons-box:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .pros-cons-box.pros {
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
    border: 2px solid #81C784;
  }
  .pros-cons-box.cons {
    background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
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
    border-radius: var(--radius-sm);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    font-size: 14px;
    transition: var(--transition);
  }
  .comparison-table-wrap:hover .comparison-table {
    box-shadow: var(--shadow-lg);
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
    margin: 28px 0;
    background: linear-gradient(135deg, #f0f7ff, #f8f9fa);
    border: 1px solid var(--dk-border);
    border-radius: var(--radius);
    padding: 28px;
    box-shadow: var(--shadow-sm);
  }
  .checklist-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--dk-dark);
    margin-bottom: 18px;
  }
  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
    padding: 12px 14px;
    background: #fff;
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }
  .checklist-item:hover {
    transform: translateX(6px);
    box-shadow: var(--shadow-sm);
  }
  .checklist-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--dk-blue), #004999);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 3px 10px rgba(0,102,204,0.3);
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
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid #FFE0B2;
    transition: var(--transition);
  }
  .decision-row:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-sm);
    border-color: var(--dk-orange);
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
    margin: 28px 0;
    padding: 24px 28px 24px 32px;
    border-left: 6px solid var(--dk-green);
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    border-radius: 4px var(--radius) var(--radius) 4px;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  .tip-box:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
  }
  .tip-box h4 {
    font-size: 17px;
    font-weight: 700;
    color: #2E7D32;
    margin-bottom: 10px;
  }
  .tip-box h4::before {
    content: "💡 ";
  }
  .tip-box p {
    font-size: 15px;
    color: #333;
    line-height: 1.7;
    margin: 0;
  }

  /* ===== WARNING BOX ===== */
  .warning-box {
    margin: 28px 0;
    padding: 24px 28px 24px 32px;
    border-left: 6px solid var(--dk-orange);
    background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%);
    border-radius: 4px var(--radius) var(--radius) 4px;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  .warning-box:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
  }
  .warning-box h4 {
    font-size: 17px;
    font-weight: 700;
    color: #E65100;
    margin-bottom: 10px;
  }
  .warning-box h4::before {
    content: "⚠️ ";
  }
  .warning-box p {
    font-size: 15px;
    color: #333;
    line-height: 1.7;
    margin: 0;
  }

  /* ===== TIMELINE ===== */
  .timeline {
    margin: 28px 0;
    position: relative;
    padding-left: 48px;
  }
  .timeline-item {
    position: relative;
    margin-bottom: 28px;
  }
  /* Vertical colored line on left of each card */
  .timeline-item::before {
    content: "";
    position: absolute;
    left: -34px;
    top: 0;
    bottom: -28px;
    width: 4px;
    border-radius: 4px;
  }
  .timeline-item:last-child::before {
    bottom: 0;
  }
  /* Color cycle for timeline items */
  .timeline-item:nth-child(4n+1)::before { background: var(--dk-blue); }
  .timeline-item:nth-child(4n+2)::before { background: var(--dk-green); }
  .timeline-item:nth-child(4n+3)::before { background: var(--dk-orange); }
  .timeline-item:nth-child(4n)::before { background: #7B1FA2; }
  /* Circle dot marker */
  .timeline-dot {
    position: absolute;
    left: -42px;
    top: 20px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--dk-blue);
    z-index: 2;
    box-shadow: 0 0 0 4px rgba(0,102,204,0.15);
  }
  .timeline-item:nth-child(4n+1) .timeline-dot { border-color: var(--dk-blue); box-shadow: 0 0 0 4px rgba(0,102,204,0.15); }
  .timeline-item:nth-child(4n+2) .timeline-dot { border-color: var(--dk-green); box-shadow: 0 0 0 4px rgba(0,168,107,0.15); }
  .timeline-item:nth-child(4n+3) .timeline-dot { border-color: var(--dk-orange); box-shadow: 0 0 0 4px rgba(255,107,53,0.15); }
  .timeline-item:nth-child(4n) .timeline-dot { border-color: #7B1FA2; box-shadow: 0 0 0 4px rgba(123,31,162,0.15); }
  .timeline-card {
    background: #fff;
    border: 1.5px solid var(--dk-border);
    border-radius: var(--radius);
    padding: 24px 28px;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  .timeline-card:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow-md);
    border-color: var(--dk-blue);
  }
  .timeline-card h4 {
    font-size: 17px;
    font-weight: 700;
    color: var(--dk-blue);
    margin-bottom: 8px;
  }
  .timeline-item:nth-child(4n+1) .timeline-card h4 { color: var(--dk-blue); }
  .timeline-item:nth-child(4n+2) .timeline-card h4 { color: var(--dk-green); }
  .timeline-item:nth-child(4n+3) .timeline-card h4 { color: var(--dk-orange); }
  .timeline-item:nth-child(4n) .timeline-card h4 { color: #7B1FA2; }
  .timeline-card p {
    font-size: 15px;
    color: #444;
    line-height: 1.7;
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
    background: #fff;
    border: 1px solid var(--dk-border);
    border-radius: var(--radius);
    padding: 30px 20px 20px;
    position: relative;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  .step-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: var(--dk-blue);
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

  /* ===== SVG INFOGRAPHIC ===== */
  .infographic-wrapper {
    margin: 28px 0;
    text-align: center;
  }
  .infographic-wrapper svg {
    max-width: 100%;
    height: auto;
    border-radius: 16px;
  }

  /* ===== FAQ ===== */
  .faq-section {
    margin: 52px 0;
    background: #fff;
    border: 1.5px solid var(--dk-border);
    border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .faq-section h2 {
    font-size: 26px;
    font-weight: 800;
    color: var(--dk-dark);
    margin-bottom: 28px;
    text-align: center;
    border-bottom: none;
    display: block;
  }
  /* FAQ — pure CSS toggle (no JavaScript needed) */
  .faq-item {
    margin-bottom: 12px;
    border: 1.5px solid var(--dk-border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: var(--transition);
  }
  .faq-item:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--dk-blue);
    transform: translateY(-2px);
  }
  .faq-toggle {
    display: none;
  }
  .faq-question {
    font-size: 16px;
    font-weight: 700;
    color: var(--dk-dark);
    padding: 18px 24px;
    background: #fff;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
    user-select: none;
    -webkit-user-select: none;
  }
  .faq-question:hover {
    background: var(--dk-light);
  }
  .faq-question::after {
    content: "+";
    font-size: 22px;
    font-weight: 700;
    color: var(--dk-blue);
    min-width: 24px;
    text-align: center;
    transition: transform 0.3s;
  }
  .faq-toggle:checked + .faq-question::after {
    content: "\\2212";
  }
  .faq-answer {
    padding: 0 24px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }
  .faq-toggle:checked ~ .faq-answer {
    padding: 16px 24px 20px;
    max-height: 500px;
    border-top: 1px solid var(--dk-border);
  }
  .faq-answer p {
    font-size: 15px;
    color: #444;
    line-height: 1.7;
    margin: 0;
  }

  /* ===== CTA BANNER ===== */
  .cta-banner {
    background: linear-gradient(135deg, var(--dk-blue), #004999);
    color: #fff !important;
    padding: 56px 48px;
    border-radius: 24px;
    text-align: center;
    margin: 52px 0;
    position: relative;
    overflow: hidden;
  }
  .cta-banner::before {
    content: "";
    position: absolute;
    top: -40%;
    right: -15%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cta-banner > * {
    position: relative;
    z-index: 1;
  }
  .cta-banner h2 {
    font-size: 30px;
    font-weight: 800;
    margin-bottom: 14px;
    color: #fff !important;
    border-bottom: none;
    display: block;
  }
  .cta-banner p, .cta-banner span, .cta-banner div {
    color: #fff !important;
  }
  .cta-banner p {
    font-size: 17px;
    opacity: 0.92;
    margin-bottom: 28px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
  .cta-button {
    display: inline-block;
    background: #fff;
    color: var(--dk-blue) !important;
    padding: 16px 40px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 16px;
    text-decoration: none !important;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  }

  /* ===== FOOTER ===== */
  .blog-footer {
    background: #fff;
    color: #333;
    padding: 44px 40px;
    text-align: center;
    border-top: 1px solid var(--dk-border);
    margin-top: 52px;
  }
  .footer-logo-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    margin-bottom: 16px;
  }
  .footer-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
  .footer-brand {
    display: inline-block;
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.5px;
    transition: var(--transition);
  }
  .footer-brand:hover {
    transform: scale(1.05);
  }
  .footer-brand-dk {
    color: #4A90C4;
  }
  .footer-brand-com {
    color: #E8872A;
  }
  .blog-footer h3 {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }
  .blog-footer p {
    font-size: 14px;
    line-height: 1.7;
    color: #666;
    margin-bottom: 6px;
  }
  .blog-footer a {
    color: #4A90C4;
    text-decoration: none;
    transition: var(--transition);
  }
  .blog-footer a:hover {
    color: #E8872A;
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

export function renderBlogHTML(blog: BlogJSON, metaDescription: string, searchKeyword?: string, category?: string): string {
  // Hero

  // Category-based themes — matches the featured image SVG colors exactly
  const categoryThemes: Record<string, { primary: string; dark: string; gradient: string; light: string; lightBorder: string }> = {
    Endodontics: { primary: "#0066CC", dark: "#004494", gradient: "linear-gradient(135deg, #0066CC 0%, #004494 50%, #1a1a2e 100%)", light: "#e8f4ff", lightBorder: "#b3d4fc" },
    Orthodontics: { primary: "#7B1FA2", dark: "#4A148C", gradient: "linear-gradient(135deg, #7B1FA2 0%, #4A148C 50%, #1a1a2e 100%)", light: "#ede7f6", lightBorder: "#b39ddb" },
    Prosthodontics: { primary: "#00A86B", dark: "#006B45", gradient: "linear-gradient(135deg, #00A86B 0%, #006B45 50%, #1a2e1a 100%)", light: "#e8f5e9", lightBorder: "#a5d6a7" },
    Periodontal: { primary: "#00838F", dark: "#004D40", gradient: "linear-gradient(135deg, #00838F 0%, #004D40 50%, #1a2e2e 100%)", light: "#e0f7fa", lightBorder: "#80deea" },
    "Aesthetic Dentistry": { primary: "#C2185B", dark: "#880E4F", gradient: "linear-gradient(135deg, #C2185B 0%, #880E4F 50%, #1a1a2e 100%)", light: "#fce4ec", lightBorder: "#f48fb1" },
    "General Dentistry": { primary: "#1976D2", dark: "#0D47A1", gradient: "linear-gradient(135deg, #1976D2 0%, #0D47A1 50%, #1a1a2e 100%)", light: "#e3f2fd", lightBorder: "#90caf9" },
    "Dentistry Tips": { primary: "#00897B", dark: "#00695C", gradient: "linear-gradient(135deg, #00897B 0%, #00695C 50%, #1a2e2e 100%)", light: "#e0f2f1", lightBorder: "#80cbc4" },
    "Advancements in Dentistry": { primary: "#5C6BC0", dark: "#283593", gradient: "linear-gradient(135deg, #5C6BC0 0%, #283593 50%, #1a1a2e 100%)", light: "#e8eaf6", lightBorder: "#9fa8da" },
  };
  const defaultTheme = { primary: "#0066CC", dark: "#004494", gradient: "linear-gradient(135deg, #0066CC 0%, #004494 50%, #1a1a2e 100%)", light: "#e8f4ff", lightBorder: "#b3d4fc" };
  const theme = (category && categoryThemes[category]) || defaultTheme;

  // Highlight main keyword in hero description (NOT in the title)
  let heroDesc = blog.hero.description;
  if (searchKeyword) {
    const kwUrl = `https://www.dentalkart.com/search?query=${encodeURIComponent(searchKeyword)}`;
    const escKw = searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Try exact match first
    const kwRegex = new RegExp(`(?<!<[^>]*)\\b(${escKw})\\b`, "i");
    if (kwRegex.test(heroDesc)) {
      heroDesc = heroDesc.replace(kwRegex, `<a href="${kwUrl}" class="keyword-highlight">$1</a>`);
    } else {
      // Try fuzzy: match keyword words allowing different endings
      const kwWords = searchKeyword.split(/\s+/).filter(w => w.length > 3);
      if (kwWords.length > 0) {
        const fuzzyPattern = kwWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/s?$/i, '') + '\\w*').join('\\s+');
        const fuzzyRegex = new RegExp(`(${fuzzyPattern})`, "i");
        heroDesc = heroDesc.replace(fuzzyRegex, `<a href="${kwUrl}" class="keyword-highlight">$1</a>`);
      }
    }
  }

  const heroHtml = `
    <div class="hero">
      <h1>${blog.hero.title}<br><span class="hero-subtitle">${blog.hero.subtitle}</span></h1>
      <p class="hero-description">${heroDesc}</p>
    </div>`;

  // Table of Contents
  const tocItems = blog.sections
    .map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`)
    .join("");
  const tocHtml = `
    <div class="toc">
      <h3>Table of Contents</h3>
      <ol>${tocItems}
        <li><a href="#faq">Frequently Asked Questions</a></li>
      </ol>
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

  // FAQ — pure CSS toggle using hidden checkbox + label
  const faqItems = blog.faq
    .map(
      (item, idx) => `
      <div class="faq-item">
        <input type="checkbox" class="faq-toggle" id="faq-${idx}">
        <label class="faq-question" for="faq-${idx}">${escapeHtml(item.question)}</label>
        <div class="faq-answer"><p>${item.answer}</p></div>
      </div>`
    )
    .join("");

  const faqHtml = `
    <div class="faq-section" id="faq">
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
  // Logo served from /public/dentalkart-logo.png
  const _dkLogoBase64 = "data:image/jpeg;base64,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";
  const footerHtml = `
    <div class="blog-footer">
      <a href="https://www.dentalkart.com" class="footer-logo-link">
        <span class="footer-brand"><span class="footer-brand-dk">Dentalkart</span><span class="footer-brand-com">.com</span></span>
      </a>
      <p>India's Most Trusted Online Dental Store</p>
      <p>Email: <a href="mailto:support@dentalkart.com">support@dentalkart.com</a> | Phone: <a href="tel:+917289999456">+91-7289999456</a></p>
      <p><a href="https://www.dentalkart.com">www.dentalkart.com</a></p>
    </div>`;

  // Script for external links + FAQ toggle
  const scriptHtml = `
  <script>
    // Fix keyword-highlight links: use the keyword text as search query
    document.querySelectorAll('a.keyword-highlight').forEach(function(link) {
      var keyword = link.textContent.trim();
      if (keyword) {
        link.setAttribute('href', 'https://www.dentalkart.com/search?query=' + encodeURIComponent(keyword));
      }
    });

    // Open external links in new tab (skip anchor links)
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) !== '#') {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // FAQ toggle — handled by pure CSS (checkbox + label), no JS needed
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
  <style>${CSS_STYLES}
  /* Theme override */
  :root {
    --dk-blue: ${theme.primary};
    --dk-dark: ${theme.dark};
  }
  .hero { background: ${theme.gradient}; }
  .cta-banner { background: ${theme.gradient}; }
  .toc a { color: ${theme.primary}; }
  .toc li::before { color: ${theme.primary}; }
  .section h2 { border-bottom-color: ${theme.primary}; }
  .checklist { background: linear-gradient(135deg, ${theme.light}, white); border-color: ${theme.lightBorder}; }
  .checklist h3 { color: ${theme.primary}; }
  .check-icon { background: ${theme.primary}; }
  .comparison-table thead { background: ${theme.dark}; }
  .step-num { background: ${theme.primary}; }
  </style>
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
