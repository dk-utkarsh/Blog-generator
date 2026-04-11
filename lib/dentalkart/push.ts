import sharp from "sharp";
import { getDentalkartToken } from "./auth";
import { buildFeaturedImageSvg } from "./featured-image";

const DENTALKART_URL = process.env.DENTALKART_BLOG_URL || "https://www.dentalkart.com/blogs";

export interface PushBlogInput {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  categoryName?: string;
  status?: "draft" | "publish";
}

export interface PushBlogResult {
  success: boolean;
  postId?: number;
  slug?: string;
  error?: string;
}

/**
 * Push a blog to DentalKart as a draft.
 * Automatically handles auth token refresh.
 */
export async function pushBlogToDentalkart(
  input: PushBlogInput
): Promise<PushBlogResult> {
  try {
    const token = await getDentalkartToken();

    // Resolve category name → ID (if provided)
    let categoryIds: number[] = [];
    if (input.categoryName) {
      categoryIds = await resolveCategoryIds(token, input.categoryName);
    }

    // Extract just the inner content (body) with styles for the editor
    const editorContent = extractEditorContent(input.content);

    // Generate and upload featured image
    let featuredImageUrl: string | null = null;
    try {
      featuredImageUrl = await generateAndUploadFeaturedImage(token, {
        title: input.title,
        subtitle: input.excerpt,
        category: input.categoryName,
      });
      console.log("[Push] Featured image uploaded:", featuredImageUrl);
    } catch (err) {
      console.warn("[Push] Featured image upload failed:", err);
    }

    const response = await fetch(`${DENTALKART_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth-token=${token}`,
      },
      body: JSON.stringify({
        title: input.title,
        content: editorContent,
        excerpt: input.excerpt,
        slug: input.slug,
        status: input.status || "publish",
        categories: categoryIds,
        featuredImage: featuredImageUrl,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `DentalKart API error: ${response.status} ${text}` };
    }

    const data = await response.json();
    return { success: true, postId: data.id, slug: data.slug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function resolveCategoryIds(token: string, categoryName: string): Promise<number[]> {
  try {
    const response = await fetch(`${DENTALKART_URL}/api/categories`, {
      headers: { Cookie: `auth-token=${token}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const cats = Array.isArray(data) ? data : data.categories || [];
    const match = cats.find(
      (c: { id: number; name: string }) =>
        c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return match ? [match.id] : [];
  } catch {
    return [];
  }
}

function extractEditorContent(fullHtml: string): string {
  // Extract body content
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;

  // Extract style blocks
  const styles = fullHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];

  // Combine: styles first, then body content
  return `${styles.join("\n")}\n${body}`.trim();
}

async function generateAndUploadFeaturedImage(
  token: string,
  input: { title: string; subtitle?: string; category?: string }
): Promise<string | null> {
  // Generate SVG and rasterize to PNG
  const svg = buildFeaturedImageSvg(input);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  // Build multipart form data
  const filename = `featured-${Date.now()}.png`;
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pngBuffer)], { type: "image/png" });
  formData.append("file", blob, filename);

  const response = await fetch(`${DENTALKART_URL}/api/media`, {
    method: "POST",
    headers: {
      Cookie: `auth-token=${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Media upload failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  console.log("[Push] Media upload response:", JSON.stringify(data));
  return data.url || data.imageUrl || data.filePath || null;
}
