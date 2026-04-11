import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogDetailClient from "./blog-detail-client";

export const dynamic = "force-dynamic";

// Category-based themes — same colors as the featured image SVG
const CATEGORY_THEMES: Record<string, { primary: string; dark: string; gradient: string; light: string; lightBorder: string }> = {
  Endodontics: { primary: "#0066CC", dark: "#004494", gradient: "linear-gradient(135deg, #0066CC 0%, #004494 50%, #1a1a2e 100%)", light: "#e8f4ff", lightBorder: "#b3d4fc" },
  Orthodontics: { primary: "#7B1FA2", dark: "#4A148C", gradient: "linear-gradient(135deg, #7B1FA2 0%, #4A148C 50%, #1a1a2e 100%)", light: "#ede7f6", lightBorder: "#b39ddb" },
  Prosthodontics: { primary: "#00A86B", dark: "#006B45", gradient: "linear-gradient(135deg, #00A86B 0%, #006B45 50%, #1a2e1a 100%)", light: "#e8f5e9", lightBorder: "#a5d6a7" },
  Periodontal: { primary: "#00838F", dark: "#004D40", gradient: "linear-gradient(135deg, #00838F 0%, #004D40 50%, #1a2e2e 100%)", light: "#e0f7fa", lightBorder: "#80deea" },
  "Aesthetic Dentistry": { primary: "#C2185B", dark: "#880E4F", gradient: "linear-gradient(135deg, #C2185B 0%, #880E4F 50%, #1a1a2e 100%)", light: "#fce4ec", lightBorder: "#f48fb1" },
  "General Dentistry": { primary: "#1976D2", dark: "#0D47A1", gradient: "linear-gradient(135deg, #1976D2 0%, #0D47A1 50%, #1a1a2e 100%)", light: "#e3f2fd", lightBorder: "#90caf9" },
  "Dentistry Tips": { primary: "#00897B", dark: "#00695C", gradient: "linear-gradient(135deg, #00897B 0%, #00695C 50%, #1a2e2e 100%)", light: "#e0f2f1", lightBorder: "#80cbc4" },
  "Advancements in Dentistry": { primary: "#5C6BC0", dark: "#283593", gradient: "linear-gradient(135deg, #5C6BC0 0%, #283593 50%, #1a1a2e 100%)", light: "#e8eaf6", lightBorder: "#9fa8da" },
};
const DEFAULT_THEME = { primary: "#0066CC", dark: "#004494", gradient: "linear-gradient(135deg, #0066CC 0%, #004494 50%, #1a1a2e 100%)", light: "#e8f4ff", lightBorder: "#b3d4fc" };

function applyThemeToHtml(html: string, category: string): string {
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  // Override the theme CSS block that was baked in during generation
  const themeOverride = `
  /* Theme override — category: ${category} */
  :root {
    --dk-blue: ${theme.primary};
    --dk-dark: ${theme.dark};
  }
  .hero { background: ${theme.gradient} !important; }
  .cta-banner { background: ${theme.gradient} !important; }
  .toc a { color: ${theme.primary} !important; }
  .toc li::before { color: ${theme.primary} !important; }
  .section h2 { border-bottom-color: ${theme.primary} !important; }
  .checklist { background: linear-gradient(135deg, ${theme.light}, white) !important; border-color: ${theme.lightBorder} !important; }
  .checklist h3 { color: ${theme.primary} !important; }
  .check-icon { background: ${theme.primary} !important; }
  .comparison-table thead { background: ${theme.dark} !important; }
  .step-num { background: ${theme.primary} !important; }
  </style>`;
  // Inject right before closing </style> so it wins over existing rules
  return html.replace(/<\/style>/i, themeOverride);
}

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

  const slug = blog.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Strip editor artifacts (.kw-x buttons) from stored HTML
  const cleanedHtml = blog.htmlContent
    ? blog.htmlContent.replace(/<span[^>]*class=["']kw-x["'][^>]*>[^<]*<\/span>/gi, "")
    : blog.htmlContent;

  // Apply category-based theme colors to the stored HTML
  const themedHtml = cleanedHtml && blog.category
    ? applyThemeToHtml(cleanedHtml, blog.category)
    : cleanedHtml;

  // Extract body and styles from themed HTML
  const bodyMatch = themedHtml?.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : "";
  const styleMatch = themedHtml?.match(
    /<style[^>]*>[\s\S]*?<\/style>/gi
  );
  const styles = styleMatch ? styleMatch.join("\n") : "";

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

        {blog.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 rounded text-red-700 text-sm">
            Error: {blog.errorMessage}
          </div>
        )}
      </div>

      {blog.htmlContent ? (
        <BlogDetailClient
          blogId={blog.id}
          title={blog.title}
          htmlContent={themedHtml!}
          bodyHtml={bodyHtml}
          styles={styles}
          excerpt={blog.subtitle || ""}
          slug={slug || ""}
          category={blog.category || ""}
        />
      ) : (
        blog.markdownContent && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-sm mb-3">Markdown Content</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {blog.markdownContent}
            </pre>
          </div>
        )
      )}
    </div>
  );
}
