import { useState, useRef, useCallback, useEffect } from "react";
import { Check, FlipHorizontal2, FlipVertical2, RotateCcw } from "lucide-react";
import { drawCylinderWrappedImage } from "../utils/cylinderWrap";

export interface TattooTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

interface Props {
  processedTattooUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  transform: TattooTransform | null;
  onTransformChange: (t: TattooTransform) => void;
  onInitialPlace: (t: TattooTransform) => void;
  locked?: boolean;
  onToggleLock?: () => void;
  cylinderWrap?: boolean;
}

type HandleType =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w"
  | "rotate";

export default function TattooTransformOverlay({
  processedTattooUrl,
  containerRef,
  transform,
  onTransformChange,
  onInitialPlace,
  locked = false,
  onToggleLock,
  cylinderWrap = false,
}: Props) {
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<HandleType | null>(null);
  const dragStartRef = useRef<{
    mx: number;
    my: number;
    t: TattooTransform;
  } | null>(null);

  const getPointerPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? (e as TouchEvent).touches[0]?.clientX ?? (e as TouchEvent).changedTouches[0]?.clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? (e as TouchEvent).touches[0]?.clientY ?? (e as TouchEvent).changedTouches[0]?.clientY : (e as MouseEvent).clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [containerRef]
  );

  // Drawing initial rectangle
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (transform) return; // already placed
      const pos = getPointerPos(e as any);
      setDrawing(true);
      setDrawStart(pos);
    },
    [transform, getPointerPos]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing || !drawStart) return;
      // We just track for the up event
    },
    [drawing, drawStart]
  );

  const handlePointerUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing || !drawStart) return;
      const pos = getPointerPos(e as any);
      const w = pos.x - drawStart.x;
      const h = pos.y - drawStart.y;
      if (Math.abs(w) > 30 && Math.abs(h) > 30) {
        onInitialPlace({
          x: Math.min(drawStart.x, pos.x),
          y: Math.min(drawStart.y, pos.y),
          width: Math.abs(w),
          height: Math.abs(h),
          rotation: 0,
          flipX: false,
          flipY: false,
        });
      }
      setDrawing(false);
      setDrawStart(null);
    },
    [drawing, drawStart, getPointerPos, onInitialPlace]
  );

  // Handle-based interactions (move, resize, rotate)
  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, handle: HandleType) => {
      e.stopPropagation();
      e.preventDefault();
      if (!transform || locked) return;
      const pos = getPointerPos(e as any);
      dragStartRef.current = { mx: pos.x, my: pos.y, t: { ...transform } };
      setDragging(handle);
    },
    [transform, getPointerPos, locked]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!dragStartRef.current || !transform || locked) return;
      const pos = getPointerPos(e);
      const dx = pos.x - dragStartRef.current.mx;
      const dy = pos.y - dragStartRef.current.my;
      const orig = dragStartRef.current.t;

      if (dragging === "move") {
        onTransformChange({ ...transform, x: orig.x + dx, y: orig.y + dy });
      } else if (dragging === "rotate") {
        // Rotation relative to center
        const cx = orig.x + orig.width / 2;
        const cy = orig.y + orig.height / 2;
        const startAngle = Math.atan2(
          dragStartRef.current.my - cy,
          dragStartRef.current.mx - cx
        );
        const currentAngle = Math.atan2(pos.y - cy, pos.x - cx);
        const angleDelta = ((currentAngle - startAngle) * 180) / Math.PI;
        onTransformChange({
          ...transform,
          rotation: orig.rotation + angleDelta,
        });
      } else {
        // Resize handles
        let newX = orig.x;
        let newY = orig.y;
        let newW = orig.width;
        let newH = orig.height;

        if (dragging.includes("e")) {
          newW = Math.max(40, orig.width + dx);
        }
        if (dragging.includes("w")) {
          newW = Math.max(40, orig.width - dx);
          newX = orig.x + dx;
        }
        if (dragging.includes("s")) {
          newH = Math.max(40, orig.height + dy);
        }
        if (dragging.includes("n")) {
          newH = Math.max(40, orig.height - dy);
          newY = orig.y + dy;
        }

        onTransformChange({
          ...transform,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
        });
      }
    };

    const handleUp = () => {
      setDragging(null);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, transform, getPointerPos, onTransformChange, locked]);

  const handleSize = 12;
  const handleClass =
    "absolute bg-black border border-white rounded-sm z-10";

  // Draw preview line while drawing initial rect
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number } | null>(null);
  const wrappedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!cylinderWrap || !transform || !wrappedCanvasRef.current) return;

    const canvas = wrappedCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr =
      typeof window !== "undefined"
        ? Math.min(2, window.devicePixelRatio || 1)
        : 1;
    const w = Math.max(1, Math.round(transform.width));
    const h = Math.max(1, Math.round(transform.height));
    if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
    if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.scale(dpr, dpr);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      drawCylinderWrappedImage(ctx, img, w, h, {
        strength: 0.32,
        slices: 72,
        flipX: transform.flipX,
        flipY: transform.flipY,
        alpha: 0.92,
      });
      ctx.restore();
    };
    img.src = processedTattooUrl;
  }, [cylinderWrap, processedTattooUrl, transform]);

  const handleDrawMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing || !drawStart) return;
      const pos = getPointerPos(e as any);
      setCurrentDraw(pos);
    },
    [drawing, drawStart, getPointerPos]
  );

  return (
    <>
      {/* Drawing layer - for initial placement */}
      {!transform && (
        <div
          className="absolute inset-0 z-20 cursor-crosshair touch-none select-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handleDrawMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handleDrawMove}
          onTouchEnd={handlePointerUp}
        >
          {drawing && drawStart && currentDraw && (
            <div
              className="absolute border border-dashed border-white bg-white/10"
              style={{
                left: Math.min(drawStart.x, currentDraw.x),
                top: Math.min(drawStart.y, currentDraw.y),
                width: Math.abs(currentDraw.x - drawStart.x),
                height: Math.abs(currentDraw.y - drawStart.y),
              }}
            />
          )}
        </div>
      )}

      {/* Transform overlay: outer = unrotated box so lock control stays upright and visible */}
      {transform && (
        <div
          className={`absolute z-20 touch-none select-none overflow-visible ${
            locked ? "will-change-transform" : ""
          }`}
          style={{
            left: transform.x,
            top: transform.y,
            width: transform.width,
            height: transform.height,
          }}
        >
          <div
            className="absolute inset-0 touch-none"
            style={{
              transform: `rotate(${transform.rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/* Tattoo image */}
            {cylinderWrap ? (
              <canvas
                ref={wrappedCanvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            ) : (
              <img
                src={processedTattooUrl}
                alt="Tattoo overlay"
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{
                  opacity: 0.9,
                  transform: `scaleX(${transform.flipX ? -1 : 1}) scaleY(${transform.flipY ? -1 : 1})`,
                }}
                draggable={false}
              />
            )}

            {/* Bounding box */}
            <div
              className={`pointer-events-none absolute inset-0 border ${
                locked ? "border-white/70 border-dashed" : "border-white"
              }`}
            />

            {/* Lock: inside rotated layer so it stays on the crop square's top-right corner */}
            {onToggleLock && (
              <button
                type="button"
                className={`absolute right-0 top-0 z-[40] flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-black shadow-md ${
                  locked ? "ring-1 ring-white/40" : "opacity-95"
                }`}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock();
                }}
                title={
                  locked
                    ? "Unlock to move or resize"
                    : "Lock — tattoo tracks the + patch under the crop (stay in good light)"
                }
                aria-pressed={locked}
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </button>
            )}

            {/* Move handle (center area) */}
            {!locked && (
              <div
                className="absolute inset-3 cursor-move z-10"
                onMouseDown={(e) => startDrag(e, "move")}
                onTouchStart={(e) => startDrag(e, "move")}
              />
            )}

            {/* Corner resize handles */}
            {!locked &&
              (["nw", "ne", "sw", "se"] as HandleType[]).map((corner) => (
                <div
                  key={corner}
                  className={handleClass}
                  style={{
                    width: handleSize,
                    height: handleSize,
                    cursor:
                      corner === "nw" || corner === "se"
                        ? "nwse-resize"
                        : "nesw-resize",
                    top: corner.includes("n") ? -handleSize / 2 : undefined,
                    bottom: corner.includes("s") ? -handleSize / 2 : undefined,
                    left: corner.includes("w") ? -handleSize / 2 : undefined,
                    right: corner.includes("e") ? -handleSize / 2 : undefined,
                  }}
                  onMouseDown={(e) => startDrag(e, corner)}
                  onTouchStart={(e) => startDrag(e, corner)}
                />
              ))}

            {/* Edge resize handles */}
            {!locked &&
              (["n", "s", "e", "w"] as HandleType[]).map((edge) => (
                <div
                  key={edge}
                  className={handleClass}
                  style={{
                    width: edge === "n" || edge === "s" ? handleSize : handleSize,
                    height: edge === "e" || edge === "w" ? handleSize : handleSize,
                    cursor:
                      edge === "n" || edge === "s" ? "ns-resize" : "ew-resize",
                    top:
                      edge === "n"
                        ? -handleSize / 2
                        : edge === "s"
                          ? undefined
                          : "50%",
                    bottom: edge === "s" ? -handleSize / 2 : undefined,
                    left:
                      edge === "w"
                        ? -handleSize / 2
                        : edge === "e"
                          ? undefined
                          : "50%",
                    right: edge === "e" ? -handleSize / 2 : undefined,
                    transform:
                      edge === "n" || edge === "s"
                        ? "translateX(-50%)"
                        : "translateY(-50%)",
                  }}
                  onMouseDown={(e) => startDrag(e, edge)}
                  onTouchStart={(e) => startDrag(e, edge)}
                />
              ))}

            {/* Rotate handle - line + circle above top center */}
            {!locked && (
              <div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ top: -40 }}
              >
                <div
                  className="flex h-6 w-6 cursor-grab items-center justify-center rounded-full border border-white bg-black shadow-md"
                  onMouseDown={(e) => startDrag(e, "rotate")}
                  onTouchStart={(e) => startDrag(e, "rotate")}
                >
                  <RotateCcw className="h-3 w-3 text-white" />
                </div>
                <div className="h-3 w-0.5 bg-white" />
              </div>
            )}

            {/* Flip buttons - positioned below */}
            {!locked && (
              <div
                className="absolute left-1/2 flex -translate-x-1/2 gap-2"
                style={{ bottom: -44 }}
              >
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-md ${
                    transform.flipX
                      ? "border-white bg-white text-black"
                      : "border-white bg-black text-white"
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransformChange({ ...transform, flipX: !transform.flipX });
                  }}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal2 className="h-4 w-4" />
                </button>
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-md ${
                    transform.flipY
                      ? "border-white bg-white text-black"
                      : "border-white bg-black text-white"
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransformChange({ ...transform, flipY: !transform.flipY });
                  }}
                  title="Flip Vertical"
                >
                  <FlipVertical2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
