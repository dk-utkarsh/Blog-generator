import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const body = await request.json();
  const { htmlContent } = body;

  if (!htmlContent || typeof htmlContent !== "string") {
    return NextResponse.json(
      { error: "htmlContent is required" },
      { status: 400 }
    );
  }

  const result = await db
    .select({ htmlContent: blogs.htmlContent })
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog || !blog.htmlContent) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  // Replace the body content in the full HTML document
  const updatedFullHtml = blog.htmlContent.replace(
    /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
    `$1${htmlContent}$3`
  );

  // Recalculate word count
  const textOnly = htmlContent
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = textOnly.split(" ").filter(Boolean).length;

  await db
    .update(blogs)
    .set({ htmlContent: updatedFullHtml, wordCount })
    .where(eq(blogs.id, blogId));

  return NextResponse.json({ success: true, wordCount });
}
