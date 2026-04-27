import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, AlertTriangle, CheckCircle, X } from "lucide-react";
import Header from "../components/Header";
import { storage } from "../utils/storage";

export default function UploadTattoo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUploads, setSelectedUploads] = useState<
    Array<{ fileName: string; preview: string; title: string }>
  >([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDesktopView, setIsDesktopView] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsDesktopView(window.innerWidth >= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeUpload = selectedUploads[activeIndex] ?? null;
  const preview = activeUpload?.preview ?? null;
  const fileName = activeUpload?.fileName ?? "";
  const isMultiUpload = selectedUploads.length > 1;

  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve((ev.target?.result as string) ?? "");
      reader.onerror = () => reject(new Error(`Unable to read "${file.name}"`));
      reader.readAsDataURL(file);
    });

  const toAutoTitle = (name: string) =>
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const validFiles = files.filter(
      (file) =>
        validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
    );

    if (!validFiles.length) {
      setError("Please upload PNG/JPG files under 10MB.");
      return;
    }

    if (validFiles.length !== files.length) {
      setError("Some files were skipped (must be PNG/JPG and under 10MB).");
    }

    const uploads = await Promise.all(
      validFiles.map(async (file) => ({
        fileName: file.name,
        preview: await readFileAsDataURL(file),
        title: toAutoTitle(file.name),
      }))
    );

    const dedupeKey = (u: { fileName: string; preview: string }) =>
      `${u.fileName}|${u.preview.length}|${u.preview.slice(0, 64)}`;

    setSelectedUploads((prev) => {
      const merged = isDesktopView ? [...prev, ...uploads] : uploads;
      const seen = new Set<string>();
      const unique = merged.filter((u) => {
        const key = dedupeKey(u);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length > 0) {
        const nextIndex = isDesktopView && prev.length > 0
          ? unique.length - 1
          : 0;
        setActiveIndex(nextIndex);
        setTitle(unique[nextIndex]?.title ?? "");
      }

      return unique;
    });
  };

  const handleSave = () => {
    if (!selectedUploads.length) return;

    const now = Date.now();
    let savedCount = 0;
    selectedUploads.forEach((upload, idx) => {
      const isActive = idx === activeIndex;
      const itemTitle =
        (isActive ? title.trim() : upload.title.trim()) || "Uploaded Tattoo";
      const saved = storage.saveLibraryItem({
        id: `upload-${now}-${idx}`,
        imageUrl: upload.preview,
        title: itemTitle,
        style: "Custom Upload",
        savedAt: new Date().toISOString(),
      });
      if (saved) savedCount += 1;
    });

    if (savedCount === 0) {
      setError(
        "Could not save uploads. Your browser storage may be full. Delete older items and try again."
      );
      return;
    }

    if (savedCount < selectedUploads.length) {
      alert(
        `Saved ${savedCount} of ${selectedUploads.length} uploads. Browser storage is likely full.`
      );
    }
    navigate("/library");
  };

  const handleClear = () => {
    setSelectedUploads([]);
    setActiveIndex(0);
    setTitle("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Opens the system image picker only (no `capture` — that forces live camera on mobile). */
  const openImagePicker = () => {
    const el = fileInputRef.current;
    if (!el) return;
    el.removeAttribute("capture");
    el.accept = "image/png,image/jpeg,image/jpg";
    el.value = "";
    el.click();
  };

  return (
    <div className="min-h-screen bg-black pb-28 text-white md:pb-12 md:pl-[7.25rem]">
      <Header title="Add Tattoo" />

      <div className="mx-auto max-w-lg px-4 mt-6">
        {/* Instructions Card */}
        <div className="mb-6 rounded-lg border border-white/80 bg-black p-5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)]">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
            <h3 className="celestial-label font-['Fugaz_One:Regular',sans-serif] text-lg">
              Tips for Best Results
            </h3>
          </div>
          <ul className="celestial-muted ml-8 space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
              <span>Upload images in <strong>PNG format</strong> for transparent backgrounds</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
              <span>Images with a <strong>white or light background</strong> work best for AR overlay</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
              <span>High-contrast, <strong>dark line art</strong> produces the cleanest stencil effect</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
              <span>Jpg or png format</span>
            </li>
          </ul>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={openImagePicker}
              className="flex w-full items-center gap-4 rounded-lg border border-white bg-black p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)] transition-colors hover:bg-white/5"
            >
              <Upload
                className="h-8 w-8 shrink-0 text-[#dfbe7c]"
                aria-hidden
              />
              <span className="celestial-label font-['Fugaz_One:Regular',sans-serif] text-lg">
                Upload from Device
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple={isDesktopView}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview */
          <div className="rounded-lg border border-white/80 bg-black p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)]">
            <div className="relative mb-4 overflow-hidden rounded-lg border border-white bg-black">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-80 object-contain"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <p className="celestial-muted mb-2 truncate text-xs text-white/50">{fileName}</p>
            {isMultiUpload && (
              <p className="celestial-muted mb-3 text-xs text-white/70">
                {selectedUploads.length} files selected. Editing title for file {activeIndex + 1}.
              </p>
            )}

            {isMultiUpload && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedUploads.map((upload, idx) => (
                  <button
                    key={`${upload.fileName}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(idx);
                      setTitle(
                        idx === activeIndex ? title : selectedUploads[idx].title
                      );
                    }}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      idx === activeIndex
                        ? "border-white bg-white text-black"
                        : "border-white/60 bg-black text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}

            <label className="celestial-label block mb-1 font-['Fugaz_One:Regular',sans-serif] text-sm">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name your tattoo..."
              className="mb-4 w-full rounded-lg border border-white bg-black px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border-2 border-red-600 bg-red-100 p-3">
            <p className="text-sm text-red-900 font-['Fugaz_One:Regular',sans-serif]">{error}</p>
          </div>
        )}

        {/* Bottom Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate("/library")}
            className="flex-1 rounded-lg border border-white bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)]"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={!preview}
            className="flex-1 rounded-lg border border-white bg-white py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.25)] disabled:opacity-40"
          >
            Add to Library
          </button>
        </div>
      </div>
    </div>
  );
}
