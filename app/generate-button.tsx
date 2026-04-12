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
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
          generating
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
        }`}
      >
        {generating ? "⏳ Generating..." : "✨ Generate New Blog"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
