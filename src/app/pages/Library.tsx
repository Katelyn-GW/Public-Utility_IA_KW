import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2, X, Upload, Download, Share2 } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Header from "../components/Header";
import { storage } from "../utils/storage";
import { LibraryItem, ARPhoto } from "../types/tattoo";

export default function Library() {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadData();
  }, []);

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
    <div className="min-h-screen bg-[#8dd7ca] pb-12">
      <Header title="Your Library" bannerImage="library" />

      <div className="mx-auto max-w-7xl px-4 mt-6">
        {/* Tabs + Upload in one row */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("tattoos")}
            className={`flex-1 rounded-lg border-2 border-black px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "tattoos"
                ? "bg-[#028a7b] text-white"
                : "bg-[#ead3b2]"
            }`}
          >
            Saved Tattoos ({libraryItems.length})
          </button>
          <button
            onClick={() => setActiveTab("ar")}
            className={`flex-1 rounded-lg border-2 border-black px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] ${
              activeTab === "ar" ? "bg-[#028a7b] text-white" : "bg-[#ead3b2]"
            }`}
          >
            AR Photos ({arPhotos.length})
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="flex-1 rounded-lg border-2 border-black bg-[#8dd7ca] px-2 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 hover:bg-[#7cc9bc] transition-colors"
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
                <p className="mb-4 font-['Fugaz_One:Regular',sans-serif] text-xl text-black/60">
                  No saved tattoos yet
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className="rounded-lg border-2 border-black bg-[#028a7b] px-6 py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Explore Tattoos
                </button>
              </div>
            ) : (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
                <Masonry gutter="16px">
                  {libraryItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-lg border-4 border-[#028a7b] bg-[#f5efe3] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex items-center justify-center bg-[#f5efe3] p-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-auto w-full object-contain"
                          style={{ minHeight: "100px" }}
                        />
                      </div>
                      <div className="bg-[#028a7b] p-2">
                        <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-white">
                          {item.title}
                        </p>
                        {item.savedDescription && (
                          <p className="mt-1 text-xs text-white/90">
                            {item.savedDescription}
                          </p>
                        )}
                      </div>
                      <div className="absolute bottom-14 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEditDescription(item)}
                          className="rounded-full bg-white p-2 shadow-lg"
                        >
                          <Pencil className="h-4 w-4 text-black" />
                        </button>
                        <button
                          onClick={() => navigate(`/ar-camera/${item.id}`)}
                          className="rounded-full bg-[#028a7b] p-2 shadow-lg"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
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
                <p className="mb-4 font-['Fugaz_One:Regular',sans-serif] text-xl text-black/60">
                  No AR photos yet
                </p>
                <button
                  onClick={() => navigate("/ar-camera")}
                  className="rounded-lg border-2 border-black bg-[#028a7b] px-6 py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
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
                      className="group relative cursor-pointer overflow-hidden rounded-lg border-4 border-[#028a7b] bg-[#72aea3] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02]"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || photo.tattooTitle}
                        className="h-auto w-full object-cover"
                      />
                      <div className="bg-[#028a7b] p-2">
                        <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-white">
                          {photo.title || photo.tattooTitle}
                        </p>
                        <p className="text-xs text-white/80">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-lg border-4 border-[#028a7b] bg-[#ead3b2] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
            <button
              onClick={() => {
                setEditingDescription(false);
                setSelectedItem(null);
              }}
              className="absolute right-4 top-4"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mb-4 overflow-hidden rounded-lg border-4 border-[#028a7b]">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="h-48 w-full object-cover"
              />
            </div>
            <h2 className="mb-2 font-['Fugaz_One:Regular',sans-serif] text-xl">
              {selectedItem.title}
            </h2>
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Add your notes about this tattoo..."
              className="mb-4 w-full rounded-lg border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#028a7b]"
              rows={4}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setEditingDescription(false);
                  setSelectedItem(null);
                }}
                className="flex-1 rounded-lg border-2 border-black bg-[#ead3b2] py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDescription}
                className="flex-1 rounded-lg border-2 border-black bg-[#028a7b] py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Save
              </button>
              <button
                onClick={() => handleDeleteTattoo(selectedItem.id)}
                className="rounded-lg border-2 border-black bg-red-500 px-4 py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Photo Detail Modal */}
      {selectedARPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border-4 border-[#028a7b] bg-[#ead3b2] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
            <button
              onClick={() => setSelectedARPhoto(null)}
              className="absolute right-4 top-4 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* AR Photo Preview */}
            <div className="mb-4 overflow-hidden rounded-lg border-4 border-[#028a7b]">
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
              className="mb-3 w-full rounded-lg border-2 border-black px-4 py-3 font-['Fugaz_One:Regular',sans-serif] text-lg focus:outline-none focus:ring-2 focus:ring-[#028a7b]"
            />

            {/* Description Input */}
            <textarea
              value={arDescription}
              onChange={(e) => setArDescription(e.target.value)}
              placeholder="Add your notes about this AR photo..."
              className="mb-4 w-full rounded-lg border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#028a7b]"
              rows={3}
            />

            {/* Date */}
            <p className="mb-4 text-sm text-black/60">
              Captured on{" "}
              {new Date(selectedARPhoto.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Success banner */}
            {postSuccess === "success" && (
              <div className="mb-4 rounded-lg border-2 border-green-600 bg-green-100 p-3 text-center">
                <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-green-800">
                  Posted to Explore! Others can now try this design.
                </p>
              </div>
            )}

            {/* Error banner */}
            {postSuccess === "error" && (
              <div className="mb-4 rounded-lg border-2 border-red-600 bg-red-100 p-3 text-center">
                <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-red-800">
                  Error posting to Explore. Please try again.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveARPhoto}
                className="flex-1 rounded-lg border-2 border-black bg-[#028a7b] py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Save
              </button>
              <button
                onClick={handleDownloadARPhoto}
                className="rounded-lg border-2 border-black bg-[#ead3b2] p-3 shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handlePostToExplore}
                className="rounded-lg border-2 border-black bg-[#8dd7ca] px-4 py-3 font-['Fugaz_One:Regular',sans-serif] shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                title="Post tattoo design to Explore"
              >
                <Share2 className="h-5 w-5" />
                Post to Explore
              </button>
              <button
                onClick={() => handleDeleteARPhoto(selectedARPhoto.id)}
                className="rounded-lg border-2 border-black bg-red-500 p-3 shadow-[2px_4px_0px_0px_rgba(0,0,0,1)]"
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Info note about posting */}
            <p className="mt-3 text-xs text-black/50 text-center">
              Posting shares the <strong>tattoo design</strong> (not your AR
              photo) so others can try it in AR too.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}