/**
 * Generate a branded featured image SVG for a blog post.
 * Uses category-based colors matching the blog HTML theme.
 */

export interface FeaturedImageInput {
  title: string;
  subtitle?: string;
  category?: string;
}

// Same colors as the blog HTML categoryThemes
const THEMES: Record<string, { primary: string; dark: string; light: string }> = {
  Endodontics: { primary: "#0066CC", dark: "#004494", light: "#b3d4fc" },
  Orthodontics: { primary: "#7B1FA2", dark: "#4A148C", light: "#b39ddb" },
  Prosthodontics: { primary: "#00A86B", dark: "#006B45", light: "#a5d6a7" },
  Periodontal: { primary: "#00838F", dark: "#004D40", light: "#80deea" },
  "Aesthetic Dentistry": { primary: "#C2185B", dark: "#880E4F", light: "#f48fb1" },
  "General Dentistry": { primary: "#1976D2", dark: "#0D47A1", light: "#90caf9" },
  "Dentistry Tips": { primary: "#00897B", dark: "#00695C", light: "#80cbc4" },
  "Advancements in Dentistry": { primary: "#5C6BC0", dark: "#283593", light: "#9fa8da" },
  default: { primary: "#0066CC", dark: "#004494", light: "#b3d4fc" },
};

// Different decorative background patterns — randomly selected
function getRandomShapes(theme: { primary: string; light: string }): string {
  const patterns = [
    // Pattern 1: Large circle + small circles cluster
    `<circle cx="1050" cy="130" r="180" fill="#ffffff" opacity="0.06"/>
     <circle cx="950" cy="80" r="40" fill="${theme.light}" opacity="0.08"/>
     <circle cx="1100" cy="280" r="60" fill="#ffffff" opacity="0.04"/>
     <circle cx="150" cy="500" r="220" fill="#ffffff" opacity="0.04"/>
     <circle cx="300" cy="550" r="30" fill="${theme.light}" opacity="0.06"/>`,

    // Pattern 2: Diagonal stripes + hexagon
    `<line x1="900" y1="0" x2="1200" y2="300" stroke="#ffffff" stroke-width="60" opacity="0.04"/>
     <line x1="1000" y1="0" x2="1200" y2="200" stroke="#ffffff" stroke-width="40" opacity="0.03"/>
     <polygon points="1050,80 1110,115 1110,185 1050,220 990,185 990,115" fill="#ffffff" opacity="0.06"/>
     <circle cx="120" cy="520" r="160" fill="#ffffff" opacity="0.04"/>`,

    // Pattern 3: Grid of dots
    `<circle cx="950" cy="80" r="8" fill="${theme.light}" opacity="0.15"/>
     <circle cx="1000" cy="80" r="8" fill="${theme.light}" opacity="0.12"/>
     <circle cx="1050" cy="80" r="8" fill="${theme.light}" opacity="0.15"/>
     <circle cx="1100" cy="80" r="8" fill="${theme.light}" opacity="0.12"/>
     <circle cx="975" cy="130" r="8" fill="${theme.light}" opacity="0.12"/>
     <circle cx="1025" cy="130" r="8" fill="${theme.light}" opacity="0.15"/>
     <circle cx="1075" cy="130" r="8" fill="${theme.light}" opacity="0.12"/>
     <circle cx="950" cy="180" r="8" fill="${theme.light}" opacity="0.15"/>
     <circle cx="1000" cy="180" r="8" fill="${theme.light}" opacity="0.12"/>
     <circle cx="1050" cy="180" r="8" fill="${theme.light}" opacity="0.15"/>
     <circle cx="1100" cy="180" r="8" fill="${theme.light}" opacity="0.12"/>
     <rect x="50" y="480" width="250" height="120" rx="60" fill="#ffffff" opacity="0.04"/>`,

    // Pattern 4: Triangles
    `<polygon points="1100,50 1180,200 1020,200" fill="#ffffff" opacity="0.05"/>
     <polygon points="1000,100 1040,170 960,170" fill="${theme.light}" opacity="0.07"/>
     <polygon points="200,420 300,580 100,580" fill="#ffffff" opacity="0.04"/>
     <polygon points="80,480 120,540 40,540" fill="${theme.light}" opacity="0.05"/>`,

    // Pattern 5: Concentric rings
    `<circle cx="1050" cy="160" r="180" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.08"/>
     <circle cx="1050" cy="160" r="140" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.06"/>
     <circle cx="1050" cy="160" r="100" fill="none" stroke="${theme.light}" stroke-width="2" opacity="0.08"/>
     <circle cx="1050" cy="160" r="60" fill="#ffffff" opacity="0.04"/>
     <circle cx="150" cy="500" r="150" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.05"/>
     <circle cx="150" cy="500" r="110" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.04"/>`,

    // Pattern 6: Rounded rectangles
    `<rect x="920" y="60" width="220" height="160" rx="24" fill="#ffffff" opacity="0.05"/>
     <rect x="960" y="100" width="140" height="80" rx="16" fill="${theme.light}" opacity="0.06"/>
     <rect x="60" y="460" width="180" height="130" rx="20" fill="#ffffff" opacity="0.04"/>
     <rect x="280" y="520" width="80" height="60" rx="12" fill="${theme.light}" opacity="0.05"/>`,

    // Pattern 7: Diamond shapes
    `<polygon points="1060,40 1140,150 1060,260 980,150" fill="#ffffff" opacity="0.05"/>
     <polygon points="1060,80 1110,150 1060,220 1010,150" fill="${theme.light}" opacity="0.06"/>
     <polygon points="180,450 260,530 180,610 100,530" fill="#ffffff" opacity="0.04"/>`,

    // Pattern 8: Wavy lines
    `<path d="M850,80 Q900,40 950,80 Q1000,120 1050,80 Q1100,40 1150,80" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.08"/>
     <path d="M850,130 Q900,90 950,130 Q1000,170 1050,130 Q1100,90 1150,130" fill="none" stroke="${theme.light}" stroke-width="2" opacity="0.06"/>
     <path d="M850,180 Q900,140 950,180 Q1000,220 1050,180 Q1100,140 1150,180" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.05"/>
     <circle cx="150" cy="500" r="200" fill="#ffffff" opacity="0.04"/>`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function buildFeaturedImageSvg(input: FeaturedImageInput): string {
  const theme = THEMES[input.category || ""] || THEMES.default;
  const title = escapeXml(input.title);
  const subtitle = escapeXml(input.subtitle || "");
  const category = escapeXml((input.category || "").toUpperCase());

  // Wrap title into 2-3 lines
  const titleLines = wrapText(title, 28, 3);
  const shapes = getRandomShapes(theme);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="50%" stop-color="${theme.dark}"/>
      <stop offset="100%" stop-color="#0d1b3e"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Decorative shapes -->
  ${shapes}

  <!-- Category badge -->
  ${category ? `
  <rect x="80" y="80" width="${category.length * 12 + 40}" height="42" rx="21" fill="${theme.light}"/>
  <text x="${80 + (category.length * 12 + 40) / 2}" y="108" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="${theme.dark}" text-anchor="middle" letter-spacing="1.5">${category}</text>
  ` : ""}

  <!-- Title -->
  ${titleLines.map((line, i) => `
  <text x="80" y="${240 + i * 80}" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-1">${line}</text>
  `).join("")}

  <!-- Subtitle -->
  ${subtitle ? `
  <text x="80" y="${240 + titleLines.length * 80 + 30}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="400" fill="#ffffff" opacity="0.85">${subtitle}</text>
  ` : ""}

  <!-- DentalKart brand -->
  <text x="80" y="520" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800">
    <tspan fill="#5B86B8">Dentalkart</tspan><tspan fill="#E8862A">.com</tspan>
  </text>
  <text x="80" y="558" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="400" fill="#ffffff" opacity="0.85">India's Most Trusted Online Dental Store</text>

  <!-- Decorative lines -->
  <rect x="1040" y="510" width="80" height="4" rx="2" fill="${theme.light}"/>
  <rect x="80" y="150" width="60" height="4" rx="2" fill="${theme.light}"/>
</svg>`;
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  // Truncate last line with ellipsis if we cut off
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1];
    if (last && last.length > maxChars - 3) {
      lines[lines.length - 1] = last.slice(0, maxChars - 3) + "...";
    }
  }

  return lines;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
