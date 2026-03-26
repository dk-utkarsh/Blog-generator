import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_TEXT_MODEL } from "../config";

const QUALITY =
  "3D render, photorealistic, hyperrealistic, octane render, cinema 4D, ray tracing, 8K ultra HD, studio lighting, detailed texturing, global illumination, depth of field, volumetric lighting";

const PROVEN_STYLES = [
  {
    name: "Soft Pastel Clay Art",
    desc: "Soft pastel 3D paper-craft/clay aesthetic. Mint green and coral/salmon colour palette. Zen garden background with smooth stones, bonsai tree, and sand ripple patterns. Central dental element on a circular platform. Surrounding info cards in rounded mint-green rectangles with coral accents. Dental icons in matching pastel style. Warm soft lighting with subtle shadows. Premium dental spa brochure quality.",
    example:
      "Central tooth/tray model surrounded by labelled cards (Material Mix, Tray Selection, etc.) on zen garden background",
  },
  {
    name: "Dark Premium Dashboard",
    desc: "Dark premium background with white marble walls and marble floor with reflections. Gold metallic frame borders around info cards. Central dental X-ray or scan image glowing with blue/orange highlights. Surrounding dark navy cards with neon blue icons, bold white percentage numbers, and smaller description text. Dramatic spotlight from above. Gold accent lines. High-end medical technology showcase quality.",
    example:
      "Central panoramic X-ray surrounded by stat cards (95% Accuracy, 70% Acceptance, 50% Faster) on marble background",
  },
  {
    name: "Split Comparison Scene",
    desc: "Dramatic split-screen comparison layout. Left side: warm red/orange tinted desk scene showing the old/manual/problematic approach with scattered papers, old phone, warning labels. Right side: cool green/blue tinted modern scene showing the new/digital/solution approach with tablets, smartphones, apps. Golden bridge or gear mechanism connecting both sides at centre. Neon label cards on each side. Dark dramatic background with spotlight beams. Before-versus-after transformation quality.",
    example:
      "Old messy desk on left, modern digital setup on right, golden bridge connecting them",
  },
  {
    name: "Clinical Clarity Showcase",
    desc: "Bright, clean dental clinic background (blurred). Central 3D dental model (tooth cross-section, dental impression, jaw model) on a platform. Floating info cards in pastel coral/mint with rounded corners connected by dotted lines or ribbons. Each card has a dental icon and 2-word label. Soft ambient lighting. Clean, editorial, medical magazine quality. Dental textbook illustration meets modern design.",
    example:
      "Central tooth model with X-ray and dental photos as floating cards, benefit labels on the right side",
  },
];

interface ImagePlan {
  caption: string;
  style: string;
  centralElement: string;
  infoCards: string[];
  background: string;
}

export async function buildImagePrompts(
  title: string,
  sections: string[],
  category: string,
  blogMarkdown: string
): Promise<{ prompt: string; caption: string }[]> {
  const planningPrompt = `You are designing 5 premium dental infographic images for a professional blog. Read the blog content carefully and create image concepts that visually represent the key information.

BLOG TITLE: "${title}"
CATEGORY: ${category}
SECTIONS:
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

BLOG CONTENT (for reference):
${blogMarkdown.substring(0, 3000)}

═══ INFOGRAPHIC DESIGN REQUIREMENTS ═══

Every image must be a STRUCTURED 3D INFOGRAPHIC containing:
1. A CENTRAL dental visual — a 3D tooth model, dental anatomy cross-section, X-ray scan, jaw model, dental tray, or dental concept icon
2. SURROUNDING info cards (2-4 per image) — each card has an icon, a bold title or statistic, and an optional short description
3. A PREMIUM background — marble surface, zen garden, blurred clinic interior, or colour gradient
4. A CLEAR heading or title text at the top of the image
5. High-quality 3D rendering with rich textures, professional lighting, and visual depth

═══ 4 VISUAL STYLES — ROTATE THROUGH THESE ═══

Style A — SOFT PASTEL CLAY ART:
${PROVEN_STYLES[0].desc}

Style B — DARK PREMIUM DASHBOARD:
${PROVEN_STYLES[1].desc}

Style C — SPLIT COMPARISON SCENE:
${PROVEN_STYLES[2].desc}

Style D — CLINICAL CLARITY SHOWCASE:
${PROVEN_STYLES[3].desc}

═══ YOUR TASK ═══

Design 5 image concepts. For each image:
1. Select a style (A, B, C, or D) — use at least 3 different styles across the 5 images
2. Choose a CENTRAL dental visual that is directly relevant to that blog section
3. Design 2-4 info cards with SHORT labels extracted from the actual blog content (real statistics, real benefits, real clinical terms)
4. Write a HEADING for the top of the image (5-8 words, matching the section topic)

STRICT RULES:
- NO human faces, no people, no full human bodies
- NO brand names or logos
- Central elements must be dental anatomy models, X-rays, impressions, jaw cross-sections, dental trays, or conceptual dental shapes
- Info card labels must come from the blog content — use actual terms, numbers, and benefits mentioned in the article

OUTPUT: Strict JSON array, no markdown code blocks, no extra text.
[
  {
    "caption": "5-8 word heading that appears ON the image",
    "style": "A or B or C or D",
    "centralElement": "Detailed description of the 3D dental visual in the centre",
    "infoCards": ["Icon + label (e.g., 'magnifying glass icon + 95% Accuracy')", "Icon + label", "Icon + label"],
    "background": "Description of the background setting"
  }
]`;

  try {
    const { text } = await generateText({
      model: google(GEMINI_TEXT_MODEL),
      prompt: planningPrompt,
    });

    const cleanJson = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const imagePlan: ImagePlan[] = JSON.parse(cleanJson);

    if (!Array.isArray(imagePlan) || imagePlan.length === 0) {
      throw new Error("AI returned empty or invalid image plan");
    }

    return imagePlan.slice(0, 5).map((img) => {
      const styleKey = (img.style || "A").toUpperCase();
      const styleIdx =
        styleKey === "B" ? 1 : styleKey === "C" ? 2 : styleKey === "D" ? 3 : 0;
      const style = PROVEN_STYLES[styleIdx];

      return {
        prompt: `Create a premium 3D rendered dental infographic image.

HEADING AT TOP: "${img.caption}"

CENTRAL ELEMENT: ${img.centralElement}
This should be a detailed, beautiful 3D render — the hero visual of the image.

INFO CARDS AROUND THE CENTRAL ELEMENT:
${img.infoCards.map((c, i) => `Card ${i + 1}: ${c}`).join("\n")}
Each card should be a rounded rectangle with an icon, bold text, and optional description.

BACKGROUND: ${img.background}

EXACT VISUAL STYLE:
${style.desc}

RENDERING QUALITY:
${QUALITY}
- Premium dental industry infographic composition
- Rich 3D textures on the central dental element
- Cards with glassmorphism or solid coloured backgrounds with soft shadows
- Include all text labels as described — they are integral to the infographic design
- NO human faces or bodies anywhere in the image
- NO brand names or logos
- Balanced, clean, professional composition`,
        caption: img.caption,
      };
    });
  } catch (error) {
    console.error("[Image Planning] AI planning failed, using fallback:", error);
    return buildFallbackPrompts(title, sections, category);
  }
}

function buildFallbackPrompts(
  title: string,
  sections: string[],
  category: string
): { prompt: string; caption: string }[] {
  return sections.slice(0, 5).map((section, i) => {
    const style = PROVEN_STYLES[i % PROVEN_STYLES.length];
    return {
      prompt: `Create a premium 3D dental infographic about "${section}" for the topic of ${category}.

HEADING AT TOP: "${section}"

CENTRAL ELEMENT: A detailed 3D tooth model or dental anatomy cross-section relevant to ${section}.
Surrounding info cards: 3 rounded rectangles with dental icons and short clinical labels related to ${section}.

VISUAL STYLE:
${style.desc}

RENDERING:
${QUALITY}
- NO human faces or bodies
- NO brand names or logos
- Professional, clean, balanced infographic layout`,
      caption: section,
    };
  });
}
