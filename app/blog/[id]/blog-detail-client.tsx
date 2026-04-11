"use client";

import { useState, useCallback, useMemo } from "react";
import CopyButtons from "./copy-buttons";
import BlogEditor from "./blog-editor";
import FeaturedImagePreview from "./featured-image-preview";

interface BlogDetailClientProps {
  blogId: number;
  title: string;
  htmlContent: string;
  bodyHtml: string;
  styles: string;
  excerpt: string;
  slug: string;
  category: string;
}

export default function BlogDetailClient({
  blogId,
  title,
  htmlContent,
  bodyHtml,
  styles,
  excerpt,
  slug,
  category,
}: BlogDetailClientProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [editedBodyHtml, setEditedBodyHtml] = useState<string | null>(null);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const handleSave = useCallback((html: string) => {
    setEditedBodyHtml(html);
  }, []);

  // Rebuild full HTML with edited body for preview
  const currentHtmlContent = useMemo(() => {
    if (!editedBodyHtml) return htmlContent;
    return htmlContent.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
      `$1${editedBodyHtml}$3`
    );
  }, [htmlContent, editedBodyHtml]);

  return (
    <>
      <FeaturedImagePreview blogId={blogId} />

      <CopyButtons
        blogId={blogId}
        title={title}
        htmlContent={currentHtmlContent}
        excerpt={excerpt}
        slug={slug}
        category={category}
        editedBodyHtml={editedBodyHtml || undefined}
      />

      {/* Edit / Preview toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode("preview")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === "preview"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === "edit"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Edit
          </button>
        </div>
        {editedBodyHtml && (
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
            Changes saved — preview and publish use the updated version
          </span>
        )}
      </div>

      {mode === "edit" ? (
        <BlogEditor
          blogId={blogId}
          htmlContent={currentHtmlContent}
          onSave={handleSave}
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Blog Preview</h3>
            <span className="text-xs text-gray-400">HTML output</span>
          </div>
          <iframe
            key={editedBodyHtml ? "edited" : "original"}
            srcDoc={currentHtmlContent.replace(
              "<head>",
              `<head><base href="${baseUrl}/" />`
            )}
            className="w-full border-0"
            style={{ minHeight: "800px" }}
            title="Blog preview"
          />
        </div>
      )}
    </>
  );
}
