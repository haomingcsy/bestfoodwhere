function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    const match = parsed.pathname.match(/\/(shorts|embed)\/([^/]+)/);
    if (match?.[2]) return match[2];
    return null;
  } catch {
    return null;
  }
}

interface Props {
  url: string;
}

export function VideoEmbed({ url }: Props) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="mb-5">
        <h2 className="text-[26px] font-bold text-gray-900">Video</h2>
        <div className="mt-4 h-[3px] w-10 bg-[#e74c3c]" />
      </div>
      <div className="overflow-hidden rounded-xl bg-black">
        <div className="aspect-[16/9] w-full">
          <iframe
            title="YouTube video"
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
