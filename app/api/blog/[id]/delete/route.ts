import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const result = await db
    .delete(blogs)
    .where(eq(blogs.id, blogId))
    .returning({ id: blogs.id });

  if (!result.length) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deletedId: result[0].id });
}
