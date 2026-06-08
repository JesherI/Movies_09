export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export interface YouTubeMetadata {
  title: string;
  thumbnailUrl: string;
  authorName: string;
  authorUrl: string;
}

export async function fetchYouTubeMetadata(
  url: string
): Promise<YouTubeMetadata | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;

    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error("oEmbed falló");

    const data = await res.json();

    return {
      title: data.title || "Sin título",
      thumbnailUrl: getThumbnailUrl(videoId),
      authorName: data.author_name || "Desconocido",
      authorUrl: data.author_url || "",
    };
  } catch {
    return {
      title: "Video sin título",
      thumbnailUrl: getThumbnailUrl(videoId),
      authorName: "Desconocido",
      authorUrl: "",
    };
  }
}
