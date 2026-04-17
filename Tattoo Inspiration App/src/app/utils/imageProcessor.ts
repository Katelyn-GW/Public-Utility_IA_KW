/**
 * Processes a tattoo image to remove the background,
 * making light pixels transparent so only the dark tattoo design remains.
 * This converts photos into overlay-ready images for AR placement.
 */

const processedCache = new Map<string, string>();

export function processImageForOverlay(
  imageUrl: string,
  threshold: number = 180
): Promise<string> {
  if (processedCache.has(imageUrl)) {
    return Promise.resolve(processedCache.get(imageUrl)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");

      // Clear canvas to fully transparent before drawing (preserves PNG alpha)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // First pass: detect if image has significant transparency (PNG with alpha)
      let transparentPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 10) transparentPixels++;
      }
      const totalPixels = data.length / 4;
      const hasAlphaChannel = transparentPixels / totalPixels > 0.01;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Preserve already-transparent pixels (from PNGs with transparency)
        if (hasAlphaChannel && a < 10) {
          data[i + 3] = 0;
          continue;
        }

        // Calculate perceived brightness
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > threshold) {
          // Make light pixels fully transparent
          data[i + 3] = 0;
        } else {
          // Darken remaining pixels and make them more opaque based on darkness
          const alpha = Math.min(255, Math.round((1 - brightness / threshold) * 255 * 1.5));
          data[i + 3] = alpha;
          // Shift toward black for cleaner tattoo look
          const darkFactor = 0.4;
          data[i] = Math.round(r * darkFactor);
          data[i + 1] = Math.round(g * darkFactor);
          data[i + 2] = Math.round(b * darkFactor);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const result = canvas.toDataURL("image/png");
      processedCache.set(imageUrl, result);
      resolve(result);
    };
    img.onerror = () => reject("Failed to load image");
    img.src = imageUrl;
  });
}