"use client";

import { useCallback, useState } from "react";

interface FeaturedImagePreviewProps {
  blogId: number;
}

export default function FeaturedImagePreview({ blogId }: FeaturedImagePreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/blog/${blogId}/featured-image`);
      const svgText = await res.text();

      // Render SVG to canvas then download as PNG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 1200, 630);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `featured-image-${blogId}.png`;
          a.click();
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, "image/png");
      };
      img.onerror = () => setDownloading(false);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
    } catch {
      setDownloading(false);
    }
  }, [blogId]);

  return (
    <div className="mb-6 bg-white rounded-lg border overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Featured Image</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Download and upload to DentalKart admin &rarr; Featured Image
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            downloading
              ? "bg-gray-200 text-gray-400"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {downloading ? "Downloading..." : "Download PNG"}
        </button>
      </div>
      <div className="p-4 flex justify-center bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/blog/${blogId}/featured-image`}
          alt="Featured image preview"
          className="rounded-lg shadow-sm max-w-full"
          style={{ maxHeight: "315px" }}
        />
      </div>
    </div>
  );
}
