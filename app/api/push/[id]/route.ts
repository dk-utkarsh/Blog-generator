import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pushBlogToDentalkart } from "@/lib/dentalkart/push";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const status: "draft" | "publish" = body.status === "draft" ? "draft" : "publish";

  const result = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog || !blog.htmlContent) {
    return NextResponse.json({ error: "Blog not found or has no content" }, { status: 404 });
  }

  const slug = blog.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Build featured image URL hosted on our app
  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : request.nextUrl.origin;
  const featuredImageUrl = `${appUrl}/api/blog/${blogId}/featured-image?format=png`;

  const pushResult = await pushBlogToDentalkart({
    title: blog.title,
    content: blog.htmlContent,
    excerpt: blog.subtitle || "",
    slug,
    categoryName: blog.category || undefined,
    status,
    featuredImageUrl,
  });

  if (!pushResult.success) {
    return NextResponse.json({ error: pushResult.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    postId: pushResult.postId,
    slug: pushResult.slug,
    status,
    publicUrl: `${process.env.DENTALKART_BLOG_URL?.replace('/blogs', '')}/blogs/blog/${pushResult.slug}`,
    adminUrl: `${process.env.DENTALKART_BLOG_URL}/admin/posts/${pushResult.postId}`,
  });
}
