// Resolves a pasted video link to an embeddable player URL, where the
// platform actually supports embedding (YouTube, Vimeo). Other links
// (Instagram, Facebook, TikTok, etc.) can't be embedded inline anywhere
// on the web without the platform's own login-gated SDK, so callers
// should fall back to opening those as a plain external link.
export function getEmbeddableVideoUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId =
      parsed.searchParams.get("v") ||
      (parsed.pathname.startsWith("/shorts/") ? parsed.pathname.split("/")[2] : null) ||
      (parsed.pathname.startsWith("/embed/") ? parsed.pathname.split("/")[2] : null);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (host === "youtu.be") {
    const videoId = parsed.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (host === "vimeo.com") {
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];
    return videoId && /^\d+$/.test(videoId) ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  return null;
}
