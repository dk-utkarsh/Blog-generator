import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recentBlogs = await db
    .select({
      id: blogs.id,
      blogNumber: blogs.blogNumber,
      title: blogs.title,
      category: blogs.category,
      contentType: blogs.contentType,
      wordCount: blogs.wordCount,
      status: blogs.status,
      createdAt: blogs.createdAt,
    })
    .from(blogs)
    .orderBy(desc(blogs.createdAt))
    .limit(10);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Blogs</h2>
        <span className="text-sm text-gray-500">
          {recentBlogs.length} blogs shown
        </span>
      </div>

      {recentBlogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No blogs generated yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            The first blog will be generated on the next cron run.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentBlogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              className="block bg-white rounded-lg border p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      #{blog.blogNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        blog.status === "generated"
                          ? "bg-green-100 text-green-700"
                          : blog.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  <h3 className="font-medium">{blog.title}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-500">
                    {blog.category && <span>{blog.category}</span>}
                    {blog.contentType && <span>{blog.contentType}</span>}
                    {blog.wordCount && <span>{blog.wordCount} words</span>}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
