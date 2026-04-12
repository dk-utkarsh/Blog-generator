import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import GenerateButton from "./generate-button";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  Endodontics: "bg-blue-50 text-blue-700 border-blue-200",
  Orthodontics: "bg-purple-50 text-purple-700 border-purple-200",
  Prosthodontics: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Periodontal: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Aesthetic Dentistry": "bg-pink-50 text-pink-700 border-pink-200",
  "General Dentistry": "bg-sky-50 text-sky-700 border-sky-200",
  "Dentistry Tips": "bg-teal-50 text-teal-700 border-teal-200",
  "Advancements in Dentistry": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default async function HomePage() {
  const recentBlogs = await db
    .select({
      id: blogs.id,
      blogNumber: blogs.blogNumber,
      title: blogs.title,
      subtitle: blogs.subtitle,
      category: blogs.category,
      contentType: blogs.contentType,
      wordCount: blogs.wordCount,
      status: blogs.status,
      createdAt: blogs.createdAt,
    })
    .from(blogs)
    .orderBy(desc(blogs.createdAt))
    .limit(20);

  const generatedCount = recentBlogs.filter((b) => b.status === "generated").length;
  const totalWords = recentBlogs.reduce((sum, b) => sum + (b.wordCount || 0), 0);

  return (
    <div>
      {/* Hero section */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-10">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              DentalKart Content Studio
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Research.{" "}
              <span className="inline-block relative align-baseline w-[220px] md:w-[300px] h-[1.1em]">
                <GooeyText
                  texts={["Write.", "Refine.", "Publish.", "Repeat."]}
                  morphTime={1}
                  cooldownTime={1.8}
                  className="w-full h-full"
                  textClassName="text-4xl md:text-5xl font-bold tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                />
              </span>
            </h1>
            <p className="text-base text-slate-600 mt-3 max-w-lg leading-relaxed">
              Clinically accurate dental content, ready to publish on{" "}
              <span className="font-semibold text-slate-900">DentalKart.com</span>{" "}
              — powered by AI, refined by you.
            </p>
          </div>
          <GenerateButton />
        </div>
      </div>

      {/* Stats bar */}
      {recentBlogs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Blogs
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {recentBlogs.length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Ready to Publish
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">
              {generatedCount}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Words
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {totalWords.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Blogs list */}
      {recentBlogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No blogs yet</h3>
          <p className="text-sm text-slate-500">
            Click &quot;Generate New Blog&quot; to create your first AI-powered blog post
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentBlogs.map((blog) => {
            const categoryClass =
              CATEGORY_COLORS[blog.category || ""] ||
              "bg-slate-50 text-slate-700 border-slate-200";
            return (
              <Link
                key={blog.id}
                href={`/blog/${blog.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-slate-400">
                        #{blog.blogNumber}
                      </span>
                      {blog.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium ${categoryClass}`}
                        >
                          {blog.category}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          blog.status === "generated"
                            ? "bg-emerald-100 text-emerald-700"
                            : blog.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {blog.status === "generated"
                          ? "Ready"
                          : blog.status === "failed"
                            ? "Failed"
                            : "Generating"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {blog.title}
                    </h3>
                    {blog.subtitle && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                        {blog.subtitle}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                      {blog.contentType && <span>{blog.contentType}</span>}
                      {blog.wordCount && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {blog.wordCount} words
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
