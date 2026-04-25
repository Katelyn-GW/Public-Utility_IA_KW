import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Trash2, X, Upload, Download, Share2 } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Header from "../components/Header";
import { CelestialModalScrollWithRail } from "../components/CelestialModalScrollWithRail";
import { storage } from "../utils/storage";
import { LibraryItem, ARPhoto } from "../types/tattoo";

export default function Library() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  /** From AR “Change” — show pickable squares with + strip to open that design in AR. */
  const fromArCameraChange = searchParams.get("arChange") === "1";
  const arChangeSelectedParam = searchParams.get("selected");
  const [activeTab, setActiveTab] = useState<"tattoos" | "ar">("tattoos");
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [arPhotos, setArPhotos] = useState<ARPhoto[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  // AR photo modal state
  const [selectedARPhoto, setSelectedARPhoto] = useState<ARPhoto | null>(null);
  const [arTitle, setArTitle] = useState("");
  const [arDescription, setArDescription] = useState("");
  const [postSuccess, setPostSuccess] = useState<"" | "success" | "error">("");
  /** AR “Change” grid: which design is selected (gold + strip). */
  const [arChangeSelectedId, setArChangeSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!fromArCameraChange) {
      setArChangeSelectedId(null);
      return;
    }

    if (arChangeSelectedParam && libraryItems.some((i) => i.id === arChangeSelectedParam)) {
      setArChangeSelectedId(arChangeSelectedParam);
      return;
    }

    if (arChangeSelectedId && !libraryItems.some((i) => i.id === arChangeSelectedId)) {
      setArChangeSelectedId(null);
    }
  }, [fromArCameraChange, arChangeSelectedParam, libraryItems, arChangeSelectedId]);

  const loadData = () => {
    setLibraryItems(storage.getLibraryItems());
    setArPhotos(storage.getARPhotos());
  };

  const handleDeleteTattoo = (id: string) => {
    storage.removeLibraryItem(id);
    loadData();
    setSelectedItem(null);
  };

  const handleDeleteARPhoto = (id: string) => {
    storage.removeARPhoto(id);
    loadData();
    setSelectedARPhoto(null);
  };

  const handleSaveDescription = () => {
    if (selectedItem) {
      storage.updateLibraryItemDescription(selectedItem.id, descriptionText);
      loadData();
      setEditingDescription(false);
      setSelectedItem(null);
    }
  };

  const handleEditDescription = (item: LibraryItem) => {
    setSelectedItem(item);
    setDescriptionText(item.savedDescription || "");
    setEditingDescription(true);
  };

  const openARPhotoModal = (photo: ARPhoto) => {
    setSelectedARPhoto(photo);
    setArTitle(photo.title || photo.tattooTitle);
    setArDescription(photo.description || "");
    setPostSuccess("");
  };

  const handleSaveARPhoto = () => {
    if (!selectedARPhoto) return;
    storage.updateARPhoto(selectedARPhoto.id, {
      title: arTitle,
      description: arDescription,
    });
    loadData();
    setSelectedARPhoto(null);
  };

  const handleDownloadARPhoto = () => {
    if (!selectedARPhoto) return;
    const link = document.createElement("a");
    link.href = selectedARPhoto.imageUrl;
    link.download = `${arTitle || "ar-photo"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePostToExplore = () => {
    if (!selectedARPhoto) return;

    // Try to get the tattoo design URL - check the AR photo first, then look up from library
    let tattooDesignUrl = selectedARPhoto.tattooImageUrl;

    if (!tattooDesignUrl) {
      // Fallback: look up the original tattoo from saved library items
      const libraryItem = libraryItems.find((item) => item.id === selectedARPhoto.tattooId);
      if (libraryItem) {
        tattooDesignUrl = libraryItem.imageUrl;
      }
    }

    if (!tattooDesignUrl) {
      // Last resort: use the AR photo itself
      tattooDesignUrl = selectedARPhoto.imageUrl;
    }

    const success = storage.addCommunityPost({
      id: `community-${Date.now()}`,
      tattooImageUrl: tattooDesignUrl,
      arPhotoUrl: "",
      title: arTitle || selectedARPhoto.tattooTitle,
      description: arDescription,
      postedAt: new Date().toISOString(),
    });

    if (success) {
      setPostSuccess("success");
      setTimeout(() => {
        setPostSuccess("");
        setSelectedARPhoto(null);
      }, 2000);
    } else {
      setPostSuccess("error");
      setTimeout(() => setPostSuccess(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-28 text-white md:pb-12 md:pl-[7.25rem]">
      <Header title="Your Library" />

      <div className="mx-auto max-w-7xl px-4 mt-6">
        {/* Tabs + Upload in one row */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("tattoos")}
            className={`flex-1 rounded-lg border border-white/25 px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)] ${
              activeTab === "tattoos"
                ? "bg-white text-black"
                : "bg-neutral-950 text-white"
            }`}
          >
            Saved Tattoos ({libraryItems.length})
          </button>
          <button
            onClick={() => setActiveTab("ar")}
            className={`flex-1 rounded-lg border border-white/25 px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)] ${
              activeTab === "ar" ? "bg-white text-black" : "bg-neutral-950 text-white"
            }`}
          >
            AR Photos ({arPhotos.length})
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="flex-1 rounded-lg border border-white/25 bg-black px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)] flex items-center justify-center gap-1.5 hover:bg-neutral-950 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Tattoo
          </button>
        </div>

        {/* Saved Tattoos Tab */}
        {activeTab === "tattoos" && (
          <div>
            {libraryItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="celestial-muted mb-4 font-sans text-xl font-semibold text-white/60">
                  No saved tattoos yet
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className="rounded-lg border border-white/25 bg-white px-6 py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.15)]"
                >
                  Explore Tattoos
                </button>
              </div>
            ) : fromArCameraChange ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {libraryItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-lg border-2 border-[rgba(201,162,39,0.55)] bg-black shadow-[4px_4px_0px_0px_rgba(143,98,20,0.28)]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (fromArCameraChange) {
                          setArChangeSelectedId(item.id);
                          return;
                        }
                        handleEditDescription(item);
                      }}
                      className="block w-full text-left"
                    >
                      <div className="flex aspect-square items-center justify-center bg-white p-2 sm:p-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="max-h-full w-full object-contain"
                        />
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/ar-camera/${item.id}`)}
                      className={`library-ar-change-plus flex w-full items-center justify-center border-t border-[rgba(201,162,39,0.55)] py-2.5 ${
                        arChangeSelectedId === item.id
                          ? "library-ar-change-plus--selected"
                          : "bg-black text-white"
                      }`}
                      aria-label={`Use ${item.title} in AR camera`}
                      aria-pressed={arChangeSelectedId === item.id}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
                <Masonry gutter="16px">
                  {libraryItems.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleEditDescription(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleEditDescription(item);
                        }
                      }}
                      className="library-tattoo-card cursor-pointer overflow-hidden rounded-lg border border-white/25 bg-black transition-[transform,box-shadow,border-color] duration-150 outline-none active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-center bg-black p-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-auto w-full object-contain"
                          style={{ minHeight: "100px" }}
                        />
                      </div>
                      <div className="border-t border-white/15 bg-black p-2">
                        <p className="celestial-body font-['Fugaz_One:Regular',sans-serif] text-sm text-white">
                          {item.title}
                        </p>
                        {item.savedDescription && (
                          <p className="celestial-muted mt-1 text-xs text-white/90">
                            {item.savedDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </div>
        )}

        {/* AR Photos Tab */}
        {activeTab === "ar" && (
          <div>
            {arPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="celestial-muted mb-4 font-sans text-xl font-semibold text-white/60">
                  No AR photos yet
                </p>
                <button
                  onClick={() => navigate("/ar-camera")}
                  className="rounded-lg border border-white/25 bg-white px-6 py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.15)]"
                >
                  Try AR Camera
                </button>
              </div>
            ) : (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
                <Masonry gutter="16px">
                  {arPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => openARPhotoModal(photo)}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/25 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)] transition-transform hover:scale-[1.02]"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || photo.tattooTitle}
                        className="h-auto w-full object-cover"
                      />
                      <div className="border-t border-white/15 bg-black p-2">
                        <p className="celestial-body font-['Fugaz_One:Regular',sans-serif] text-sm text-white">
                          {photo.title || photo.tattooTitle}
                        </p>
                        <p className="celestial-muted text-xs text-white/80">
                          {new Date(photo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </div>
        )}
      </div>

      {/* Edit Description Modal (Tattoo Designs) */}
      {editingDescription && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative flex min-h-0 max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-white/20 bg-neutral-950 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.12)]">
            <button
              onClick={() => {
                setEditingDescription(false);
                setSelectedItem(null);
              }}
              className="absolute right-5 top-4 z-20"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <CelestialModalScrollWithRail
              key={selectedItem.id}
              scrollClassName="celestial-modal-scroll celestial-modal-scroll--with-rail min-h-0 flex-1 overflow-y-scroll p-8 pr-4 pt-14"
            >
              <div className="mb-4 overflow-hidden rounded-lg border border-white/20">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="h-48 w-full object-cover"
                />
              </div>
              <h2 className="celestial-label mb-2 font-['Fugaz_One:Regular',sans-serif] text-xl text-white">
                {selectedItem.title}
              </h2>
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Add your notes about this tattoo..."
                className="mb-4 w-full rounded-lg border border-white/20 bg-black p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                rows={4}
              />
              <div className="library-edit-actions flex gap-3">
                <button
                  onClick={handleSaveDescription}
                  className="flex-1 rounded-lg border border-white/25 bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTattoo(selectedItem.id)}
                  className="flex shrink-0 items-center justify-center rounded-lg border border-white/25 bg-black p-3 text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                  title="Delete tattoo"
                  aria-label="Delete tattoo"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate(`/ar-camera/${selectedItem.id}`)}
                  className="flex-1 rounded-lg border border-white/25 bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                >
                  Try On
                </button>
              </div>
            </CelestialModalScrollWithRail>
          </div>
        </div>
      )}

      {/* AR Photo Detail Modal */}
      {selectedARPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative flex min-h-0 max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-white/20 bg-neutral-950 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.12)]">
            <button
              onClick={() => setSelectedARPhoto(null)}
              className="absolute right-5 top-4 z-20"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <CelestialModalScrollWithRail
              key={selectedARPhoto.id}
              scrollClassName="celestial-modal-scroll celestial-modal-scroll--with-rail min-h-0 flex-1 overflow-y-scroll p-6 pb-6 pr-3 pt-14"
            >
              {/* AR Photo Preview */}
              <div className="mb-4 overflow-hidden rounded-lg border border-white/20">
                <img
                  src={selectedARPhoto.imageUrl}
                  alt={arTitle}
                  className="h-auto w-full object-contain"
                />
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={arTitle}
                onChange={(e) => setArTitle(e.target.value)}
                placeholder="Give your photo a title..."
                className="mb-3 w-full rounded-lg border border-white/20 bg-black px-4 py-3 font-['Fugaz_One:Regular',sans-serif] text-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />

              {/* Description Input */}
              <textarea
                value={arDescription}
                onChange={(e) => setArDescription(e.target.value)}
                placeholder="Add your notes about this AR photo..."
                className="mb-4 w-full rounded-lg border border-white/20 bg-black p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                rows={3}
              />

              {/* Date */}
              <p className="celestial-muted mb-4 font-sans text-sm font-semibold">
                Captured on{" "}
                {new Date(selectedARPhoto.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {/* Success banner */}
              {postSuccess === "success" && (
                <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-950 p-3 text-center">
                  <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-emerald-100">
                    Posted to Explore! Others can now try this design.
                  </p>
                </div>
              )}

              {/* Error banner */}
              {postSuccess === "error" && (
                <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950 p-3 text-center">
                  <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-red-100">
                    Error posting to Explore. Please try again.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveARPhoto}
                  className="flex-1 rounded-lg border border-white/25 bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                >
                  Save
                </button>
                <button
                  onClick={handleDownloadARPhoto}
                  className="rounded-lg border border-white/25 bg-black p-3 text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={handlePostToExplore}
                  className="flex items-center gap-2 rounded-lg border border-white/25 bg-neutral-950 px-4 py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                  title="Post tattoo design to Explore"
                >
                  <Share2 className="h-5 w-5" />
                  Post to Explore
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteARPhoto(selectedARPhoto.id)}
                  className="rounded-lg border border-white/25 bg-black p-3 text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" aria-hidden />
                </button>
              </div>

              {/* Info note about posting */}
              <p className="celestial-muted mt-3 text-balance text-center font-sans text-[10px] font-normal leading-snug sm:text-[11px]">
                Posting shares the tattoo design (not your AR photo) so others can try it in AR too.
              </p>
            </CelestialModalScrollWithRail>
          </div>
        </div>
      )}

    </div>
  );
}