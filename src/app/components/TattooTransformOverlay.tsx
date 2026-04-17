import { useState, useRef, useCallback, useEffect } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw } from "lucide-react";

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
      if (!transform) return;
      const pos = getPointerPos(e as any);
      dragStartRef.current = { mx: pos.x, my: pos.y, t: { ...transform } };
      setDragging(handle);
    },
    [transform, getPointerPos]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!dragStartRef.current || !transform) return;
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
  }, [dragging, transform, getPointerPos, onTransformChange]);

  const handleSize = 12;
  const handleClass =
    "absolute bg-white border-2 border-[#028a7b] rounded-sm z-10";

  // Draw preview line while drawing initial rect
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number } | null>(null);

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
          className="absolute inset-0 z-20 cursor-crosshair"
          onMouseDown={handlePointerDown}
          onMouseMove={handleDrawMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handleDrawMove}
          onTouchEnd={handlePointerUp}
        >
          {drawing && drawStart && currentDraw && (
            <div
              className="absolute border-2 border-dashed border-[#028a7b] bg-[#028a7b]/10"
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

      {/* Transform overlay */}
      {transform && (
        <div
          className="absolute z-20"
          style={{
            left: transform.x,
            top: transform.y,
            width: transform.width,
            height: transform.height,
            transform: `rotate(${transform.rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Tattoo image */}
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

          {/* Bounding box */}
          <div className="absolute inset-0 border-2 border-[#028a7b]" />

          {/* Move handle (center area) */}
          <div
            className="absolute inset-3 cursor-move z-10"
            onMouseDown={(e) => startDrag(e, "move")}
            onTouchStart={(e) => startDrag(e, "move")}
          />

          {/* Corner resize handles */}
          {(["nw", "ne", "sw", "se"] as HandleType[]).map((corner) => (
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
          {(["n", "s", "e", "w"] as HandleType[]).map((edge) => (
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
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ top: -40 }}
          >
            <div
              className="w-6 h-6 rounded-full bg-[#028a7b] border-2 border-white cursor-grab flex items-center justify-center shadow-md"
              onMouseDown={(e) => startDrag(e, "rotate")}
              onTouchStart={(e) => startDrag(e, "rotate")}
            >
              <RotateCcw className="h-3 w-3 text-white" />
            </div>
            <div className="w-0.5 h-3 bg-[#028a7b]" />
          </div>

          {/* Flip buttons - positioned below */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-2"
            style={{ bottom: -44 }}
          >
            <button
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md ${
                transform.flipX
                  ? "bg-[#028a7b] border-white text-white"
                  : "bg-white border-[#028a7b] text-[#028a7b]"
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
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md ${
                transform.flipY
                  ? "bg-[#028a7b] border-white text-white"
                  : "bg-white border-[#028a7b] text-[#028a7b]"
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
        </div>
      )}
    </>
  );
}
