import { useEffect, useRef } from "react";

const CANVAS_SIZE = 128;

function drawFavicon(text: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  // Fill solid dark background for maximum contrast
  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw text as large as possible
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Scale font to fill the canvas width
  const fontSize = text.length <= 3 ? 72 : text.length <= 4 ? 58 : 46;
  ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`;
  // +2 offset for optical vertical centering with heavyweight font
  ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 2);

  return canvas.toDataURL("image/png");
}

function useFaviconBadge(hoursSince: string | undefined) {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (!hoursSince || hoursSince.includes("NaN")) {
      // Remove dynamic favicon if no valid value
      if (linkRef.current) {
        linkRef.current.remove();
        linkRef.current = null;
      }
      return;
    }

    const dataUrl = drawFavicon(hoursSince);
    if (!dataUrl) {
      return;
    }

    if (!linkRef.current) {
      // Remove any existing favicons first
      const existing = document.querySelectorAll("link[rel*='icon']");
      existing.forEach((el) => el.remove());

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      document.head.appendChild(link);
      linkRef.current = link;
    }

    linkRef.current.href = dataUrl;

    return () => {
      if (linkRef.current) {
        linkRef.current.remove();
        linkRef.current = null;
      }
    };
  }, [hoursSince]);
}

export default useFaviconBadge;
