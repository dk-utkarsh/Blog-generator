import { NextRequest, NextResponse } from "next/server";
import { getLastBlogWithinHours, updateBlogStatus } from "@/lib/db/queries";
import { runResearch } from "@/lib/pipeline/01-research";
import { generateTopic } from "@/lib/pipeline/02-topic";
import { writeBlog } from "@/lib/pipeline/05-write-blog";
import { generateImages } from "@/lib/pipeline/06-images";
import { finalize } from "@/lib/pipeline/07-finalize";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cooldown: skip if a blog was generated recently, unless ?force=true
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
    // Step 1: Research (PubMed + seasonal context)
    const research = await runResearch();

    // Step 2: Topic Generation
    const topic = await generateTopic(research);
    blogId = topic.blogId;

    // Step 3: Blog Writing (universal content, no product references)
    const blogContent = await writeBlog(topic, research.seasonalContext);

    // Step 4: Image Generation (AI-planned infographics)
    const images = await generateImages(
      topic.title,
      topic.mainSections,
      topic.category,
      blogContent.markdown
    );

    // Step 5: Finalize (save to database)
    const result = await finalize({
      blogContent,
      topic,
      products: [],
      images,
      research,
    });

    return NextResponse.json({
      success: true,
      blogId: result.blogId,
      title: result.title,
      wordCount: blogContent.wordCount,
      imagesGenerated: images.length,
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
