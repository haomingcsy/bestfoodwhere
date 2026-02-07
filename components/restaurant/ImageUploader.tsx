"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  type: "logo" | "cover" | "gallery";
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
  description?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  type,
  currentUrl,
  onUpload,
  onRemove,
  label,
  description,
  aspectRatio = "aspect-video",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const maxSize = type === "cover" ? 10 : 5;

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/restaurant/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }

      onUpload(data.url);
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-heading text-sm font-medium text-gray-700">
        {label}
      </label>
      {description && (
        <p className="font-body text-xs text-gray-500">{description}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {currentUrl ? (
        <div className="relative">
          <div
            className={`relative overflow-hidden rounded-xl border border-gray-200 ${aspectRatio}`}
          >
            <Image
              src={currentUrl}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 font-body text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 font-body text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-bfw-orange bg-bfw-orange/5"
              : "border-gray-200 hover:border-bfw-orange hover:bg-bfw-orange/5"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
              <p className="font-body text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 font-body text-sm text-gray-600">
                <span className="font-medium text-bfw-orange">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="mt-1 font-body text-xs text-gray-400">
                JPG, PNG or WebP (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
    </div>
  );
}
