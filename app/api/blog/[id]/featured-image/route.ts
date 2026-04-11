import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildFeaturedImageSvg } from "@/lib/dentalkart/featured-image";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const result = await db
    .select({
      title: blogs.title,
      subtitle: blogs.subtitle,
      category: blogs.category,
    })
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const svg = buildFeaturedImageSvg({
    title: blog.title,
    subtitle: blog.subtitle || undefined,
    category: blog.category || undefined,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}
