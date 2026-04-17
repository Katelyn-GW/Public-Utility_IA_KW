import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Upload, Image, AlertTriangle, CheckCircle, X } from "lucide-react";
import Header from "../components/Header";
import { storage } from "../utils/storage";

export default function UploadTattoo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WebP image.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setFileName(file.name);
    // Auto-generate title from filename
    const autoTitle = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setTitle(autoTitle);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!preview) return;

    const id = `upload-${Date.now()}`;
    storage.saveLibraryItem({
      id,
      imageUrl: preview,
      title: title || "Uploaded Tattoo",
      style: "Custom Upload",
      savedAt: new Date().toISOString(),
    });

    navigate("/library");
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    setTitle("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#028a7b] pb-12">
      <Header title="Add Tattoo" />

      <div className="mx-auto max-w-lg px-4 mt-6">
        {/* Instructions Card */}
        <div className="mb-6 rounded-lg border-2 border-black bg-[#ead3b2] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-[#028a7b] flex-shrink-0 mt-0.5" />
            <h3 className="font-['Fugaz_One:Regular',sans-serif] text-lg">
              Tips for Best Results
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-black/80 ml-8">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#028a7b] flex-shrink-0 mt-0.5" />
              <span>Upload images in <strong>PNG format</strong> for transparent backgrounds</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#028a7b] flex-shrink-0 mt-0.5" />
              <span>Images with a <strong>white or light background</strong> work best for AR overlay</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#028a7b] flex-shrink-0 mt-0.5" />
              <span>High-contrast, <strong>dark line art</strong> produces the cleanest stencil effect</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#028a7b] flex-shrink-0 mt-0.5" />
              <span>Supported formats: <strong>PNG, JPG, WebP</strong> (max 10MB)</span>
            </li>
          </ul>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div className="space-y-4">
            {/* Upload from device */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-[#028a7b] bg-[#8dd7ca] p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:bg-[#7cc9bc] transition-colors"
            >
              <div className="rounded-lg bg-[#028a7b] p-3">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="font-['Fugaz_One:Regular',sans-serif] text-lg">
                Upload from Device
              </span>
            </button>

            {/* Camera Roll */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/png,image/jpeg,image/jpg,image/webp";
                  fileInputRef.current.capture = "environment";
                  fileInputRef.current.click();
                }
              }}
              className="w-full rounded-lg border-2 border-[#028a7b] bg-[#8dd7ca] p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:bg-[#7cc9bc] transition-colors"
            >
              <div className="rounded-lg bg-[#028a7b] p-3">
                <Image className="h-6 w-6 text-white" />
              </div>
              <span className="font-['Fugaz_One:Regular',sans-serif] text-lg">
                Camera Roll
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview */
          <div className="rounded-lg border-2 border-black bg-[#ead3b2] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="relative mb-4 overflow-hidden rounded-lg border-4 border-[#028a7b] bg-white">
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

            <p className="text-xs text-black/50 mb-2 truncate">{fileName}</p>

            <label className="block mb-1 font-['Fugaz_One:Regular',sans-serif] text-sm">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name your tattoo..."
              className="w-full rounded-lg border-2 border-black px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#028a7b]"
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
            className="flex-1 rounded-lg border-2 border-black bg-[#ead3b2] py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={!preview}
            className="flex-1 rounded-lg border-2 border-black bg-[#028a7b] py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40"
          >
            Add to Library
          </button>
        </div>
      </div>
    </div>
  );
}
