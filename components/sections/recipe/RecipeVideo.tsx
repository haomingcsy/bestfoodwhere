"use client";

import { useState } from "react";

interface RecipeVideoProps {
  videoUrl: string;
  thumbnail?: string;
  title: string;
}

export function RecipeVideo({ videoUrl, thumbnail, title }: RecipeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/,
    );
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  // Generate thumbnail URL if not provided
  const thumbnailUrl =
    thumbnail ||
    (isYouTube
      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      : undefined);

  if (!isPlaying && thumbnailUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={`Video: ${title}`}
          className="h-full w-full object-cover"
        />

        {/* Play Button Overlay */}
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          aria-label="Play video"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110">
            <PlayIcon className="ml-1 h-8 w-8 text-orange-500" />
          </div>
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          Watch Video
        </div>
      </div>
    );
  }

  // Render video player
  if (isYouTube) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Self-hosted video
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <video
        src={videoUrl}
        controls
        autoPlay
        className="h-full w-full"
        poster={thumbnail}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
