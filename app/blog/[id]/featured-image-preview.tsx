"use client";

interface FeaturedImagePreviewProps {
  blogId: number;
}

export default function FeaturedImagePreview({ blogId }: FeaturedImagePreviewProps) {
  return (
    <div className="mb-6 bg-white rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Featured Image</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Auto-generated from title. This image is uploaded when you publish to DentalKart.
        </p>
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
