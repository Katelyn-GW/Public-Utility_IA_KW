/**
 * Plus-marker tracking via normalized cross-correlation on a *downscaled*
 * luminance copy of the camera frame. One full-frame draw per update avoids
 * many WebKit bugs with small sub-rect draws from <video> to <canvas>.
 */

export const TRACK_MAX_W = 320;
/** Patch side in *track* pixels (odd) */
export const PATCH_TRK = 17;
export const PATCH_TRK_HALF = (PATCH_TRK - 1) / 2;
/** Search half-extent in track pixels around predicted center */
export const SEARCH_PAD_TRK = 42;
export const SEARCH_STEP = 3;

export type VideoPixel = { vx: number; vy: number };

type ObjectFitLayout = {
  dispW: number;
  dispH: number;
  offX: number;
  offY: number;
  /** true = use linear stretch (legacy fill); false = map via disp + offset */
  linearStretch: boolean;
};

/**
 * Map between container/element coordinates and intrinsic video pixels when the
 * element uses object-fit: cover | contain (mobile AR uses object-cover).
 */
function getVideoObjectFitLayout(
  video: HTMLVideoElement,
  dw: number,
  dh: number,
  vw: number,
  vh: number
): ObjectFitLayout {
  let fit = "fill";
  try {
    fit = getComputedStyle(video).objectFit || "fill";
  } catch {
    /* ignore */
  }

  if (!vw || !vh || dw < 1 || dh < 1) {
    return { dispW: dw, dispH: dh, offX: 0, offY: 0, linearStretch: true };
  }

  if (fit === "cover") {
    const scale = Math.max(dw / vw, dh / vh);
    const dispW = vw * scale;
    const dispH = vh * scale;
    return {
      dispW,
      dispH,
      offX: (dw - dispW) / 2,
      offY: (dh - dispH) / 2,
      linearStretch: false,
    };
  }

  if (fit === "contain" || fit === "scale-down") {
    const scale = Math.min(dw / vw, dh / vh);
    const dispW = vw * scale;
    const dispH = vh * scale;
    return {
      dispW,
      dispH,
      offX: (dw - dispW) / 2,
      offY: (dh - dispH) / 2,
      linearStretch: false,
    };
  }

  return { dispW: dw, dispH: dh, offX: 0, offY: 0, linearStretch: true };
}

export function containerPointToVideoPixel(
  video: HTMLVideoElement,
  container: HTMLElement,
  cx: number,
  cy: number
): VideoPixel | null {
  const vr = video.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const left = vr.left - cr.left;
  const top = vr.top - cr.top;
  const dw = vr.width;
  const dh = vr.height;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (dw < 2 || dh < 2 || !vw || !vh) return null;
  const lx = cx - left;
  const ly = cy - top;
  const lay = getVideoObjectFitLayout(video, dw, dh, vw, vh);

  if (lay.linearStretch) {
    const u = lx / dw;
    const v = ly / dh;
    return {
      vx: Math.min(vw - 1, Math.max(0, u * vw)),
      vy: Math.min(vh - 1, Math.max(0, v * vh)),
    };
  }

  const u = (lx - lay.offX) / lay.dispW;
  const v = (ly - lay.offY) / lay.dispH;
  const uc = Math.min(1, Math.max(0, u));
  const vc = Math.min(1, Math.max(0, v));
  return {
    vx: Math.min(vw - 1, Math.max(0, uc * vw)),
    vy: Math.min(vh - 1, Math.max(0, vc * vh)),
  };
}

export function videoPixelToContainerPoint(
  video: HTMLVideoElement,
  container: HTMLElement,
  vx: number,
  vy: number
): { x: number; y: number } | null {
  const vr = video.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const left = vr.left - cr.left;
  const top = vr.top - cr.top;
  const dw = vr.width;
  const dh = vr.height;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const u = vx / vw;
  const v = vy / vh;
  const lay = getVideoObjectFitLayout(video, dw, dh, vw, vh);

  if (lay.linearStretch) {
    return { x: left + u * dw, y: top + v * dh };
  }

  return {
    x: left + lay.offX + u * lay.dispW,
    y: top + lay.offY + v * lay.dispH,
  };
}

function lumaFromImageData(id: ImageData): Float32Array {
  const { data, width, height } = id;
  const n = width * height;
  const out = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    out[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return out;
}

function zeroMeanNorm(patch: Float32Array): { z: Float32Array; inv: number } {
  let sum = 0;
  for (let i = 0; i < patch.length; i++) sum += patch[i];
  const m = sum / patch.length;
  const z = new Float32Array(patch.length);
  let sq = 0;
  for (let i = 0; i < patch.length; i++) {
    z[i] = patch[i] - m;
    sq += z[i] * z[i];
  }
  return { z, inv: 1 / Math.sqrt(sq + 1e-6) };
}

function copyWindow(
  big: Float32Array,
  roiW: number,
  tx: number,
  ty: number,
  tw: number,
  th: number,
  out: Float32Array
) {
  let k = 0;
  for (let j = 0; j < th; j++) {
    const row = (ty + j) * roiW + tx;
    for (let i = 0; i < tw; i++) {
      out[k++] = big[row + i];
    }
  }
}

function znccAt(
  big: Float32Array,
  roiW: number,
  tx: number,
  ty: number,
  zT: Float32Array,
  invT: number,
  tw: number,
  th: number,
  scratch: Float32Array
): number {
  copyWindow(big, roiW, tx, ty, tw, th, scratch);
  const { z: zI, inv: invI } = zeroMeanNorm(scratch);
  let dot = 0;
  const len = tw * th;
  for (let i = 0; i < len; i++) dot += zT[i] * zI[i];
  return dot * invT * invI;
}

export type PlusTemplate = {
  z: Float32Array;
  invT: number;
  tw: number;
  th: number;
};

export type TrackFrame = {
  luma: Float32Array;
  trkW: number;
  trkH: number;
  vw: number;
  vh: number;
};

/** Full video frame scaled into canvas; returns luminance (row-major, stride trkW). */
export function renderVideoTrackLuma(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): TrackFrame | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || video.readyState < 2) return null;

  const trkW = Math.min(TRACK_MAX_W, vw);
  const trkH = Math.max(1, Math.round((trkW * vh) / vw));

  canvas.width = trkW;
  canvas.height = trkH;
  const ctx =
    canvas.getContext("2d", { willReadFrequently: true }) ??
    canvas.getContext("2d");
  if (!ctx) return null;

  try {
    ctx.drawImage(video, 0, 0, vw, vh, 0, 0, trkW, trkH);
    const id = ctx.getImageData(0, 0, trkW, trkH);
    const luma = lumaFromImageData(id);
    return { luma, trkW, trkH, vw, vh };
  } catch {
    return null;
  }
}

export function videoPixelToTrackPixel(
  vp: VideoPixel,
  vw: number,
  vh: number,
  trkW: number,
  trkH: number
): { tx: number; ty: number } {
  return {
    tx: (vp.vx / vw) * trkW,
    ty: (vp.vy / vh) * trkH,
  };
}

export function trackPixelToVideoPixel(
  tx: number,
  ty: number,
  vw: number,
  vh: number,
  trkW: number,
  trkH: number
): VideoPixel {
  return {
    vx: (tx / trkW) * vw,
    vy: (ty / trkH) * vh,
  };
}

/** Build template from track-frame luma at (tx, ty) track pixels (sub-pixel ok). */
export function extractTemplateFromTrackLuma(
  luma: Float32Array,
  trkW: number,
  trkH: number,
  tx: number,
  ty: number
): PlusTemplate | null {
  const tw = PATCH_TRK;
  const th = PATCH_TRK;
  let sx = Math.round(tx) - PATCH_TRK_HALF;
  let sy = Math.round(ty) - PATCH_TRK_HALF;
  sx = Math.max(0, Math.min(sx, trkW - tw));
  sy = Math.max(0, Math.min(sy, trkH - th));

  const patch = new Float32Array(tw * th);
  copyWindow(luma, trkW, sx, sy, tw, th, patch);
  const { z, inv } = zeroMeanNorm(patch);
  return { z, invT: inv, tw, th };
}

const scratchWin = new Float32Array(PATCH_TRK * PATCH_TRK);

export type MatchResult = { tx: number; ty: number; score: number };

/** Match template in a padded ROI inside full-frame track luma. */
export function matchTemplateInTrackLuma(
  luma: Float32Array,
  trkW: number,
  trkH: number,
  template: PlusTemplate,
  predTx: number,
  predTy: number
): MatchResult | null {
  return matchTemplateInTrackLumaWithConfig(
    luma,
    trkW,
    trkH,
    template,
    predTx,
    predTy,
    SEARCH_PAD_TRK,
    SEARCH_STEP
  );
}

export function matchTemplateInTrackLumaWithConfig(
  luma: Float32Array,
  trkW: number,
  trkH: number,
  template: PlusTemplate,
  predTx: number,
  predTy: number,
  searchPadTrk: number,
  searchStep: number
): MatchResult | null {
  const roiW = PATCH_TRK + 2 * searchPadTrk;
  const roiH = PATCH_TRK + 2 * searchPadTrk;
  let sx = Math.round(predTx) - Math.floor(roiW / 2);
  let sy = Math.round(predTy) - Math.floor(roiH / 2);
  sx = Math.max(0, Math.min(sx, trkW - roiW));
  sy = Math.max(0, Math.min(sy, trkH - roiH));

  const big = new Float32Array(roiW * roiH);
  for (let j = 0; j < roiH; j++) {
    const srcRow = (sy + j) * trkW + sx;
    const dstRow = j * roiW;
    for (let i = 0; i < roiW; i++) {
      big[dstRow + i] = luma[srcRow + i];
    }
  }

  let best = -Infinity;
  let bestTx = 0;
  let bestTy = 0;
  const maxTx = roiW - template.tw;
  const maxTy = roiH - template.th;

  for (let ty = 0; ty <= maxTy; ty += searchStep) {
    for (let tx = 0; tx <= maxTx; tx += searchStep) {
      const s = znccAt(
        big,
        roiW,
        tx,
        ty,
        template.z,
        template.invT,
        template.tw,
        template.th,
        scratchWin
      );
      if (s > best) {
        best = s;
        bestTx = tx;
        bestTy = ty;
      }
    }
  }

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = bestTx + dx;
      const ty = bestTy + dy;
      if (tx < 0 || ty < 0 || tx > maxTx || ty > maxTy) continue;
      const s = znccAt(
        big,
        roiW,
        tx,
        ty,
        template.z,
        template.invT,
        template.tw,
        template.th,
        scratchWin
      );
      if (s > best) {
        best = s;
        bestTx = tx;
        bestTy = ty;
      }
    }
  }

  if (!Number.isFinite(best)) return null;

  const centerTx = sx + bestTx + (template.tw - 1) / 2;
  const centerTy = sy + bestTy + (template.th - 1) / 2;
  return { tx: centerTx, ty: centerTy, score: best };
}

/**
 * Coarse global search for recovery when local tracking loses lock.
 * Scans the full downscaled track frame at a coarse step, then refines locally.
 */
export function matchTemplateGlobalCoarse(
  luma: Float32Array,
  trkW: number,
  trkH: number,
  template: PlusTemplate
): MatchResult | null {
  const tw = template.tw;
  const th = template.th;
  const maxTx = trkW - tw;
  const maxTy = trkH - th;
  if (maxTx < 0 || maxTy < 0) return null;

  let best = -Infinity;
  let bestTx = 0;
  let bestTy = 0;
  const coarseStep = 8;

  for (let ty = 0; ty <= maxTy; ty += coarseStep) {
    for (let tx = 0; tx <= maxTx; tx += coarseStep) {
      const s = znccAt(
        luma,
        trkW,
        tx,
        ty,
        template.z,
        template.invT,
        tw,
        th,
        scratchWin
      );
      if (s > best) {
        best = s;
        bestTx = tx;
        bestTy = ty;
      }
    }
  }

  // Fine refine around coarse winner.
  for (let dy = -10; dy <= 10; dy++) {
    for (let dx = -10; dx <= 10; dx++) {
      const tx = bestTx + dx;
      const ty = bestTy + dy;
      if (tx < 0 || ty < 0 || tx > maxTx || ty > maxTy) continue;
      const s = znccAt(
        luma,
        trkW,
        tx,
        ty,
        template.z,
        template.invT,
        tw,
        th,
        scratchWin
      );
      if (s > best) {
        best = s;
        bestTx = tx;
        bestTy = ty;
      }
    }
  }

  if (!Number.isFinite(best)) return null;
  return {
    tx: bestTx + (tw - 1) / 2,
    ty: bestTy + (th - 1) / 2,
    score: best,
  };
}
