import { NextRequest, NextResponse } from "next/server";
import { getLastBlogWithinHours, updateBlogStatus } from "@/lib/db/queries";
import { runResearch } from "@/lib/pipeline/01-research";
import { generateTopic } from "@/lib/pipeline/02-topic";
import { scrapeProducts, extractSearchKeyword } from "@/lib/pipeline/03-products";
import { enrichAndSelectProducts } from "@/lib/pipeline/04-enrich";
import { writeBlog } from "@/lib/pipeline/05-write-blog";
import { generateImages } from "@/lib/pipeline/06-images";
import { finalize } from "@/lib/pipeline/07-finalize";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recentBlog = await getLastBlogWithinHours(12);
  if (recentBlog) {
    return NextResponse.json({
      message: "Blog already generated within last 12 hours",
      lastBlog: recentBlog.title,
    });
  }

  let blogId: number | null = null;

  try {
    // Step 1: Research
    const research = await runResearch();

    // Step 2: Topic Generation
    const topic = await generateTopic(research);
    blogId = topic.blogId;

    // Step 3: Product Scraping
    const searchKeyword = extractSearchKeyword(topic.title, topic.searchKeyword);
    const rawProducts = await scrapeProducts(searchKeyword);

    // Step 4: Product Enrichment
    const products = enrichAndSelectProducts(rawProducts, searchKeyword);

    // Step 5: Blog Writing
    const blogContent = await writeBlog(topic, products, research.seasonalContext);

    // Step 6: Image Generation
    const images = await generateImages(topic.title, topic.mainSections, topic.category);

    // Step 7: Finalize
    const result = await finalize({
      blogContent,
      topic,
      products,
      images,
      research,
    });

    return NextResponse.json({
      success: true,
      blogId: result.blogId,
      title: result.title,
      wordCount: blogContent.wordCount,
      imagesGenerated: images.length,
      productsIncluded: products.length,
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
