import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Camera, Plus, RefreshCcw, Upload } from "lucide-react";
import Header from "../components/Header";
import { storage } from "../utils/storage";
import { LibraryItem } from "../types/tattoo";
import { processImageForOverlay } from "../utils/imageProcessor";
import TattooTransformOverlay, {
  TattooTransform,
} from "../components/TattooTransformOverlay";
import type { PlusTemplate } from "../utils/plusPatchTrack";
import {
  containerPointToVideoPixel,
  extractTemplateFromTrackLuma,
  matchTemplateGlobalCoarse,
  matchTemplateInTrackLuma,
  matchTemplateInTrackLumaWithConfig,
  renderVideoTrackLuma,
  trackPixelToVideoPixel,
  videoPixelToContainerPoint,
  videoPixelToTrackPixel,
} from "../utils/plusPatchTrack";

function snapTattooCenterToPoint(
  t: TattooTransform,
  px: number,
  py: number
): TattooTransform {
  const cx = t.x + t.width / 2;
  const cy = t.y + t.height / 2;
  return { ...t, x: t.x + (px - cx), y: t.y + (py - cy) };
}

export default function ARCamera() {
  const navigate = useNavigate();
  const { tattooId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const uploadContainerRef = useRef<HTMLDivElement>(null);

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [selectedTattoo, setSelectedTattoo] = useState<LibraryItem | null>(
    null
  );
  const [tattooTransform, setTattooTransform] =
    useState<TattooTransform | null>(null);
  const [tattooLocked, setTattooLocked] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "user"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "upload">("upload");
  const [showDirections, setShowDirections] = useState(false);
  /** One tap on the live view to mark where the physical + crosses on skin. */
  const [plusCenterTapMode, setPlusCenterTapMode] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [processedTattooUrl, setProcessedTattooUrl] = useState<string | null>(
    null
  );
  const tattooTransformRef = useRef<TattooTransform | null>(null);
  const tattooLockedRef = useRef(false);
  const modeRef = useRef(mode);
  /** Locked-once tattoo size/rotation; x,y updated each frame from + patch match */
  const plusLockedBodyRef = useRef<TattooTransform | null>(null);
  const plusTemplateRef = useRef<PlusTemplate | null>(null);
  /** Predicted + center in *downscaled track* pixel coordinates */
  const plusCenterTrackRef = useRef<{ tx: number; ty: number } | null>(null);
  const trackVelocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    tattooTransformRef.current = tattooTransform;
  }, [tattooTransform]);

  useLayoutEffect(() => {
    tattooLockedRef.current = tattooLocked;
  }, [tattooLocked]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Desktop web is upload-only (no live camera option shown).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768 && mode !== "upload") {
      setMode("upload");
      stopCamera();
    }
  }, [mode]);

  useEffect(() => {
    if (!tattooLocked) {
      plusTemplateRef.current = null;
      plusCenterTrackRef.current = null;
      plusLockedBodyRef.current = null;
      trackVelocityRef.current = { vx: 0, vy: 0 };
    }
  }, [tattooLocked]);

  useEffect(() => {
    const items = storage.getLibraryItems();
    setLibraryItems(items);

    if (tattooId) {
      const item = items.find((i) => i.id === tattooId);
      if (item) {
        setSelectedTattoo(item);
      }
    }
  }, [tattooId]);

  useEffect(() => {
    if (!tattooId && !selectedTattoo && libraryItems.length > 0) {
      setSelectedTattoo(libraryItems[0]);
    }
  }, [tattooId, selectedTattoo, libraryItems]);

  // Process selected tattoo image to remove background
  useEffect(() => {
    if (selectedTattoo) {
      setProcessedTattooUrl(null);
      processImageForOverlay(selectedTattoo.imageUrl)
        .then((url) => setProcessedTattooUrl(url))
        .catch((err) => console.error("Failed to process tattoo image:", err));
    } else {
      setProcessedTattooUrl(null);
    }
  }, [selectedTattoo]);

  const dismissPlusTapMode = useCallback(() => {
    setPlusCenterTapMode(false);
  }, []);

  const onPlusCenterPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!plusCenterTapMode || !cameraContainerRef.current) return;
      e.preventDefault();
      const rect = cameraContainerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const t = tattooTransformRef.current;
      if (t) {
        setTattooTransform(snapTattooCenterToPoint(t, px, py));
      }
      setPlusCenterTapMode(false);
    },
    [plusCenterTapMode]
  );

  const startCamera = async (facingMode: "user" | "environment" = cameraFacing) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
      });
      setCameraFacing(facingMode);
      setStream(mediaStream);
      setCameraActive(true);
      dismissPlusTapMode();
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Unable to access camera. ";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage +=
            "Camera permission was denied. Please allow camera access in your browser settings and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage += "No camera found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMessage += "Camera is already in use by another application.";
        } else if (error.name === "NotSupportedError") {
          errorMessage += "Camera access is not supported. Please use HTTPS.";
        } else {
          errorMessage += error.message || "An unknown error occurred.";
        }
      }

      setCameraError(errorMessage);
    }
  };

  const switchCamera = async () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    await startCamera(nextFacing);
  };

  const stopCamera = () => {
    dismissPlusTapMode();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCameraError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw tattoo with full transform onto a canvas context
  const drawTattooOnCanvas = (
    ctx: CanvasRenderingContext2D,
    tattooImg: HTMLImageElement,
    t: TattooTransform,
    scaleX: number,
    scaleY: number,
    offsetX: number = 0,
    offsetY: number = 0
  ) => {
    const cx = (t.x - offsetX + t.width / 2) * scaleX;
    const cy = (t.y - offsetY + t.height / 2) * scaleY;
    const w = t.width * scaleX;
    const h = t.height * scaleY;

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.translate(cx, cy);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.scale(t.flipX ? -1 : 1, t.flipY ? -1 : 1);
    ctx.drawImage(tattooImg, -w / 2, -h / 2, w, h);
    ctx.restore();
  };

  // Calculate the actual rendered image area inside an object-contain container
  const getContainedImageRect = (
    containerW: number,
    containerH: number,
    imgW: number,
    imgH: number
  ) => {
    const containerAspect = containerW / containerH;
    const imgAspect = imgW / imgH;
    let renderedW: number, renderedH: number, offsetX: number, offsetY: number;
    if (imgAspect > containerAspect) {
      renderedW = containerW;
      renderedH = containerW / imgAspect;
      offsetX = 0;
      offsetY = (containerH - renderedH) / 2;
    } else {
      renderedH = containerH;
      renderedW = containerH * imgAspect;
      offsetX = (containerW - renderedW) / 2;
      offsetY = 0;
    }
    return { renderedW, renderedH, offsetX, offsetY };
  };

  const captureUploadedPhoto = () => {
    if (
      !canvasRef.current ||
      !uploadedImage ||
      !selectedTattoo ||
      !processedTattooUrl
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (tattooTransform && uploadContainerRef.current) {
        const tattooImg = new Image();
        tattooImg.onload = () => {
          const containerW = uploadContainerRef.current!.clientWidth;
          const containerH = uploadContainerRef.current!.clientHeight;
          const { renderedW, renderedH, offsetX, offsetY } =
            getContainedImageRect(containerW, containerH, img.width, img.height);
          const scaleX = img.width / renderedW;
          const scaleY = img.height / renderedH;
          drawTattooOnCanvas(
            ctx,
            tattooImg,
            tattooTransform,
            scaleX,
            scaleY,
            offsetX,
            offsetY
          );
          savePhoto(canvas.toDataURL("image/png"));
        };
        tattooImg.src = processedTattooUrl;
      } else {
        savePhoto(canvas.toDataURL("image/png"));
      }
    };
    img.src = uploadedImage;
  };

  const capturePhoto = () => {
    if (
      !canvasRef.current ||
      !videoRef.current ||
      !selectedTattoo ||
      !processedTattooUrl
    )
      return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (tattooTransform && cameraContainerRef.current) {
      const tattooImg = new Image();
      tattooImg.onload = () => {
        const containerW = cameraContainerRef.current!.clientWidth;
        const containerH = cameraContainerRef.current!.clientHeight;
        const scaleX = canvas.width / containerW;
        const scaleY = canvas.height / containerH;
        drawTattooOnCanvas(
          ctx,
          tattooImg,
          tattooTransform,
          scaleX,
          scaleY,
          0,
          0
        );
        savePhoto(canvas.toDataURL("image/png"));
      };
      tattooImg.src = processedTattooUrl;
    } else {
      savePhoto(canvas.toDataURL("image/png"));
    }
  };

  const savePhoto = (dataUrl: string) => {
    if (!selectedTattoo) return;

    storage.saveARPhoto({
      id: Date.now().toString(),
      imageUrl: dataUrl,
      tattooId: selectedTattoo.id,
      tattooTitle: selectedTattoo.title,
      tattooImageUrl: selectedTattoo.imageUrl,
      createdAt: new Date().toISOString(),
    });

    alert("AR photo saved to your library!");
    navigate("/library");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    videoRef.current.srcObject = stream;
    void videoRef.current.play().catch(() => {
      // Safari can reject autoplay before the stream is fully ready; retry after next frame.
      requestAnimationFrame(() => {
        void videoRef.current?.play().catch(() => {});
      });
    });
  }, [stream, cameraActive]);

  // While locked: template-match a small luminance patch from the lock frame so the tattoo follows the drawn + on skin.
  useEffect(() => {
    if (!cameraActive || !tattooLocked) return;

    const container = cameraContainerRef.current;
    if (!container) return () => {};

    plusTemplateRef.current = null;
    plusCenterTrackRef.current = null;
    plusLockedBodyRef.current = null;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = 128;
    canvas.height = 128;
    Object.assign(canvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "128px",
      height: "128px",
      opacity: "0",
      pointerEvents: "none",
      zIndex: "35",
    });
    container.appendChild(canvas);

    let cancelled = false;
    let raf = 0;
    let vfcHandle: number | null = null;

    let lastUpdate = 0;
    let missStreak = 0;
    let highConfidenceStreak = 0;
    let globalReacquireCooldown = 0;
    const runOne = () => {
      if (cancelled) return;

      const desktop =
        typeof window !== "undefined" && window.innerWidth >= 768;
      if (desktop && modeRef.current !== "camera") {
        return;
      }

      const video = videoRef.current;
      const container = cameraContainerRef.current;
      const cur = tattooTransformRef.current;

      if (
        !video ||
        !container ||
        !cur ||
        !tattooLockedRef.current ||
        video.readyState < 2
      ) {
        return;
      }

      const cx = cur.x + cur.width / 2;
      const cy = cur.y + cur.height / 2;

      const frame = renderVideoTrackLuma(video, canvas);
      if (!frame) return;
      const { luma, trkW, trkH, vw, vh } = frame;
      if (globalReacquireCooldown > 0) globalReacquireCooldown -= 1;

      if (!plusTemplateRef.current) {
        const vp = containerPointToVideoPixel(video, container, cx, cy);
        if (!vp) return;
        const { tx, ty } = videoPixelToTrackPixel(vp, vw, vh, trkW, trkH);
        const tpl = extractTemplateFromTrackLuma(luma, trkW, trkH, tx, ty);
        if (!tpl) return;
        plusTemplateRef.current = tpl;
        plusCenterTrackRef.current = { tx, ty };
        plusLockedBodyRef.current = { ...cur };
        return;
      }

      const pred = plusCenterTrackRef.current;
      const body = plusLockedBodyRef.current;
      if (!pred || !body) return;

      const tpl = plusTemplateRef.current;
      if (!tpl) return;

      const vel = trackVelocityRef.current;
      const predictedTx = pred.tx + vel.vx;
      const predictedTy = pred.ty + vel.vy;

      let match = matchTemplateInTrackLuma(
        luma,
        trkW,
        trkH,
        tpl,
        predictedTx,
        predictedTy
      );
      if (!match) {
        // Wider local search first before full-frame reacquire.
        match = matchTemplateInTrackLumaWithConfig(
          luma,
          trkW,
          trkH,
          tpl,
          predictedTx,
          predictedTy,
          72,
          4
        );
        if (!match) {
          missStreak += 1;
          if (missStreak >= 2 && globalReacquireCooldown === 0) {
            const globalMatch = matchTemplateGlobalCoarse(luma, trkW, trkH, tpl);
            globalReacquireCooldown = 3;
            if (globalMatch && globalMatch.score >= 0.08) {
              match = globalMatch;
            } else {
              return;
            }
          } else {
            return;
          }
        }
      }
      if (match.score < 0.075) {
        // One more wider local attempt for weak correlations.
        const boosted = matchTemplateInTrackLumaWithConfig(
          luma,
          trkW,
          trkH,
          tpl,
          predictedTx,
          predictedTy,
          84,
          4
        );
        if (boosted && boosted.score > match.score) {
          match = boosted;
        }
      }
      if (match.score < 0.07) {
        missStreak += 1;
        if (missStreak >= 4) {
          const active = tattooTransformRef.current;
          if (active) {
            const centerVp = containerPointToVideoPixel(
              video,
              container,
              active.x + active.width / 2,
              active.y + active.height / 2
            );
            if (centerVp) {
              const tp = videoPixelToTrackPixel(centerVp, vw, vh, trkW, trkH);
              const rebuilt = extractTemplateFromTrackLuma(
                luma,
                trkW,
                trkH,
                tp.tx,
                tp.ty
              );
              if (rebuilt) {
                plusTemplateRef.current = rebuilt;
                plusCenterTrackRef.current = { tx: tp.tx, ty: tp.ty };
                plusLockedBodyRef.current = { ...active };
                trackVelocityRef.current = { vx: 0, vy: 0 };
              }
            }
          }
          missStreak = 0;
        }
        return;
      }
      {
        // continue
      }
      missStreak = 0;

      const prevV = trackPixelToVideoPixel(pred.tx, pred.ty, vw, vh, trkW, trkH);
      const nextV = trackPixelToVideoPixel(match.tx, match.ty, vw, vh, trkW, trkH);
      const prevC = videoPixelToContainerPoint(
        video,
        container,
        prevV.vx,
        prevV.vy
      );
      const cpt = videoPixelToContainerPoint(
        video,
        container,
        nextV.vx,
        nextV.vy
      );
      if (!prevC || !cpt) return;

      const dCont = Math.hypot(cpt.x - prevC.x, cpt.y - prevC.y);
      // Don't hard-break on fast motion; clamp max frame-to-frame movement.
      const maxStep = 120;
      let nextContainerX = cpt.x;
      let nextContainerY = cpt.y;
      if (dCont > maxStep) {
        const ratio = maxStep / dCont;
        nextContainerX = prevC.x + (cpt.x - prevC.x) * ratio;
        nextContainerY = prevC.y + (cpt.y - prevC.y) * ratio;
      }

      plusCenterTrackRef.current = { tx: match.tx, ty: match.ty };
      trackVelocityRef.current = {
        vx: (match.tx - pred.tx) * 0.72 + vel.vx * 0.28,
        vy: (match.ty - pred.ty) * 0.72 + vel.vy * 0.28,
      };

      const nextX = nextContainerX - body.width / 2;
      const nextY = nextContainerY - body.height / 2;
      const prev = tattooTransformRef.current;
      const now = performance.now();
      if (!prev) return;

      // Throttle + smooth to reduce mobile lag/jitter.
      if (now - lastUpdate < 20) return;
      lastUpdate = now;

      const confidence = Math.max(0, Math.min(1, (match.score - 0.08) / 0.22));
      const lerp = 0.42 + confidence * 0.32;
      const smoothedX = prev.x + (nextX - prev.x) * lerp;
      const smoothedY = prev.y + (nextY - prev.y) * lerp;
      const moveDelta = Math.hypot(smoothedX - prev.x, smoothedY - prev.y);
      if (moveDelta < 0.12) return;

      setTattooTransform({
        ...body,
        x: smoothedX,
        y: smoothedY,
      });

      // Periodically refresh template under good confidence to adapt skin lighting/pose.
      if (match.score > 0.2) {
        highConfidenceStreak += 1;
        if (highConfidenceStreak >= 8) {
          const fresh = extractTemplateFromTrackLuma(
            luma,
            trkW,
            trkH,
            match.tx,
            match.ty
          );
          if (fresh) plusTemplateRef.current = fresh;
          highConfidenceStreak = 0;
        }
      } else {
        highConfidenceStreak = 0;
      }

    };

    const continueLoop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && typeof video.requestVideoFrameCallback === "function") {
        vfcHandle = video.requestVideoFrameCallback(onVideoFrame);
      } else {
        raf = requestAnimationFrame(rafLoop);
      }
    };

    const rafLoop = () => {
      if (cancelled) return;
      runOne();
      continueLoop();
    };

    const onVideoFrame: VideoFrameRequestCallback = () => {
      if (cancelled) return;
      runOne();
      continueLoop();
    };

    continueLoop();

    return () => {
      cancelled = true;
      const v = videoRef.current;
      if (v && vfcHandle != null && typeof v.cancelVideoFrameCallback === "function") {
        try {
          v.cancelVideoFrameCallback(vfcHandle);
        } catch {
          /* ignore */
        }
      }
      cancelAnimationFrame(raf);
      canvas.remove();
    };
  }, [cameraActive, tattooLocked]);

  return (
    <div className="min-h-screen bg-black pb-28 text-white md:pb-12 md:pl-[7.25rem]">
      <Header title="AR Camera" />

      <div className="mx-auto max-w-5xl px-4 mt-6">
        {/* Mobile layout */}
        <div className="md:hidden">
          <div className="mb-3 flex gap-3">
            <button
              onClick={() => navigate("/library")}
              className="flex-1 rounded-lg border border-white bg-black py-2.5 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
            >
              Close
            </button>
            <button
              onClick={() => setShowDirections((prev) => !prev)}
              className="flex-1 rounded-lg border border-white bg-white py-2.5 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
            >
              Directions
            </button>
          </div>

          {selectedTattoo && (
            <div className="mb-3 rounded-lg border border-white/80 bg-black p-2">
              <p className="mb-2 text-center text-xs font-['Fugaz_One:Regular',sans-serif] text-white/70">
                Selected Tattoo
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedTattoo.imageUrl}
                  alt={selectedTattoo.title}
                  className="h-14 w-14 rounded-md border border-white bg-black object-cover"
                />
                <p className="flex-1 truncate text-sm font-['Fugaz_One:Regular',sans-serif]">
                  {selectedTattoo.title}
                </p>
                <button
                  onClick={() => navigate("/library")}
                  className="rounded-md border border-white bg-white px-2 py-1 text-xs font-['Fugaz_One:Regular',sans-serif] text-black"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {showDirections && (
            <div className="mb-3 rounded-lg border border-white/80 bg-black p-3 text-sm">
              <ul className="list-disc space-y-2 pl-4 font-['Fugaz_One:Regular',sans-serif]">
                <li>Select a tattoo and start the camera.</li>
                <li>
                  Draw the placement square on screen, then drag and resize the
                  tattoo like any other crop.
                </li>
                <li>Use the lock check when placement looks right.</li>
                <li>Mobile uses a cylinder wrap to better follow arm curvature.</li>
              </ul>
            </div>
          )}

          {cameraError && (
            <div className="mb-3 rounded-lg border-2 border-orange-600 bg-orange-100 p-3">
              <p className="text-sm text-orange-900">{cameraError}</p>
            </div>
          )}

          {cameraActive &&
            tattooTransform &&
            !tattooLocked &&
            processedTattooUrl &&
            selectedTattoo &&
            !isMobileView && (
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    plusCenterTapMode
                      ? dismissPlusTapMode()
                      : setPlusCenterTapMode(true)
                  }
                  className="rounded-lg border border-white bg-white px-3 py-2 text-xs font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_3px_0px_0px_rgba(255,255,255,0.25)]"
                >
                  {plusCenterTapMode
                    ? "Cancel"
                    : "Mark + crossing on skin"}
                </button>
              </div>
            )}

          <div className="relative overflow-hidden rounded-lg border border-white bg-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.12)]">
            {cameraActive && (
              <button
                onClick={switchCamera}
                className="absolute right-3 top-3 z-30 rounded-full border border-white bg-black p-2 text-white shadow-[2px_3px_0px_0px_rgba(255,255,255,0.25)]"
                title="Switch camera"
                aria-label="Switch camera"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            )}
            {!cameraActive ? (
              <div className="flex h-[62vh] max-h-[620px] min-h-[420px] items-center justify-center">
                <button
                  onClick={() => startCamera(cameraFacing)}
                  disabled={!selectedTattoo}
                  className="rounded-lg border border-white bg-white px-8 py-4 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
                >
                  <Camera className="mx-auto mb-2 h-8 w-8" />
                  {selectedTattoo ? "Start Camera" : "Add Tattoo In Library First"}
                </button>
              </div>
            ) : (
              <div className="relative h-[62vh] max-h-[620px] min-h-[420px] touch-none" ref={cameraContainerRef}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover touch-none"
                />
                {plusCenterTapMode && tattooTransform && !isMobileView && (
                  <>
                    <div className="pointer-events-none absolute left-2 right-2 top-12 z-[26] rounded-lg border border-white bg-white/95 px-2 py-2 text-center text-xs font-['Fugaz_One:Regular',sans-serif] text-black shadow-md">
                      Tap once where the lines of your <strong>+</strong> cross on
                      your skin (the real marker, not the on-screen crop box).
                    </div>
                    <div
                      className="absolute inset-0 z-[25] cursor-crosshair touch-none"
                      onPointerDown={onPlusCenterPointerDown}
                    />
                  </>
                )}
                {processedTattooUrl && selectedTattoo && (
                  <TattooTransformOverlay
                    processedTattooUrl={processedTattooUrl}
                    containerRef={cameraContainerRef}
                    transform={tattooTransform}
                    onTransformChange={setTattooTransform}
                    onInitialPlace={setTattooTransform}
                    locked={tattooLocked}
                    onToggleLock={() => setTattooLocked((prev) => !prev)}
                  />
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {cameraActive && (
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => {
                  dismissPlusTapMode();
                  setTattooTransform(null);
                  setTattooLocked(false);
                }}
                className="flex-1 rounded-lg border border-white bg-black py-2.5 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
              >
                Reset
              </button>
              <button
                onClick={capturePhoto}
                disabled={!tattooTransform}
                className="flex-1 rounded-lg border border-white bg-white py-2.5 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
              >
                Save Photo
              </button>
            </div>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden gap-6 md:flex">
          {/* Tattoo Selection Sidebar */}
          <div className="w-48 flex-shrink-0">
            <h3 className="mb-3 font-['Fugaz_One:Regular',sans-serif] text-lg">
              Select Tattoo
            </h3>
            <div className="space-y-3">
              {libraryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    dismissPlusTapMode();
                    setSelectedTattoo(item);
                    setTattooTransform(null);
                    setTattooLocked(false);
                  }}
                  className={`w-full overflow-hidden rounded-lg border-2 transition-all ${
                    selectedTattoo?.id === item.id
                      ? "border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.35)]"
                      : "border-white/30"
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-auto w-full object-cover"
                  />
                  <div className="border-t border-white/40 bg-black p-1">
                    <Plus className="mx-auto h-4 w-4 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera View */}
          <div className="flex-1">
            {/* Desktop web: upload-only */}
            <div className="mb-4">
              <button
                onClick={() => {
                  setMode("upload");
                  stopCamera();
                  setTattooTransform(null);
                  setTattooLocked(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white bg-white py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </button>
            </div>

            {/* Camera Error Alert */}
            {cameraError && mode === "camera" && (
              <div className="mb-4 rounded-lg border-2 border-orange-600 bg-orange-100 p-4">
                <p className="mb-2 font-['Fugaz_One:Regular',sans-serif] text-sm text-orange-900">
                  {cameraError}
                </p>
                <p className="mb-3 text-xs text-orange-800">
                  💡 Try "Upload Photo" mode instead to use an existing photo!
                </p>
                <button
                  onClick={() => {
                    setCameraError(null);
                    setMode("upload");
                  }}
                  className="rounded-lg border border-white bg-white px-4 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]"
                >
                  Switch to Upload Mode
                </button>
              </div>
            )}

            {mode === "camera" &&
              cameraActive &&
              tattooTransform &&
              !tattooLocked &&
              processedTattooUrl &&
              selectedTattoo &&
              !isMobileView && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      plusCenterTapMode
                        ? dismissPlusTapMode()
                        : setPlusCenterTapMode(true)
                    }
                    className="rounded-lg border border-white bg-white px-4 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_3px_0px_0px_rgba(255,255,255,0.25)]"
                  >
                    {plusCenterTapMode
                      ? "Cancel"
                      : "Mark + crossing on skin"}
                  </button>
                </div>
              )}

            <div className="relative overflow-visible rounded-lg border border-white bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.12)]">
              {mode === "camera" && !cameraActive && (
                <div className="flex h-[600px] items-center justify-center">
                  <button
                    onClick={startCamera}
                    disabled={!selectedTattoo}
                    className="rounded-lg border border-white bg-white px-8 py-4 font-sans text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
                  >
                    <Camera className="mx-auto mb-2 h-8 w-8" />
                    {selectedTattoo
                      ? "Start Camera"
                      : "Select a tattoo first"}
                  </button>
                </div>
              )}

              {mode === "camera" && cameraActive && (
                <div className="relative" ref={cameraContainerRef}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-auto w-full"
                  />
                  {plusCenterTapMode && tattooTransform && !isMobileView && (
                    <>
                      <div className="pointer-events-none absolute left-2 right-2 top-14 z-[26] rounded-lg border border-white bg-white/95 px-3 py-2 text-center text-xs font-['Fugaz_One:Regular',sans-serif] text-black shadow-md">
                        Tap once where your <strong>+</strong> crosses on your
                        skin (the real marker, not the on-screen crop box).
                      </div>
                      <div
                        className="absolute inset-0 z-[25] cursor-crosshair touch-none"
                        onPointerDown={onPlusCenterPointerDown}
                      />
                    </>
                  )}
                  {processedTattooUrl && selectedTattoo && (
                    <TattooTransformOverlay
                      processedTattooUrl={processedTattooUrl}
                      containerRef={cameraContainerRef}
                      transform={tattooTransform}
                      onTransformChange={setTattooTransform}
                      onInitialPlace={setTattooTransform}
                      locked={tattooLocked}
                      onToggleLock={() => setTattooLocked((prev) => !prev)}
                    />
                  )}
                  <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white pointer-events-none z-30">
                    {tattooTransform
                      ? "Drag to move · Corners to resize · Top handle to rotate"
                      : "Draw a rectangle to place the tattoo"}
                  </p>
                </div>
              )}

              {mode === "upload" && !uploadedImage && (
                <div className="flex h-[600px] flex-col items-center justify-center gap-4">
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={!selectedTattoo}
                    className="flex items-center gap-2 rounded-lg border border-white bg-white px-8 py-4 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Photo
                  </button>
                  {!selectedTattoo && (
                    <p className="text-sm font-sans font-semibold text-white/60">
                      Select a tattoo first
                    </p>
                  )}
                </div>
              )}

              {mode === "upload" && uploadedImage && (
                <div className="relative" ref={uploadContainerRef}>
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-auto w-full max-h-[600px] object-contain"
                  />
                  {processedTattooUrl && selectedTattoo && (
                    <TattooTransformOverlay
                      processedTattooUrl={processedTattooUrl}
                      containerRef={uploadContainerRef}
                      transform={tattooTransform}
                      onTransformChange={setTattooTransform}
                      onInitialPlace={setTattooTransform}
                      locked={tattooLocked}
                      onToggleLock={() => setTattooLocked((prev) => !prev)}
                    />
                  )}
                  <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white pointer-events-none z-30">
                    {tattooTransform
                      ? "Drag to move · Corners to resize · Top handle to rotate"
                      : "Draw a rectangle to place the tattoo"}
                  </p>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => navigate("/library")}
                className="flex-1 rounded-lg border border-white bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
              >
                Close
              </button>
              {mode === "camera" && cameraActive && (
                <>
                  <button
                    onClick={() => {
                      dismissPlusTapMode();
                      setTattooTransform(null);
                      setTattooLocked(false);
                    }}
                    className="flex-1 rounded-lg border border-white bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
                  >
                    Reset Position
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={!tattooTransform}
                    className="flex-1 rounded-lg border border-white bg-white py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
                  >
                    Save Photo
                  </button>
                </>
              )}
              {mode === "upload" && uploadedImage && (
                <>
                  <button
                    onClick={() => {
                      dismissPlusTapMode();
                      setTattooTransform(null);
                      setTattooLocked(false);
                    }}
                    className="flex-1 rounded-lg border border-white bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
                  >
                    Reset Position
                  </button>
                  <button
                    onClick={captureUploadedPhoto}
                    disabled={!tattooTransform}
                    className="flex-1 rounded-lg border border-white bg-white py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-50"
                  >
                    Save Photo
                  </button>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 rounded-lg border border-white/80 bg-black p-4">
              <h4 className="mb-2 font-sans font-semibold">
                How to use:
              </h4>
              <ol className="list-decimal space-y-1 pl-5 text-sm font-sans font-semibold leading-relaxed">
                <li>Select a tattoo.</li>
                <li>Upload your photo.</li>
                <li>Place it: drag to move, corners to resize, top handle to rotate.</li>
                <li>Tap Save Photo.</li>
              </ol>
              {mode === "camera" && (
                <p className="mt-3 text-xs text-white/70">
                  💡 If camera does not work, try Upload Photo mode!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}