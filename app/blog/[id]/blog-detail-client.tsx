"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [baseUrl, setBaseUrl] = useState("");
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleSave = useCallback((html: string) => {
    setEditedBodyHtml(html);
  }, []);

  const [deleting, setDeleting] = useState(false);
  const handleDelete = useCallback(async () => {
    const ok = window.confirm(
      `Delete this blog?\n\n"${title}"\n\nThis cannot be undone.`
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog/${blogId}/delete`, { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        window.alert(`Delete failed: ${data.error || "unknown error"}`);
        setDeleting(false);
        return;
      }
      window.location.href = "/";
    } catch (err) {
      window.alert(`Delete failed: ${err instanceof Error ? err.message : "network error"}`);
      setDeleting(false);
    }
  }, [blogId, title]);

  // Rebuild full HTML with edited body — used for copy, publish, editor
  const currentHtmlContent = useMemo(() => {
    if (!editedBodyHtml) return htmlContent;
    return htmlContent.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
      `$1${editedBodyHtml}$3`
    );
  }, [htmlContent, editedBodyHtml]);

  // Preview HTML — same as currentHtmlContent but with URL popover injected
  const previewHtmlContent = useMemo(() => {
    const previewEnhancement = `
      <style id="preview-popover-style">
        #url-popover {
          display: none;
          position: absolute;
          z-index: 9999;
          background: #1f2937;
          color: #fff;
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
          font-family: 'Inter',system-ui,sans-serif;
          font-size: 13px;
          max-width: 400px;
          word-break: break-all;
        }
        #url-popover.show { display: block; }
        #url-popover .pop-label {
          color: #9ca3af; font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.5px; margin-bottom: 4px;
        }
        #url-popover .pop-url {
          color: #60a5fa; font-size: 12px; margin-bottom: 8px;
          word-break: break-all; line-height: 1.4;
        }
        #url-popover .pop-actions { display: flex; gap: 6px; }
        #url-popover .pop-btn {
          background: #374151; color: #fff; border: none;
          padding: 4px 10px; border-radius: 6px; font-size: 11px;
          font-weight: 600; cursor: pointer;
        }
        #url-popover .pop-btn:hover { background: #4b5563; }
        #url-popover .pop-btn.primary { background: #3b82f6; }
        #url-popover .pop-btn.primary:hover { background: #2563eb; }
        a.keyword-highlight { cursor: help !important; }
      </style>
      <div id="url-popover"></div>
      <script>
        (function() {
          var pop = document.getElementById('url-popover');
          document.addEventListener('click', function(e) {
            var link = e.target.closest && e.target.closest('a.keyword-highlight');
            if (link) {
              e.preventDefault();
              var url = link.href;
              var rect = link.getBoundingClientRect();
              pop.innerHTML =
                '<div class="pop-label">Linked URL</div>' +
                '<div class="pop-url">' + url + '</div>' +
                '<div class="pop-actions">' +
                '<button class="pop-btn primary" id="pop-open">Open</button>' +
                '<button class="pop-btn" id="pop-copy">Copy</button>' +
                '<button class="pop-btn" id="pop-close">Close</button>' +
                '</div>';
              pop.style.top = (rect.bottom + window.scrollY + 8) + 'px';
              pop.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
              pop.classList.add('show');

              document.getElementById('pop-open').onclick = function() {
                window.open(url, '_blank', 'noopener,noreferrer');
              };
              document.getElementById('pop-copy').onclick = function() {
                navigator.clipboard.writeText(url);
                document.getElementById('pop-copy').textContent = 'Copied!';
              };
              document.getElementById('pop-close').onclick = function() {
                pop.classList.remove('show');
              };
              return;
            }
            if (!pop.contains(e.target)) pop.classList.remove('show');
          });
        })();
      </script>
    `;
    return currentHtmlContent.replace("</body>", previewEnhancement + "</body>");
  }, [currentHtmlContent]);

  // Auto-resize preview iframe to fit content
  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe || mode !== "preview") return;

    const resizeIframe = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc?.body) {
          iframe.style.height = `${Math.max(doc.body.scrollHeight + 40, 600)}px`;
        }
      } catch {
        // cross-origin fallback
      }
    };

    iframe.addEventListener("load", resizeIframe);
    return () => iframe.removeEventListener("load", resizeIframe);
  }, [mode, editedBodyHtml]);

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
        <div className="ml-auto">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              deleting
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            }`}
            title="Permanently delete this blog"
          >
            {deleting ? "Deleting…" : "Delete blog"}
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <BlogEditor
          blogId={blogId}
          htmlContent={currentHtmlContent}
          onSave={handleSave}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Blog Preview</h3>
            <span className="text-xs text-gray-400">HTML output</span>
          </div>
          <iframe
            ref={previewRef}
            key={editedBodyHtml ? "edited" : "original"}
            srcDoc={previewHtmlContent.replace(
              "<head>",
              `<head><base href="${baseUrl}/" />`
            )}
            className="w-full border-0 block"
            style={{ minHeight: "600px" }}
            title="Blog preview"
          />
        </div>
      )}
    </>
  );
}
