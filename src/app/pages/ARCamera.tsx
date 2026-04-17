import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Camera, Plus } from "lucide-react";
import Header from "../components/Header";
import { storage } from "../utils/storage";
import { LibraryItem } from "../types/tattoo";
import { processImageForOverlay } from "../utils/imageProcessor";
import TattooTransformOverlay, {
  TattooTransform,
} from "../components/TattooTransformOverlay";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "upload">("upload");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [processedTattooUrl, setProcessedTattooUrl] = useState<string | null>(
    null
  );

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

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
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

  const stopCamera = () => {
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
        drawTattooOnCanvas(ctx, tattooImg, tattooTransform, scaleX, scaleY);
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

  return (
    <div className="min-h-screen bg-[#8dd7ca] pb-12">
      <Header title="AR Camera" bannerImage="ar" />

      <div className="mx-auto max-w-5xl px-4 mt-6">
        <div className="flex gap-6">
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
                    setSelectedTattoo(item);
                    setTattooTransform(null);
                  }}
                  className={`w-full overflow-hidden rounded-lg border-4 transition-all ${
                    selectedTattoo?.id === item.id
                      ? "border-[#028a7b] shadow-[4px_4px_0px_0px_rgba(2,138,123,1)]"
                      : "border-[#72aea3]"
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-auto w-full object-cover"
                  />
                  <div className="bg-[#028a7b] p-1">
                    <Plus className="mx-auto h-4 w-4 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera View */}
          <div className="flex-1">
            {/* Mode Toggle */}
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => {
                  setMode("camera");
                  setUploadedImage(null);
                  setTattooTransform(null);
                }}
                className={`flex-1 rounded-lg border-2 border-black py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] ${
                  mode === "camera"
                    ? "bg-[#028a7b] text-white"
                    : "bg-[#ead3b2]"
                }`}
              >
                📷 Live Camera
              </button>
              <button
                onClick={() => {
                  setMode("upload");
                  stopCamera();
                  setTattooTransform(null);
                }}
                className={`flex-1 rounded-lg border-2 border-black py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] ${
                  mode === "upload"
                    ? "bg-[#028a7b] text-white"
                    : "bg-[#ead3b2]"
                }`}
              >
                📁 Upload Photo
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
                  className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Switch to Upload Mode
                </button>
              </div>
            )}

            <div className="relative overflow-visible rounded-lg border-[11px] border-[#028a7b] bg-[#ead3b2] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
              {mode === "camera" && !cameraActive && (
                <div className="flex h-[600px] items-center justify-center">
                  <button
                    onClick={startCamera}
                    disabled={!selectedTattoo}
                    className="rounded-lg border-2 border-black bg-[#028a7b] px-8 py-4 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    <Camera className="mx-auto mb-2 h-8 w-8" />
                    {selectedTattoo
                      ? "Start Camera"
                      : "Select a Tattoo First"}
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
                  {processedTattooUrl && selectedTattoo && (
                    <TattooTransformOverlay
                      processedTattooUrl={processedTattooUrl}
                      containerRef={cameraContainerRef}
                      transform={tattooTransform}
                      onTransformChange={setTattooTransform}
                      onInitialPlace={setTattooTransform}
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
                    className="rounded-lg border-2 border-black bg-[#028a7b] px-8 py-4 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    📁 Choose Photo
                  </button>
                  {!selectedTattoo && (
                    <p className="text-sm text-black/60">
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
                className="flex-1 rounded-lg border-2 border-black bg-[#ead3b2] py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Close
              </button>
              {mode === "camera" && cameraActive && (
                <>
                  <button
                    onClick={() => setTattooTransform(null)}
                    className="flex-1 rounded-lg border-2 border-black bg-[#72aea3] py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Reset Position
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={!tattooTransform}
                    className="flex-1 rounded-lg border-2 border-black bg-[#028a7b] py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    Save Photo
                  </button>
                </>
              )}
              {mode === "upload" && uploadedImage && (
                <>
                  <button
                    onClick={() => setTattooTransform(null)}
                    className="flex-1 rounded-lg border-2 border-black bg-[#72aea3] py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Reset Position
                  </button>
                  <button
                    onClick={captureUploadedPhoto}
                    disabled={!tattooTransform}
                    className="flex-1 rounded-lg border-2 border-black bg-[#028a7b] py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    Save Photo
                  </button>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 rounded-lg border-2 border-black bg-[#ead3b2] p-4">
              <h4 className="mb-2 font-['Fugaz_One:Regular',sans-serif]">
                How to use:
              </h4>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                <li>Select a tattoo from your library</li>
                <li>
                  Choose between Live Camera or Upload Photo mode
                </li>
                <li>
                  Click and drag to draw a rectangle where you want the tattoo
                </li>
                <li>
                  Drag the tattoo to reposition · drag corners to resize · use
                  the top handle to rotate
                </li>
                <li>
                  Use the flip buttons below the tattoo to mirror it
                </li>
                <li>
                  Click "Save Photo" to capture and save to your library
                </li>
              </ol>
              {mode === "camera" && (
                <p className="mt-3 text-xs text-black/70">
                  💡 If camera doesn't work, try "Upload Photo" mode!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}