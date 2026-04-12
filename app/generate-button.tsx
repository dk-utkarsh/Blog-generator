"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateButton() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate?force=true", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "dentalkart-cron-secret-2026"}`,
        },
      });
      const data = await res.json();
      if (data.success && data.blogId) {
        router.push(`/blog/${data.blogId}`);
      } else {
        setError(data.error || "Failed to generate blog");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
          generating
            ? "bg-slate-300 text-white cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
        }`}
      >
        {generating ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Generate New Blog
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </span>
      )}
    </div>
  );
}
