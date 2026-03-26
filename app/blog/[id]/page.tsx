import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) notFound();

  const result = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog) notFound();

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 text-sm hover:underline mb-4 inline-block"
      >
        &larr; Back to all blogs
      </Link>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono text-gray-400">
            Blog #{blog.blogNumber}
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
        <h2 className="text-xl font-bold mb-1">{blog.title}</h2>
        {blog.subtitle && (
          <p className="text-gray-500 text-sm">{blog.subtitle}</p>
        )}

        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          {blog.category && <span>Category: {blog.category}</span>}
          {blog.contentType && <span>Type: {blog.contentType}</span>}
          {blog.wordCount && <span>{blog.wordCount} words</span>}
          {blog.createdAt && (
            <span>
              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {blog.productsUsed && (
          <div className="mt-3">
            <span className="text-xs font-semibold text-gray-500">
              Products:{" "}
            </span>
            <span className="text-xs text-gray-400">
              {(blog.productsUsed as { name: string }[])
                .map((p) => p.name)
                .join(", ")}
            </span>
          </div>
        )}

        {blog.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 rounded text-red-700 text-sm">
            Error: {blog.errorMessage}
          </div>
        )}
      </div>

      {blog.htmlContent && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Blog Preview</h3>
            <span className="text-xs text-gray-400">HTML output</span>
          </div>
          <iframe
            srcDoc={blog.htmlContent.replace(
              "<head>",
              `<head><base href="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/" />`
            )}
            className="w-full border-0"
            style={{ minHeight: "800px" }}
            title="Blog preview"
          />
        </div>
      )}

      {blog.markdownContent && !blog.htmlContent && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-sm mb-3">Markdown Content</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {blog.markdownContent}
          </pre>
        </div>
      )}
    </div>
  );
}
