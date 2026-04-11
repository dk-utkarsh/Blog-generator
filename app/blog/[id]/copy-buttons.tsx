"use client";

import { useState } from "react";

interface CopyButtonsProps {
  blogId: number;
  title: string;
  htmlContent: string;
  excerpt: string;
  slug: string;
  category: string;
  editedBodyHtml?: string;
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        copied
          ? "bg-green-500 text-white"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400"
      }`}
    >
      {copied ? `✓ ${label} Copied!` : `Copy ${label}`}
    </button>
  );
}

export default function CopyButtons({
  blogId,
  title,
  htmlContent,
  excerpt,
  slug,
  category,
  editedBodyHtml,
}: CopyButtonsProps) {
  const [allCopied, setAllCopied] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    postId?: number;
  } | null>(null);

  // Use edited content if available, otherwise extract from original
  const bodyContent = editedBodyHtml
    ? editedBodyHtml
    : (() => {
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return bodyMatch ? bodyMatch[1] : htmlContent;
      })();

  // Extract style content for the full HTML with styles
  const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const styles = styleMatch ? styleMatch.join("\n") : "";
  const fullHtmlForEditor = `${styles}\n${bodyContent}`;

  const handleCopyAll = async () => {
    const allContent = `TITLE:\n${title}\n\nSLUG:\n${slug}\n\nEXCERPT:\n${excerpt}\n\nCATEGORY:\n${category}\n\nHTML CONTENT (paste in code view </>):\n${fullHtmlForEditor}`;
    await navigator.clipboard.writeText(allContent);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handlePush = async (status: "draft" | "publish") => {
    setPushing(true);
    setPushResult(null);
    try {
      const res = await fetch(`/api/push/${blogId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPushResult({
          success: true,
          message:
            status === "publish"
              ? `✓ Published to DentalKart! Post ID: ${data.postId}`
              : `✓ Pushed to DentalKart Drafts! Post ID: ${data.postId}`,
          postId: data.postId,
        });
      } else {
        setPushResult({
          success: false,
          message: `✗ Failed: ${data.error || "Unknown error"}`,
        });
      }
    } catch (err) {
      setPushResult({
        success: false,
        message: `✗ Error: ${err instanceof Error ? err.message : "Network error"}`,
      });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-blue-900">
          📋 Copy to DentalKart Admin
        </h3>
        <a
          href="https://www.dentalkart.com/blogs/admin/posts/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Admin →
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <CopyButton label="Title" value={title} />
        <CopyButton label="Slug" value={slug} />
        <CopyButton label="Excerpt" value={excerpt} />
        <CopyButton label="Category" value={category} />
        <CopyButton label="HTML Content" value={fullHtmlForEditor} />
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={handleCopyAll}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            allCopied
              ? "bg-green-500 text-white"
              : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          {allCopied ? "✓ All Copied!" : "Copy Everything"}
        </button>
        <button
          onClick={() => handlePush("draft")}
          disabled={pushing}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            pushing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
          }`}
        >
          {pushing ? "Pushing..." : "📝 Push as Draft"}
        </button>
        <button
          onClick={() => handlePush("publish")}
          disabled={pushing}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            pushing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {pushing ? "Publishing..." : "🚀 Publish to DentalKart"}
        </button>
      </div>

      {pushResult && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm font-semibold ${
            pushResult.success
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {pushResult.message}
          {pushResult.success && pushResult.postId && (
            <a
              href={`https://www.dentalkart.com/blogs/admin/posts/${pushResult.postId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              Open in Admin →
            </a>
          )}
        </div>
      )}

      <p className="text-xs text-blue-700 mt-2">
        <strong>Publish</strong> pushes the blog live with full styling preserved. <strong>Draft</strong> saves for review (don&apos;t open in editor — TipTap strips styles).
      </p>
    </div>
  );
}
