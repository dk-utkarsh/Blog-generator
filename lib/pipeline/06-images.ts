import { buildImagePrompts } from "../prompts/image-generation";
import { GEMINI_IMAGE_MODEL } from "../config";

interface GeneratedImage {
  url: string;
  caption: string;
  prompt: string;
}

export async function generateImages(
  title: string,
  sections: string[],
  category: string,
  blogMarkdown: string = ""
): Promise<GeneratedImage[]> {
  console.log("[Step 6] Generating images...");

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("[Step 6] No GEMINI_API_KEY found — skipping image generation");
    return [];
  }

  console.log("[Step 6] AI is planning image concepts...");
  const imagePrompts = await buildImagePrompts(
    title,
    sections,
    category,
    blogMarkdown
  );
  const results: GeneratedImage[] = [];

  for (const { prompt, caption } of imagePrompts) {
    try {
      console.log(`[Step 6] Generating image: "${caption}"...`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[Step 6] Image generation failed: ${response.status} — ${errorText}`
        );
        continue;
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(
        (p: { inlineData?: { mimeType: string; data: string } }) =>
          p.inlineData?.mimeType?.startsWith("image/")
      );

      if (imagePart?.inlineData) {
        const mimeType = imagePart.inlineData.mimeType;
        const base64Data = imagePart.inlineData.data;
        let imageUrl: string;

        // Use Vercel Blob in production, local file system for testing
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        if (blobToken && !blobToken.startsWith("your_")) {
          const { put } = await import("@vercel/blob");
          const buffer = Buffer.from(base64Data, "base64");
          const filename = `blog-images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
          const blob = await put(filename, buffer, {
            access: "public",
            contentType: mimeType,
          });
          imageUrl = blob.url;
        } else {
          const fs = await import("fs");
          const path = await import("path");
          const dir = path.join(process.cwd(), "public", "blog-images");
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
          const filePath = path.join(dir, fname);
          const buffer = Buffer.from(base64Data, "base64");
          fs.writeFileSync(filePath, buffer);
          imageUrl = `/blog-images/${fname}`;
          console.log(`[Step 6] Saved image locally: ${imageUrl}`);
        }

        results.push({ url: imageUrl, caption, prompt });
        console.log(`[Step 6] Image generated: "${caption}"`);
      } else {
        console.warn(`[Step 6] No image data in response for: "${caption}"`);
      }
    } catch (error) {
      console.error(`[Step 6] Image generation error for "${caption}":`, error);
    }
  }

  console.log(`[Step 6] Generated ${results.length} of ${imagePrompts.length} images`);
  return results;
}
