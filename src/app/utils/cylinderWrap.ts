export const drawCylinderWrappedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  options?: {
    strength?: number;
    slices?: number;
    flipX?: boolean;
    flipY?: boolean;
    alpha?: number;
  }
) => {
  const strength = options?.strength ?? 0.32;
  const slices = options?.slices ?? 56;
  const flipX = options?.flipX ?? false;
  const flipY = options?.flipY ?? false;
  const alpha = options?.alpha ?? 0.9;

  const sourceW = img.naturalWidth || img.width;
  const sourceH = img.naturalHeight || img.height;
  if (!sourceW || !sourceH || width <= 0 || height <= 0) return;

  const widths: number[] = [];
  let totalWidth = 0;
  for (let i = 0; i < slices; i += 1) {
    const t = (i + 0.5) / slices;
    const u = t * 2 - 1; // [-1, 1]
    const pinch = 1 - strength * (u * u); // narrower at edges, fuller center
    const bandW = (width / slices) * pinch;
    widths.push(bandW);
    totalWidth += bandW;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

  const xSign = flipX ? -1 : 1;
  const ySign = flipY ? -1 : 1;
  let dx = (-totalWidth / 2) * xSign;
  const dy = (-height / 2) * ySign;
  const sw = sourceW / slices;
  const overlap = 0.8; // soft overlap between strips to avoid visible seams

  for (let i = 0; i < slices; i += 1) {
    const sx = i * sw;
    const dw = widths[i] * xSign;
    const drawW = (Math.abs(dw) + overlap) * xSign;
    ctx.drawImage(
      img,
      sx,
      0,
      sw,
      sourceH,
      dx,
      dy,
      drawW,
      height * ySign
    );
    dx += dw;
  }

  // Subtle edge darkening + center lift to enhance cylindrical perception.
  const edgeShade = Math.min(0.22, 0.12 + strength * 0.32);
  const edgeGrad = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
  edgeGrad.addColorStop(0, `rgba(0,0,0,${edgeShade})`);
  edgeGrad.addColorStop(0.18, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.5, "rgba(255,255,255,0.06)");
  edgeGrad.addColorStop(0.82, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(1, `rgba(0,0,0,${edgeShade})`);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
};
