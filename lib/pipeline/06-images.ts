import { put } from "@vercel/blob";
import { buildImagePrompts } from "../prompts/image-generation";

interface GeneratedImage {
  url: string;
  caption: string;
  prompt: string;
}

export async function generateImages(
  title: string,
  sections: string[],
  category: string
): Promise<GeneratedImage[]> {
  console.log("[Step 6] Generating images...");

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("[Step 6] No GEMINI_API_KEY — skipping image generation");
    return [];
  }

  const imagePrompts = buildImagePrompts(title, sections, category);
  const results: GeneratedImage[] = [];

  for (const { prompt, caption } of imagePrompts) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        }
      );

      if (!response.ok) {
        console.error(`[Step 6] Image generation failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const filename = `blog-images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

          const blob = await put(filename, buffer, {
            access: "public",
            contentType: part.inlineData.mimeType,
          });

          results.push({
            url: blob.url,
            caption,
            prompt,
          });
          break;
        }
      }
    } catch (error) {
      console.error("[Step 6] Image generation error:", error);
    }
  }

  console.log(`[Step 6] Generated ${results.length} images`);
  return results;
}
