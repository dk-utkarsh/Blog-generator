import { NextRequest, NextResponse } from "next/server";
import { getLastBlogWithinHours, pruneOldBlogs, updateBlogStatus } from "@/lib/db/queries";
import { runResearch } from "@/lib/pipeline/01-research";
import { generateTopic } from "@/lib/pipeline/02-topic";
import { writeBlog } from "@/lib/pipeline/05-write-blog";
import { finalize } from "@/lib/pipeline/07-finalize";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  if (!force) {
    const recentBlog = await getLastBlogWithinHours(12);
    if (recentBlog) {
      return NextResponse.json({
        message: "Blog already generated within last 12 hours",
        lastBlog: recentBlog.title,
      });
    }
  }

  let blogId: number | null = null;

  try {
    const research = await runResearch();
    const topic = await generateTopic(research);
    blogId = topic.blogId;

    const blogContent = await writeBlog(topic, research.seasonalContext);

    const result = await finalize({
      blogContent,
      topic,
      research,
    });

    // Keep only the 20 most recent blogs to stay within free DB limits
    const pruned = await pruneOldBlogs(20);
    if (pruned.deleted > 0) {
      console.log(`[Generate] Pruned ${pruned.deleted} old blogs`);
    }

    return NextResponse.json({
      success: true,
      blogId: result.blogId,
      title: result.title,
      wordCount: blogContent.wordCount,
      prunedCount: pruned.deleted,
    });
  } catch (error) {
    console.error("Blog generation failed:", error);

    if (blogId) {
      await updateBlogStatus(
        blogId,
        "failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
