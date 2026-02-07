"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface GalleryManagerProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export function GalleryManager({
  images,
  onImagesChange,
  maxImages = 10,
}: GalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = images.length < maxImages;

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "gallery");

      const response = await fetch("/api/restaurant/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }

      onImagesChange([...images, data.url]);
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-heading text-sm font-medium text-gray-700">
          Gallery Images
        </label>
        <span className="font-body text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>
      <p className="font-body text-xs text-gray-500">
        Add photos of your restaurant, food, and ambiance
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((url, index) => (
          <div key={index} className="group relative aspect-square">
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed transition ${
              isUploading
                ? "cursor-not-allowed border-gray-200 bg-gray-50"
                : "cursor-pointer border-gray-200 hover:border-bfw-orange hover:bg-bfw-orange/5"
            }`}
          >
            {isUploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-bfw-orange border-t-transparent" />
            ) : (
              <>
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="mt-1 font-body text-xs text-gray-500">
                  Add Image
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
    </div>
  );
}
