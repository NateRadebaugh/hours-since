import { useEffect, useRef } from "react";

const CANVAS_SIZE = 64;

function drawFavicon(text: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw rounded background
  const radius = 8;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(CANVAS_SIZE - radius, 0);
  ctx.quadraticCurveTo(CANVAS_SIZE, 0, CANVAS_SIZE, radius);
  ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE - radius);
  ctx.quadraticCurveTo(CANVAS_SIZE, CANVAS_SIZE, CANVAS_SIZE - radius, CANVAS_SIZE);
  ctx.lineTo(radius, CANVAS_SIZE);
  ctx.quadraticCurveTo(0, CANVAS_SIZE, 0, CANVAS_SIZE - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = "#4a90d9";
  ctx.fill();

  // Draw text
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Adjust font size based on text length
  const fontSize = text.length <= 4 ? 24 : text.length <= 5 ? 20 : 16;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

  return canvas.toDataURL("image/png");
}

function useFaviconBadge(hoursSince: string | undefined) {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (!hoursSince) {
      // Remove dynamic favicon if no value
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
